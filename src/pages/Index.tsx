import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { CurrentRound } from '@/components/CurrentRound';
import { BuyTicket } from '@/components/BuyTicket';
import { MyTickets } from '@/components/MyTickets';
import { RoundHistory } from '@/components/RoundHistory';
import { BRAND_NAME } from '@/config/brand';

const Index = () => {
  return (
    <div className="min-h-screen relative">
      <Header />
      <main>
        <Hero />
        <CurrentRound />
        <BuyTicket />
        <MyTickets />
        <RoundHistory />
      </main>
      <footer className="relative z-10 border-t border-border/50 bg-card/30 backdrop-blur py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 {BRAND_NAME}. Powered by Fully Homomorphic Encryption.</p>
          <p className="mt-2">All lottery numbers are encrypted end-to-end for maximum privacy.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
