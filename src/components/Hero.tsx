import { Shield, Lock, Trophy } from 'lucide-react';

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Animated background orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto space-y-8">
          <div className="inline-block">
            <div className="bg-primary/10 border border-primary/30 rounded-full px-4 py-2 text-sm text-primary font-medium">
              Powered by Fully Homomorphic Encryption
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-neon-pulse">
              Privacy-First
            </span>
            <br />
            <span className="text-foreground">Blockchain Lottery</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your lottery numbers stay encrypted end-to-end. Winners are determined through secure homomorphic computation, ensuring complete privacy for all players.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <a 
              href="#play"
              className="group relative px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:scale-105 transition-transform"
              style={{ boxShadow: 'var(--shadow-neon)' }}
            >
              <span className="relative z-10">Buy Tickets Now</span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity blur-sm" />
            </a>
            
            <button className="px-8 py-4 border border-border bg-card hover:bg-muted rounded-lg font-semibold transition-colors">
              Learn More
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
            <FeatureCard
              icon={<Shield className="w-6 h-6" />}
              title="Encrypted Numbers"
              description="Your lottery numbers are encrypted before submission and never exposed"
            />
            <FeatureCard
              icon={<Lock className="w-6 h-6" />}
              title="Privacy Preserved"
              description="FHE technology keeps all numbers private during the entire process"
            />
            <FeatureCard
              icon={<Trophy className="w-6 h-6" />}
              title="Fair Winners"
              description="Homomorphic comparison ensures tamper-proof winner determination"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => {
  return (
    <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors group">
      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
};
