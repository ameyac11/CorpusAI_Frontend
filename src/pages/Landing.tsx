import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { About } from '@/components/landing/About';
import { Features } from '@/components/landing/Features';
import { UseCases } from '@/components/landing/UseCases';
import { FAQ } from '@/components/landing/FAQ';
import { Contact } from '@/components/landing/Contact';
import { Footer } from '@/components/landing/Footer';

export default function Landing() {
  return (
    <div className="min-h-[100dvh] bg-background text-foreground font-sans selection:bg-purple-500/20">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Features />
        <UseCases />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
