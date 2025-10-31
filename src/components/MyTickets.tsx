import { Lock, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAccount, useReadContract, usePublicClient, useBlockNumber } from 'wagmi';
import { CONTRACTS, ABIS } from '@/config/contracts';
import { useEffect, useState } from 'react';

interface Ticket {
  ticketId: bigint;
  roundId: bigint;
  claimed: boolean;
  roundDrawn: boolean;
  winningNumber: number;
  timestamp: string;
}

export const MyTickets = () => {
  const { address, isConnected } = useAccount();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const publicClient = usePublicClient();
  
  // Watch for new blocks to auto-refresh
  const { data: blockNumber } = useBlockNumber({ watch: true });

  // Get total round count
  const { data: roundCount, refetch: refetchRoundCount } = useReadContract({
    address: CONTRACTS.FHELottery,
    abi: ABIS.FHELottery,
    functionName: 'roundCount',
  });

  // Fetch user tickets from all rounds
  const fetchTickets = async (showRefreshIndicator = false) => {
    if (!address || !roundCount || !publicClient) {
      setIsLoading(false);
      return;
    }

    if (showRefreshIndicator) {
      setRefreshing(true);
    } else {
      setIsLoading(true);
    }

    const allTickets: Ticket[] = [];

    try {
      console.log('[MyTickets] Fetching tickets for address:', address);
      console.log('[MyTickets] Total rounds:', roundCount.toString());

      // Iterate through all rounds
      for (let i = 0; i < Number(roundCount); i++) {
        console.log(`[MyTickets] Checking round ${i}`);

        // Get round info first to know total ticket count
        const roundInfo = await publicClient.readContract({
          address: CONTRACTS.FHELottery,
          abi: ABIS.FHELottery,
          functionName: 'getRound',
          args: [BigInt(i)],
        }) as [string, number, bigint, boolean, bigint];

        const [, winningNumber, drawTime, drawn, ticketCount] = roundInfo;
        console.log(`[MyTickets] Round ${i} has ${ticketCount.toString()} tickets`);

        // Check each ticket in this round
        for (let ticketId = 0; ticketId < Number(ticketCount); ticketId++) {
          const ticketInfo = await publicClient.readContract({
            address: CONTRACTS.FHELottery,
            abi: ABIS.FHELottery,
            functionName: 'getTicketInfo',
            args: [BigInt(i), BigInt(ticketId)],
          }) as [string, boolean];

          const [buyer, claimed] = ticketInfo;

          // Check if this ticket belongs to the user
          if (buyer.toLowerCase() === address.toLowerCase()) {
            console.log(`[MyTickets] Found user ticket: Round ${i}, Ticket ${ticketId}`);

            // Use draw time as timestamp since we can't easily get exact purchase time
            const timestamp = new Date(Number(drawTime) * 1000).toLocaleString();

            allTickets.push({
              ticketId: BigInt(ticketId),
              roundId: BigInt(i),
              claimed,
              roundDrawn: drawn,
              winningNumber,
              timestamp,
            });
          }
        }
      }

      console.log('[MyTickets] Total tickets found:', allTickets.length);
      setTickets(allTickets);
    } catch (error) {
      console.error('[MyTickets] Error fetching tickets:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [address, roundCount, publicClient]);

  // Auto-refresh when new block arrives
  useEffect(() => {
    if (blockNumber && address && roundCount && publicClient) {
      console.log('[MyTickets] New block detected, refreshing...', blockNumber);
      fetchTickets(true);
    }
  }, [blockNumber]);

  const handleManualRefresh = () => {
    refetchRoundCount();
    fetchTickets(true);
  };

  if (!isConnected) {
    return (
      <section id="tickets" className="py-20 relative z-10">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="border-border/50 bg-card/50 backdrop-blur text-center py-12">
            <CardContent>
              <Lock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Connect Wallet to View Your Tickets</h3>
              <p className="text-muted-foreground">Your encrypted tickets will be displayed here</p>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section id="tickets" className="py-20 relative z-10">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">My Tickets</h2>
            <p className="text-muted-foreground">View your encrypted lottery tickets</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {isLoading ? (
          <Card className="border-border/50 bg-card/50 backdrop-blur text-center py-12">
            <CardContent>
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your tickets...</p>
            </CardContent>
          </Card>
        ) : tickets.length === 0 ? (
          <Card className="border-border/50 bg-card/50 backdrop-blur text-center py-12">
            <CardContent>
              <p className="text-muted-foreground">You don't have any tickets yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Connected wallet: {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <Card key={`${ticket.roundId}-${ticket.ticketId}`} className="border-border/50 bg-card/50 backdrop-blur hover:border-primary/30 transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      Round #{ticket.roundId.toString()}
                      {!ticket.roundDrawn ? (
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                          <Lock className="w-3 h-3 mr-1" />
                          Encrypted
                        </Badge>
                      ) : ticket.claimed ? (
                        <Badge variant="outline" className="bg-muted text-muted-foreground border-border">
                          Claimed
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-muted text-muted-foreground border-border">
                          Not Won
                        </Badge>
                      )}
                    </CardTitle>
                    <span className="text-sm text-muted-foreground">{ticket.timestamp}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {!ticket.roundDrawn ? (
                        // Show encrypted placeholders for active rounds
                        Array.from({ length: 6 }).map((_, idx) => (
                          <div
                            key={idx}
                            className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg border bg-primary/10 border-primary/30 text-primary"
                          >
                            <EyeOff className="w-4 h-4" />
                          </div>
                        ))
                      ) : (
                        // Show ticket ID as number for drawn rounds
                        <div className="flex items-center gap-4">
                          <div className="text-sm text-muted-foreground">
                            Ticket #{ticket.ticketId.toString()}
                          </div>
                          {ticket.winningNumber > 0 && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">Winning #:</span>
                              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-lg text-primary-foreground">
                                {ticket.winningNumber}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {!ticket.roundDrawn && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Lock className="w-4 h-4" />
                        <span>Awaiting draw</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
