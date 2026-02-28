import { MessageSquare, FileText, Download } from 'lucide-react';
import { motion } from 'framer-motion';

const steps = [
  { icon: FileText, title: 'Upload', description: 'Upload PDFs, docs, and images. Our RAG system extracts and indexes content for instant querying.', step: '01' },
  { icon: MessageSquare, title: 'Ask', description: 'Chat naturally with your documents. Ask complex questions and get accurate, cited answers.', step: '02' },
  { icon: Download, title: 'Get Answers', description: 'Receive precise answers with source citations — ready for your research or workflow in seconds.', step: '03' },
];

export function About() {
  return (
    <section id="about" className="py-24 md:py-32">
      <div className="container max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
            How it works
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Upload your documents, ask questions naturally, and get instant AI-powered answers with citations.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {steps.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="group relative p-6 rounded-xl border border-border/30 bg-card/40 backdrop-blur-sm hover:bg-card/70 hover:border-border/50 transition-all duration-300 hover:shadow-lg hover:shadow-black/5"
            >
              <div className="absolute top-4 right-4 text-3xl font-bold text-primary/8 select-none group-hover:text-primary/15 transition-colors">{item.step}</div>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/15 to-orange-500/15 flex items-center justify-center mb-4 group-hover:from-purple-500/25 group-hover:to-orange-500/25 transition-all">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-base font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
