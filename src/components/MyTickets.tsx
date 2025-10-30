import { Lock, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAccount } from 'wagmi';

// Mock data
const mockTickets = [
  { id: '1', round: 42, numbers: ['12', '34', '56', '78', '90', '23'], status: 'encrypted', timestamp: '2025-10-25 14:23' },
  { id: '2', round: 42, numbers: ['45', '67', '89', '01', '23', '45'], status: 'encrypted', timestamp: '2025-10-25 15:01' },
  { id: '3', round: 41, numbers: ['11', '22', '33', '44', '55', '66'], status: 'lost', timestamp: '2025-10-20 18:45' },
];

export const MyTickets = () => {
  const { isConnected } = useAccount();

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
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">My Tickets</h2>
          <p className="text-muted-foreground">View your encrypted lottery tickets</p>
        </div>

        <div className="space-y-4">
          {mockTickets.map((ticket) => (
            <Card key={ticket.id} className="border-border/50 bg-card/50 backdrop-blur hover:border-primary/30 transition-colors">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    Round #{ticket.round}
                    {ticket.status === 'encrypted' ? (
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                        <Lock className="w-3 h-3 mr-1" />
                        Encrypted
                      </Badge>
                    ) : ticket.status === 'won' ? (
                      <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30">
                        Winner
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
                    {ticket.numbers.map((num, idx) => (
                      <div
                        key={idx}
                        className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg border
                          ${ticket.status === 'encrypted' 
                            ? 'bg-primary/10 border-primary/30 text-primary' 
                            : 'bg-muted border-border/50'
                          }`}
                      >
                        {ticket.status === 'encrypted' ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          num
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {ticket.status === 'encrypted' && (
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
      </div>
    </section>
  );
};
