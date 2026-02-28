import { GraduationCap, Building2, Users, BookOpen, Briefcase, Microscope } from 'lucide-react';
import { motion } from 'framer-motion';

const useCases = [
  { icon: GraduationCap, title: 'Students & Researchers', description: 'Quickly find information across research papers, notes, and textbooks.' },
  { icon: Building2, title: 'Businesses', description: 'Search through company documents, reports, and policies instantly.' },
  { icon: Users, title: 'Legal Professionals', description: 'Navigate complex legal documents and find relevant precedents.' },
  { icon: BookOpen, title: 'Educators', description: 'Create study materials and answer student questions from course content.' },
  { icon: Briefcase, title: 'Consultants', description: 'Analyze client documents and generate insights across multiple files.' },
  { icon: Microscope, title: 'Healthcare', description: 'Review medical literature and clinical documents with AI assistance.' },
];

export function UseCases() {
  return (
    <section id="use-cases" className="py-24 md:py-32">
      <div className="container max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Use Cases</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            See how different professionals use CorpusAI
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {useCases.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className="group p-5 rounded-xl border border-border/30 bg-card/40 backdrop-blur-sm hover:bg-card/70 hover:border-border/50 transition-all duration-300 hover:shadow-lg hover:shadow-black/5"
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500/15 to-orange-500/15 flex items-center justify-center mb-3 group-hover:from-purple-500/25 group-hover:to-orange-500/25 transition-all">
                <item.icon className="w-4.5 h-4.5 text-primary" />
              </div>
              <h3 className="text-sm font-semibold mb-1.5">{item.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
