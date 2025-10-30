import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Ticket } from 'lucide-react';

export const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 backdrop-blur-md bg-background/80">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Ticket className="w-8 h-8 text-primary animate-neon-pulse" />
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            FHELottery
          </h1>
        </div>
        
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <a href="#play" className="text-muted-foreground hover:text-foreground transition-colors">
            Play Now
          </a>
          <a href="#tickets" className="text-muted-foreground hover:text-foreground transition-colors">
            My Tickets
          </a>
          <a href="#history" className="text-muted-foreground hover:text-foreground transition-colors">
            History
          </a>
        </nav>

        <ConnectButton />
      </div>
    </header>
  );
};
