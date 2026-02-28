import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  { question: 'What is CorpusAI?', answer: 'CorpusAI is an AI-powered document assistant that lets you upload documents and have natural conversations with them. Ask questions and get accurate, cited answers instantly.' },
  { question: 'What file types are supported?', answer: 'We support PDF, DOCX, TXT, and image files (PNG, JPG). More formats coming soon.' },
  { question: 'Is my data secure?', answer: 'Absolutely. All documents are encrypted both at rest and in transit. We never share your data with third parties and you can delete your documents at any time.' },
  { question: 'How accurate are the AI responses?', answer: 'Our AI provides highly accurate responses by directly referencing your uploaded documents. All answers include source citations so you can verify the information.' },
];

export function FAQ() {
  return (
    <section id="faq" className="py-24 md:py-32 relative">
      <div className="absolute inset-0 bg-muted/20" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none transform-gpu" />
      <div className="container max-w-3xl mx-auto px-6 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">FAQ</h2>
          <p className="text-muted-foreground">Common questions about CorpusAI</p>
        </div>
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border border-border/30 rounded-xl px-5 bg-card/40 backdrop-blur-sm">
              <AccordionTrigger className="text-left py-4 hover:no-underline text-sm"><span className="font-medium">{faq.question}</span></AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4 text-sm leading-relaxed">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
