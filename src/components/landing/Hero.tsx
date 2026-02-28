import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ThemeLogo } from '@/components/brand/ThemeLogo';
import { motion } from 'framer-motion';

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center pt-16 overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/8 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/6 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-3xl" />
      </div>

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none transform-gpu" />

      <div className="container max-w-4xl mx-auto relative z-10 px-6 py-24 md:py-32">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1, type: 'spring', stiffness: 200, damping: 20 }}
            className="flex justify-center mb-10"
          >
            <div className="relative p-5 rounded-2xl bg-card/40 border border-border/30 backdrop-blur-xl shadow-2xl shadow-primary/5">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/10 via-transparent to-orange-500/10" />
              <ThemeLogo size="lg" className="relative z-10" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="flex justify-center mb-5"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium border border-border/50 bg-card/60 backdrop-blur-sm text-muted-foreground">
              <Sparkles className="w-3 h-3 text-purple-500" />
              AI-Powered Document Intelligence Platform
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-[1.1]"
          >
            <span className="text-foreground">Chat with your </span>
            <span className="bg-gradient-to-r from-purple-500 via-purple-400 to-orange-500 bg-clip-text text-transparent">documents</span>
            <br className="hidden sm:block" />
            <span className="text-foreground">efficiency redefined</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="text-base md:text-lg text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Upload documents, ask questions, and get instant AI-powered answers.
            CorpusAI makes knowledge retrieval effortless.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Button asChild size="lg" className="h-12 px-8 text-sm font-semibold rounded-xl bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white shadow-lg shadow-purple-500/20 border-0">
              <Link to="/signup">
                Get Started Free
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-8 text-sm font-medium rounded-xl border-border/50 bg-card/40 backdrop-blur-sm hover:bg-card/60">
              <Link to="/get-started">Learn More</Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="mt-20 flex items-center justify-center gap-6 sm:gap-10"
          >
            {[
              { value: '5+', label: 'File Types' },
              { value: '6', label: 'AI Models' },
              { value: 'Web', label: 'Search' },
              { value: 'Free', label: 'To Start' },
            ].map((stat, i) => (
              <div key={i} className="px-4 py-3 rounded-xl border border-border/30 bg-card/30 backdrop-blur-sm">
                <div className="text-xl font-bold text-foreground">{stat.value}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5 font-medium">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
