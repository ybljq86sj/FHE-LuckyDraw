import { Trophy, Users, Coins } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Mock data
const pastRounds = [
  { round: 41, winners: 3, prize: '45 ETH', date: '2025-10-20', winningNumbers: ['11', '23', '45', '67', '89', '90'] },
  { round: 40, winners: 1, prize: '52 ETH', date: '2025-10-15', winningNumbers: ['02', '14', '26', '38', '50', '72'] },
  { round: 39, winners: 5, prize: '38 ETH', date: '2025-10-10', winningNumbers: ['05', '17', '29', '41', '53', '85'] },
];

export const RoundHistory = () => {
  return (
    <section id="history" className="py-20 relative z-10">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Past Rounds</h2>
          <p className="text-muted-foreground">All draws are verified on-chain with FHE technology</p>
        </div>

        <div className="space-y-6">
          {pastRounds.map((round) => (
            <Card key={round.round} className="border-border/50 bg-card/50 backdrop-blur">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl mb-1">Round #{round.round}</CardTitle>
                    <p className="text-sm text-muted-foreground">{round.date}</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-lg border border-accent/30">
                      <Trophy className="w-4 h-4 text-accent" />
                      <div>
                        <div className="text-xs text-muted-foreground">Winners</div>
                        <div className="font-bold text-accent">{round.winners}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg border border-primary/30">
                      <Coins className="w-4 h-4 text-primary" />
                      <div>
                        <div className="text-xs text-muted-foreground">Prize Pool</div>
                        <div className="font-bold text-primary">{round.prize}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Winning Numbers</label>
                    <div className="flex gap-3">
                      {round.winningNumbers.map((num, idx) => (
                        <div
                          key={idx}
                          className="w-14 h-14 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-xl text-primary-foreground"
                          style={{ boxShadow: 'var(--shadow-neon)' }}
                        >
                          {num}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
