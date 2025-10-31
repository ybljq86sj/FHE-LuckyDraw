import { ConnectButton } from '@rainbow-me/rainbowkit';
import { BRAND_NAME } from '@/config/brand';
import { Link, useLocation } from 'react-router-dom';

export const Header = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 backdrop-blur-md bg-background/80">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="relative">
            <img src="/logo.svg" alt={`${BRAND_NAME} logo`} className="w-9 h-9 drop-shadow-[0_0_12px_rgba(96,165,250,0.45)]" />
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {BRAND_NAME}
          </h1>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          {isHomePage ? (
            <>
              <a href="#play" className="text-muted-foreground hover:text-foreground transition-colors">
                Play Now
              </a>
              <a href="#tickets" className="text-muted-foreground hover:text-foreground transition-colors">
                My Tickets
              </a>
              <a href="#history" className="text-muted-foreground hover:text-foreground transition-colors">
                History
              </a>
            </>
          ) : (
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
          )}
          <Link
            to="/how-it-works"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            How It Works
          </Link>
        </nav>

        <ConnectButton />
      </div>
    </header>
  );
};
