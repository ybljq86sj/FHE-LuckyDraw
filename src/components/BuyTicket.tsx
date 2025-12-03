import { useState, useEffect } from 'react';
import { Lock, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useAccount, useWriteContract, usePublicClient, useReadContract } from 'wagmi';
import { CONTRACTS, ABIS } from '@/config/contracts';
import { encryptNumber, initializeFHE } from '@/lib/fhe';
import {
  toastTxPending,
  toastTxSuccess,
  toastTxError,
  toastUserRejected,
  toastEncrypting,
  dismissEncryptingToast,
} from '@/lib/toast-utils';

export const BuyTicket = () => {
  const [numbers, setNumbers] = useState(['', '', '', '', '', '']);
  const [buying, setBuying] = useState(false);
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  // Get current round ID
  const { data: roundCount } = useReadContract({
    address: CONTRACTS.FHELottery,
    abi: ABIS.FHELottery,
    functionName: 'roundCount',
  });

  const hasRound = typeof roundCount === 'bigint' && roundCount > 0n;
  const currentRoundId = hasRound ? Number(roundCount - 1n) : null;
  const roundArgs = currentRoundId !== null ? [BigInt(currentRoundId)] as const : undefined;

  const { data: roundData } = useReadContract({
    address: CONTRACTS.FHELottery,
    abi: ABIS.FHELottery,
    functionName: 'getRound',
    args: roundArgs,
    query: {
      enabled: !!roundArgs,
    },
  });

  const nowSeconds = Math.floor(Date.now() / 1000);
  const roundDrawn = Boolean(roundData?.[3]);
  const drawTime = roundData ? Number(roundData[2]) : null;
  const isRoundLoading = currentRoundId !== null && roundData === undefined;
  const roundClosed = drawTime !== null && drawTime !== 0 && drawTime <= nowSeconds;
  const drawTimeLabel = drawTime ? new Date(drawTime * 1000).toLocaleString() : '';
  const canPurchase =
    isConnected &&
    !buying &&
    currentRoundId !== null &&
    !roundDrawn &&
    !roundClosed &&
    !isRoundLoading;
  const buttonLabel = !isConnected
    ? 'Connect Wallet to Continue'
    : currentRoundId === null
      ? 'Awaiting Next Round'
      : isRoundLoading
        ? 'Loading round data...'
        : roundDrawn
          ? 'Round Already Drawn'
          : roundClosed
            ? 'Round Closed'
            : 'Buy & Encrypt Ticket';

  // Initialize FHE SDK on mount
  useEffect(() => {
    if (isConnected) {
      initializeFHE().catch((err) => {
        console.error('[BuyTicket] FHE init failed:', err);
      });
    }
  }, [isConnected]);

  const handleNumberChange = (index: number, value: string) => {
    if (value === '' || (/^\d+$/.test(value) && parseInt(value) <= 99)) {
      const newNumbers = [...numbers];
      newNumbers[index] = value;
      setNumbers(newNumbers);
    }
  };

  const handleBuyTicket = async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (currentRoundId === null) {
      toast.error('No active round available', {
        description: 'Please wait for the admin to create a new lottery round.',
      });
      return;
    }

    if (isRoundLoading) {
      toast.error('Round data is still loading', {
        description: 'Please wait a moment and try again.',
      });
      return;
    }

    if (roundDrawn) {
      toast.error('This round has already been drawn', {
        description: 'New tickets can only be purchased once the next round starts.',
      });
      return;
    }

    if (roundClosed) {
      toast.error('Ticket sales for this round have closed', {
        description: drawTimeLabel ? `Sales closed at ${drawTimeLabel}.` : undefined,
      });
      return;
    }

    if (numbers.some(n => n === '')) {
      toast.error('Please fill in all numbers (0-99)');
      return;
    }

    setBuying(true);
    let txHash: `0x${string}` | undefined;

    try {
      // Convert 6 numbers to a single uint32 using bit packing
      // Each number is 0-99, needs 7 bits (max 127)
      // We can fit 4 numbers in 28 bits, so we'll hash the combination
      // Simple hash: sum all numbers and use position weights
      let combinedNumber = 0;
      for (let i = 0; i < numbers.length; i++) {
        const num = parseInt(numbers[i]);
        // Use bit shifting to pack numbers (each takes ~7 bits)
        combinedNumber += num * (1 << (i * 5)); // 5 bits per number = 30 bits total for 6 numbers
      }

      // Ensure it fits in uint32
      combinedNumber = combinedNumber & 0xFFFFFFFF;

      console.log('[BuyTicket] Combined number:', combinedNumber, 'from', numbers);

      // Show encrypting toast
      toastEncrypting();

      // Encrypt the combined number
      const { encryptedNumber, proof } = await encryptNumber(
        combinedNumber,
        CONTRACTS.FHELottery,
        address
      );

      console.log('[BuyTicket] Encrypted:', {
        original: combinedNumber,
        encrypted: encryptedNumber,
        proofLength: proof.length
      });

      // Dismiss encrypting toast
      dismissEncryptingToast();

      const roundIdBigInt = BigInt(currentRoundId);

      // Buy ticket on-chain
      txHash = await writeContractAsync({
        address: CONTRACTS.FHELottery,
        abi: ABIS.FHELottery,
        functionName: 'buyTicket',
        args: [roundIdBigInt, encryptedNumber, proof],
      });

      // Show pending toast with link
      toastTxPending(txHash);

      const receipt = await publicClient!.waitForTransactionReceipt({
        hash: txHash,
        confirmations: 1,
      });

      if (receipt.status === 'success') {
        toastTxSuccess(txHash, `Ticket purchased for Round #${currentRoundId}!`);
        setNumbers(['', '', '', '', '', '']);
      } else {
        toastTxError(txHash, 'Transaction reverted on chain');
      }
    } catch (error: any) {
      console.error('[BuyTicket] Error:', error);
      dismissEncryptingToast();

      // Check if user rejected the transaction
      if (error.message?.includes('User rejected') || error.message?.includes('user rejected')) {
        toastUserRejected();
      } else {
        toastTxError(txHash, error);
      }
    } finally {
      setBuying(false);
    }
  };

  return (
    <section className="py-20 relative z-10">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card className="border-primary/30 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              Buy Encrypted Ticket
            </CardTitle>
            <CardDescription className="flex items-center gap-2 text-base">
              <Lock className="w-4 h-4" />
              Your numbers will be encrypted before submission
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <label className="text-sm font-medium">
                Choose 6 numbers (0-99)
              </label>

              {!hasRound && (
                <div className="flex items-start gap-3 rounded-lg border border-dashed border-border/50 bg-muted/40 p-4">
                  <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">No active round right now</p>
                    <p>Tickets can be purchased after the administrator creates a new round.</p>
                  </div>
                </div>
              )}

              {hasRound && roundDrawn && (
                <div className="flex items-start gap-3 rounded-lg border border-border/50 bg-muted/40 p-4">
                  <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">This round has already been drawn</p>
                    <p>New tickets will be available once the next round is created.</p>
                  </div>
                </div>
              )}

              {hasRound && !roundDrawn && roundClosed && (
                <div className="flex items-start gap-3 rounded-lg border border-border/50 bg-muted/40 p-4">
                  <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">Ticket sales are closed</p>
                    <p>
                      {drawTimeLabel
                        ? `Sales closed at ${drawTimeLabel}.`
                        : 'The draw time has passed, please wait for the next round.'}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                {numbers.map((num, index) => (
                  <div key={index} className="relative">
                    <Input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={num}
                      onChange={(e) => handleNumberChange(index, e.target.value)}
                      placeholder="00"
                      maxLength={2}
                      className="text-center text-2xl font-bold h-16 bg-muted border-border/50 focus:border-primary"
                    />
                    {num && (
                      <Lock className="absolute -top-1 -right-1 w-4 h-4 text-accent" />
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-muted/50 rounded-lg p-4 space-y-2 border border-border/50">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Ticket Price</span>
                <span className="font-semibold">0.01 ETH</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Encryption Fee</span>
                <span className="font-semibold">0.001 ETH</span>
              </div>
              <div className="h-px bg-border/50 my-2" />
              <div className="flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-primary">0.011 ETH</span>
              </div>
            </div>
            
            <Button
              onClick={handleBuyTicket}
              disabled={!canPurchase}
              className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
              style={{ boxShadow: 'var(--shadow-neon)' }}
            >
              {buying ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Encrypting & Buying...
                </>
              ) : buttonLabel}
            </Button>
            
            <div className="flex items-start gap-3 p-4 bg-accent/10 rounded-lg border border-accent/30">
              <ShieldCheck className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
              <div className="text-sm space-y-1">
                <p className="font-medium text-accent">Privacy Guaranteed</p>
                <p className="text-muted-foreground">
                  Your numbers are encrypted using FHE before being stored on-chain. 
                  No one, including administrators, can see your numbers until after the draw.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
