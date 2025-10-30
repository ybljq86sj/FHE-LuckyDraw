import { Timer, Users, Coins } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const CurrentRound = () => {
  return (
    <section id="play" className="py-20 relative z-10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            Current Round
            <span className="ml-3 text-primary">#42</span>
          </h2>
          <p className="text-muted-foreground">Join now and submit your encrypted numbers</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={<Timer className="w-5 h-5" />}
            label="Time Remaining"
            value="23:45:12"
            gradient="from-primary to-cyan-400"
          />
          <StatCard
            icon={<Users className="w-5 h-5" />}
            label="Total Players"
            value="1,247"
            gradient="from-accent to-green-400"
          />
          <StatCard
            icon={<Coins className="w-5 h-5" />}
            label="Prize Pool"
            value="50 ETH"
            gradient="from-purple-400 to-primary"
          />
        </div>
        
        <Card className="border-primary/30 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>Round Status</span>
              <span className="text-sm font-normal px-3 py-1 bg-accent/20 text-accent rounded-full border border-accent/30">
                Open
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-border/50">
              <span className="text-muted-foreground">Drawing Date</span>
              <span className="font-semibold">Dec 31, 2025 - 18:00 UTC</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-border/50">
              <span className="text-muted-foreground">Ticket Price</span>
              <span className="font-semibold">0.01 ETH</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-muted-foreground">Total Tickets Sold</span>
              <span className="font-semibold">3,842</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

const StatCard = ({ 
  icon, 
  label, 
  value, 
  gradient 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  gradient: string;
}) => {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur hover:border-primary/50 transition-colors">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-lg bg-gradient-to-br ${gradient} bg-opacity-10`}>
            <div className={`text-transparent bg-gradient-to-br ${gradient} bg-clip-text`}>
              {icon}
            </div>
          </div>
        </div>
        <div className="text-3xl font-bold mb-1">{value}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  );
};
