import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock, Coins, Users, Ticket, Trophy, ArrowRight, ExternalLink } from 'lucide-react';

const HowItWorks = () => {
  const contractAddress = "0x1dEdc2d6A080809EFD0cb6b776f94905b12e6F11";
  const explorerUrl = `https://sepolia.etherscan.io/address/${contractAddress}`;

  return (
    <div className="min-h-screen relative">
      <Header />
      
      <main className="relative z-10">
        {/* Hero Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4 bg-primary/10 text-primary border-primary/30">
                Powered by FHE Technology
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                How It Works
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Discover how FHE Lucky Draw revolutionizes lottery systems with fully homomorphic encryption, ensuring complete privacy and fairness.
              </p>
            </div>

            {/* Demo Video */}
            <Card className="mb-16 border-primary/30 bg-card/50 backdrop-blur overflow-hidden">
              <CardHeader>
                <CardTitle className="text-2xl text-center">Demo Video</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <video controls className="w-full h-full rounded-lg">
                    <source src="/test_demo.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Project Introduction */}
        <section className="py-20 relative z-10">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-4xl font-bold mb-8 text-center">What is FHE Lucky Draw?</h2>
            
            <Card className="mb-8 border-border/50 bg-card/50 backdrop-blur">
              <CardContent className="pt-6">
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  FHE Lucky Draw is a revolutionary decentralized lottery platform built on Ethereum's Sepolia testnet using <strong className="text-foreground">Zama's Fully Homomorphic Encryption (FHE)</strong> technology. Unlike traditional lotteries where numbers are visible or centrally controlled, our platform ensures that <strong className="text-foreground">lottery numbers remain encrypted on-chain</strong> until the draw is completed, guaranteeing complete privacy and eliminating any possibility of manipulation.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  By leveraging FHE, we create a trustless and transparent lottery system where participants can verify the fairness of every draw while maintaining complete privacy of their ticket numbers.
                </p>
              </CardContent>
            </Card>

            {/* Key Features */}
            <div className="grid md:grid-cols-3 gap-6 mb-16">
              <Card className="border-border/50 bg-card/50 backdrop-blur hover:border-primary/50 transition-colors">
                <CardHeader>
                  <Shield className="w-12 h-12 mb-4 text-primary" />
                  <CardTitle>Complete Privacy</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Your lottery numbers are encrypted using FHE before being stored on-chain. No one, including administrators, can see your numbers until after the draw.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50 backdrop-blur hover:border-primary/50 transition-colors">
                <CardHeader>
                  <Lock className="w-12 h-12 mb-4 text-accent" />
                  <CardTitle>Provably Fair</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    All lottery operations are executed on-chain with cryptographic proofs, ensuring complete transparency and fairness that can be verified by anyone.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50 backdrop-blur hover:border-primary/50 transition-colors">
                <CardHeader>
                  <Trophy className="w-12 h-12 mb-4 text-primary" />
                  <CardTitle>Trustless System</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    No central authority controls the lottery. Smart contracts handle all operations automatically, eliminating the need to trust any third party.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works Steps */}
        <section className="py-20 relative z-10">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-4xl font-bold mb-12 text-center">The Process</h2>
            
            <div className="space-y-8">
              {/* Step 1 */}
              <Card className="border-primary/30 bg-card/50 backdrop-blur">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary">1</span>
                    </div>
                    <div>
                      <CardTitle className="text-2xl">Connect Your Wallet</CardTitle>
                      <p className="text-muted-foreground">Start by connecting your Web3 wallet to the platform</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-4 ml-16">
                    <Users className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-muted-foreground">
                        Support for MetaMask, WalletConnect, and other popular Web3 wallets. Your wallet serves as your identity and holds your encrypted lottery tickets.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Step 2 */}
              <Card className="border-accent/30 bg-card/50 backdrop-blur">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                      <span className="text-2xl font-bold text-accent">2</span>
                    </div>
                    <div>
                      <CardTitle className="text-2xl">Choose Your Numbers</CardTitle>
                      <p className="text-muted-foreground">Select 6 numbers between 0-99</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-4 ml-16">
                    <Ticket className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-muted-foreground mb-4">
                        Pick your lucky numbers through an intuitive interface. Your numbers will be encrypted locally before being submitted to the blockchain.
                      </p>
                      <div className="flex gap-2">
                        {[12, 34, 56, 78, 90, 23].map((num, idx) => (
                          <div
                            key={idx}
                            className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center font-bold text-primary"
                          >
                            {num}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Step 3 */}
              <Card className="border-primary/30 bg-card/50 backdrop-blur">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary">3</span>
                    </div>
                    <div>
                      <CardTitle className="text-2xl">FHE Encryption</CardTitle>
                      <p className="text-muted-foreground">Your numbers are encrypted using Zama's FHE technology</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-4 ml-16">
                    <Lock className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-muted-foreground mb-4">
                        Before submission, your lottery numbers are encrypted using Fully Homomorphic Encryption (FHE). This means:
                      </p>
                      <ul className="space-y-2 text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <ArrowRight className="w-4 h-4 text-accent" />
                          Numbers remain encrypted on-chain
                        </li>
                        <li className="flex items-center gap-2">
                          <ArrowRight className="w-4 h-4 text-accent" />
                          No one can see your numbers (not even admins)
                        </li>
                        <li className="flex items-center gap-2">
                          <ArrowRight className="w-4 h-4 text-accent" />
                          Computations can still be performed on encrypted data
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Step 4 */}
              <Card className="border-accent/30 bg-card/50 backdrop-blur">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                      <span className="text-2xl font-bold text-accent">4</span>
                    </div>
                    <div>
                      <CardTitle className="text-2xl">Wait for the Draw</CardTitle>
                      <p className="text-muted-foreground">Track your ticket status until the draw time</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-4 ml-16">
                    <Coins className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-muted-foreground">
                        Your ticket is safely stored on-chain with encrypted numbers. You can view your tickets in "My Tickets" section, where they're displayed as encrypted placeholders until the draw is completed.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Step 5 */}
              <Card className="border-primary/30 bg-card/50 backdrop-blur">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary">5</span>
                    </div>
                    <div>
                      <CardTitle className="text-2xl">Winning Number Announcement</CardTitle>
                      <p className="text-muted-foreground">Administrator draws the winning number</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-4 ml-16">
                    <Trophy className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-muted-foreground">
                        At the scheduled draw time, the administrator generates a winning number. This number is publicly announced and recorded on-chain for complete transparency.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Step 6 */}
              <Card className="border-accent/30 bg-card/50 backdrop-blur">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                      <span className="text-2xl font-bold text-accent">6</span>
                    </div>
                    <div>
                      <CardTitle className="text-2xl">Claim Your Prize</CardTitle>
                      <p className="text-muted-foreground">Check if you're a winner and claim rewards</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-4 ml-16">
                    <Shield className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-muted-foreground">
                        The smart contract compares your encrypted numbers with the winning number using FHE operations. If you match, you can claim your prize directly through the contract - all without ever revealing your original numbers publicly.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Technical Details */}
        <section className="py-20 relative z-10">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-4xl font-bold mb-12 text-center">Technical Architecture</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-border/50 bg-card/50 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    Smart Contract
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Contract Address:</p>
                    <a
                      href={explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-sm text-primary hover:underline flex items-center gap-2"
                    >
                      {contractAddress.slice(0, 10)}...{contractAddress.slice(-8)}
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Network:</p>
                    <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30">
                      Ethereum Sepolia Testnet
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Key Functions:</p>
                    <ul className="space-y-1 text-sm">
                      <li className="font-mono">• buyTicket()</li>
                      <li className="font-mono">• draw()</li>
                      <li className="font-mono">• claimPrize()</li>
                      <li className="font-mono">• getMyTickets()</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-accent" />
                    FHE Technology
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Encryption Library:</p>
                    <p className="font-semibold">Zama fhEVM v0.8.0</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Data Types:</p>
                    <ul className="space-y-1 text-sm">
                      <li className="font-mono">• euint32 (encrypted 32-bit integer)</li>
                      <li className="font-mono">• ebool (encrypted boolean)</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">FHE Operations:</p>
                    <ul className="space-y-1 text-sm">
                      <li className="font-mono">• FHE.eq() - equality comparison</li>
                      <li className="font-mono">• FHE.asEuint32() - type conversion</li>
                      <li className="font-mono">• FHE.allow() - access control</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 relative z-10">
          <div className="container mx-auto px-4 max-w-4xl">
            <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-accent/10 backdrop-blur">
              <CardContent className="pt-12 pb-12 text-center">
                <h2 className="text-3xl font-bold mb-4">Ready to Try FHE Lucky Draw?</h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Experience the future of privacy-preserving lotteries on the blockchain
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a href="/">
                    <button className="px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-semibold transition-colors">
                      Start Playing
                    </button>
                  </a>
                  <a href={explorerUrl} target="_blank" rel="noopener noreferrer">
                    <button className="px-8 py-4 bg-card hover:bg-card/80 border border-border rounded-lg font-semibold transition-colors flex items-center gap-2">
                      View Contract
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 bg-card/30 backdrop-blur py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 FHE Lucky Draw. Powered by Zama's Fully Homomorphic Encryption.</p>
          <p className="mt-2">All lottery numbers are encrypted end-to-end for maximum privacy.</p>
        </div>
      </footer>
    </div>
  );
};

export default HowItWorks;
