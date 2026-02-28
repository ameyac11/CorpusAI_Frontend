import { Link } from 'react-router-dom';
import { ThemeLogo } from '@/components/brand/ThemeLogo';
import { Github, Twitter, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border/30 bg-background">
      <div className="container max-w-5xl mx-auto px-6 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <ThemeLogo size="sm" />
            <span className="text-sm font-medium">CorpusAI</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <a href="#contact" className="hover:text-foreground transition-colors">Contact</a>
            <a href="#about" className="hover:text-foreground transition-colors">About</a>
          </div>

          <div className="flex items-center gap-3">
            {[Github, Twitter, Linkedin].map((Icon, i) => (
              <a key={i} href="#" className="p-1.5 rounded-md hover:bg-accent/50 transition-colors" aria-label={Icon.displayName}>
                <Icon className="w-4 h-4 text-muted-foreground" />
              </a>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border/30 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} CorpusAI by DataNesTX. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
