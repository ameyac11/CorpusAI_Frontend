import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeLogo } from '@/components/brand/ThemeLogo';
import { cn } from '@/lib/utils';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Use Cases', href: '#use-cases' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contact', href: '#contact' },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { resolvedTheme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isScrolled
          ? "bg-background/80 backdrop-blur-2xl border-b border-border/30 shadow-sm shadow-black/5"
          : "bg-transparent"
      )}
    >
      <nav className="container max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <ThemeLogo size="sm" />
          <span className="font-semibold text-base tracking-tight">CorpusAI</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-3 py-1.5 rounded-lg text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="hidden md:flex h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground">
            {resolvedTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex h-8 text-[13px] font-medium text-muted-foreground hover:text-foreground rounded-lg">
            <Link to="/login">Sign In</Link>
          </Button>
          <Button asChild size="sm" className="hidden md:inline-flex h-8 text-[13px] font-semibold rounded-lg bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white border-0 shadow-sm shadow-purple-500/10">
            <Link to="/signup">Get Started</Link>
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden h-8 w-8" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-2xl border-b border-border/30">
          <div className="container max-w-6xl mx-auto px-6 py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="text-sm text-muted-foreground hover:text-foreground py-2.5 px-3 rounded-lg hover:bg-accent/50 font-medium transition-all" onClick={() => setIsMobileMenuOpen(false)}>{link.label}</a>
            ))}
            <div className="flex items-center justify-between pt-3 mt-2 border-t border-border/30">
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-8 w-8">
                {resolvedTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              <Button asChild size="sm" className="h-8 rounded-lg text-[13px] font-semibold bg-gradient-to-r from-purple-600 to-orange-500 text-white border-0"><Link to="/login">Sign In</Link></Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
