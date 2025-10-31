import { Trophy, Users, Coins } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useReadContract, usePublicClient } from 'wagmi';
import { CONTRACTS, ABIS } from '@/config/contracts';
import { useEffect, useState } from 'react';

interface Round {
  roundId: bigint;
  name: string;
  winningNumber: number;
  drawn: boolean;
  ticketCount: bigint;
  date: string;
}

export const RoundHistory = () => {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const publicClient = usePublicClient();

  // Get total round count
  const { data: roundCount } = useReadContract({
    address: CONTRACTS.FHELottery,
    abi: ABIS.FHELottery,
    functionName: 'roundCount',
  });

  // Fetch past rounds that have been drawn
  useEffect(() => {
    const fetchRounds = async () => {
      if (!roundCount || !publicClient) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const pastRounds: Round[] = [];

      try {
        // Iterate through all rounds
        for (let i = 0; i < Number(roundCount); i++) {
          // Get round info
          const roundInfo = await publicClient.readContract({
            address: CONTRACTS.FHELottery,
            abi: ABIS.FHELottery,
            functionName: 'getRound',
            args: [BigInt(i)],
          }) as [string, number, bigint, boolean, bigint];

          const [name, winningNumber, drawTime, drawn, ticketCount] = roundInfo;

          // Only include drawn rounds in history
          if (drawn) {
            // Get RoundDrawn event for timestamp
            const logs = await publicClient.getLogs({
              address: CONTRACTS.FHELottery,
              event: {
                type: 'event',
                name: 'RoundDrawn',
                inputs: [
                  { type: 'uint256', indexed: true, name: 'roundId' },
                  { type: 'uint32', indexed: false, name: 'winningNumber' },
                ],
              },
              args: {
                roundId: BigInt(i),
              },
              fromBlock: 0n,
              toBlock: 'latest',
            });

            let date = 'Unknown';
            if (logs.length > 0) {
              const block = await publicClient.getBlock({ blockNumber: logs[0].blockNumber });
              date = new Date(Number(block.timestamp) * 1000).toLocaleDateString();
            } else if (drawTime) {
              // Fallback to drawTime if event not found
              date = new Date(Number(drawTime) * 1000).toLocaleDateString();
            }

            pastRounds.push({
              roundId: BigInt(i),
              name,
              winningNumber,
              drawn,
              ticketCount,
              date,
            });
          }
        }

        // Sort by round ID descending (newest first)
        pastRounds.sort((a, b) => Number(b.roundId) - Number(a.roundId));
        setRounds(pastRounds);
      } catch (error) {
        console.error('Error fetching rounds:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRounds();
  }, [roundCount, publicClient]);

  return (
    <section id="history" className="py-20 relative z-10">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Past Rounds</h2>
          <p className="text-muted-foreground">All draws are verified on-chain with FHE technology</p>
        </div>

        {isLoading ? (
          <Card className="border-border/50 bg-card/50 backdrop-blur text-center py-12">
            <CardContent>
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading past rounds...</p>
            </CardContent>
          </Card>
        ) : rounds.length === 0 ? (
          <Card className="border-border/50 bg-card/50 backdrop-blur text-center py-12">
            <CardContent>
              <p className="text-muted-foreground">No completed rounds yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {rounds.map((round) => (
              <Card key={round.roundId.toString()} className="border-border/50 bg-card/50 backdrop-blur">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-2xl mb-1">
                        Round #{round.roundId.toString()}: {round.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">{round.date}</p>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-lg border border-accent/30">
                        <Users className="w-4 h-4 text-accent" />
                        <div>
                          <div className="text-xs text-muted-foreground">Participants</div>
                          <div className="font-bold text-accent">{round.ticketCount.toString()}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Winning Number</label>
                      <div className="flex gap-3">
                        <div
                          className="w-14 h-14 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-xl text-primary-foreground"
                          style={{ boxShadow: 'var(--shadow-neon)' }}
                        >
                          {round.winningNumber}
                        </div>
                      </div>
                    </div>
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
