import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  FileText,
  MessageSquare,
  Zap,
  Shield,
  Globe,
  ArrowRight,
  Check,
  GraduationCap,
  Building2,
  Users,
  BookOpen,
  Clock,
  Mail,
  MapPin,
  Send,
  Rocket,
  Code,
  LineChart,
  UsersRound,
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LandingHeader } from '@/components/layout/LandingHeader';
import { toast } from 'sonner';

const currentFeatures = [
  {
    icon: FileText,
    title: 'Document Intelligence',
    description: 'Upload PDFs, docs, and images. Our RAG system extracts and indexes content for instant querying.',
  },
  {
    icon: MessageSquare,
    title: 'Natural Conversations',
    description: 'Chat naturally with your documents. Get accurate answers with source citations.',
  },
  {
    icon: Zap,
    title: 'Advanced AI Models',
    description: 'Choose between multiple AI models for the best performance on your tasks.',
  },
  {
    icon: Globe,
    title: 'Web Search Integration',
    description: 'Combine document knowledge with real-time web search for comprehensive answers.',
  },
  {
    icon: Shield,
    title: 'Privacy First',
    description: 'Your documents are encrypted and processed securely. We never share your data.',
  },
];

const comingSoonFeatures = [
  {
    icon: UsersRound,
    title: 'Team Collaboration',
    description: 'Work together with your team on shared documents and conversations.',
  },
  {
    icon: Code,
    title: 'API Access',
    description: 'Integrate CorpusAI into your applications with our REST API.',
  },
  {
    icon: Rocket,
    title: 'Custom AI Training',
    description: 'Train custom models on your specific domain and use cases.',
  },
  {
    icon: LineChart,
    title: 'Advanced Analytics',
    description: 'Track usage, insights, and document engagement metrics.',
  },
];

const useCases = [
  {
    icon: GraduationCap,
    title: 'Students & Researchers',
    description: 'Quickly find information across research papers, notes, and textbooks.',
  },
  {
    icon: Building2,
    title: 'Businesses',
    description: 'Search through company documents, reports, and policies instantly.',
  },
  {
    icon: Users,
    title: 'Legal Professionals',
    description: 'Navigate complex legal documents and find relevant precedents.',
  },
  {
    icon: BookOpen,
    title: 'Educators',
    description: 'Create study materials and answer student questions from course content.',
  },
];

const faqs = [
  {
    question: 'What is CorpusAI?',
    answer: 'CorpusAI is an AI-powered document assistant that lets you upload documents and have natural conversations with them. Ask questions and get accurate, cited answers instantly.',
  },
  {
    question: 'What file types are supported?',
    answer: 'We support PDF, DOCX, TXT, and image files (PNG, JPG). We use OCR technology for image-based documents to extract text automatically.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Absolutely. All documents are encrypted both at rest and in transit. We never share your data with third parties and you can delete your documents at any time.',
  },
  {
    question: 'Can I use CorpusAI for free?',
    answer: 'Yes! Our free plan includes document uploads and messages. Perfect for getting started.',
  },
  {
    question: 'How accurate are the AI responses?',
    answer: 'Our AI provides highly accurate responses by directly referencing your uploaded documents. All answers include source citations so you can verify the information.',
  },
];

const queryOptions = [
  'General Inquiry',
  'Technical Support',
  'Partnership',
  'Enterprise Sales',
  'Feedback',
];

export default function Landing() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    queryType: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formPayload = new FormData();
      formPayload.append('access_key', import.meta.env.VITE_WEB3FORMS_ACCESS_KEY);
      formPayload.append('name', formData.name);
      formPayload.append('email', formData.email);
      formPayload.append('subject', `Landing Page Contact Form - ${formData.queryType}`);
      formPayload.append('message', `Query Type: ${formData.queryType}\n\nMessage:\n${formData.message}`);

      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formPayload,
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Message sent! We\'ll get back to you within 24 hours.');
        setFormData({ name: '', email: '', queryType: '', message: '' });
      } else {
        toast.error('Failed to send message. Please try again.');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcf9] dark:bg-[#191919] font-sans selection:bg-purple-500/20">
      <LandingHeader />

      {/* Hero Section */}
      <section id="about" className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">


            <h1 className="text-5xl md:text-7xl font-serif tracking-tight text-[#191919] dark:text-[#fcfcf9] mb-6 leading-[1.1]">
              Chat with your documents
              <br />
              <span className="text-purple-600 dark:text-purple-400">like never before</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 font-light leading-relaxed">
              Upload documents, ask questions, and get instant AI-powered answers.
              CorpusAI makes knowledge retrieval effortless.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
              <Link to="/chat">
                <Button className="rounded-full bg-purple-600 hover:bg-purple-700 text-white font-medium px-10 h-14 text-lg">
                  Try for Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Preview */}
            <div className="relative max-w-5xl mx-auto">
              <div className="w-full rounded-3xl overflow-hidden relative bg-gradient-to-r from-purple-900 via-violet-800 to-purple-900 p-8">
                <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
                <div className="relative bg-white dark:bg-[#191919] rounded-2xl p-6 shadow-2xl">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="space-y-4">
                    <div className="flex gap-3 p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20">
                      <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white text-xs font-medium">U</div>
                      <div className="flex-1">
                        <p className="text-sm text-foreground">What are the key findings from my research paper?</p>
                      </div>
                    </div>
                    <div className="flex gap-3 p-4 rounded-xl bg-gray-50 dark:bg-[#201a2b]">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-violet-600 flex items-center justify-center text-white">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-foreground">Based on your uploaded research paper, the key findings include...</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-[#f3f0ff] dark:bg-[#201a2b]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif text-[#191919] dark:text-[#fcfcf9] mb-4">
              Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light">
              Powerful features to help you extract insights from your documents
            </p>
          </div>

          {/* Current Features */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {currentFeatures.map((feature, index) => (
              <div
                key={index}
                className="p-8 bg-white dark:bg-[#191919] rounded-[2rem] border border-border hover:border-purple-500/30 transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-6 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                  <feature.icon className="w-7 h-7 text-purple-600" />
                </div>
                <h3 className="text-xl font-serif text-[#191919] dark:text-[#fcfcf9] mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed font-light">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Coming Soon Features */}
          <div className="text-center mb-12">
            <h3 className="text-3xl font-serif text-[#3b1fa8] dark:text-[#d0c2ff] mb-2">Coming Soon</h3>
            <p className="text-muted-foreground font-light">Features we're working on</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {comingSoonFeatures.map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-white dark:bg-[#191919] rounded-2xl border-2 border-dashed border-purple-200 dark:border-purple-900/30 relative group hover:border-purple-400 dark:hover:border-purple-700 transition-colors"
              >
                <div className="absolute top-3 right-3 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-medium rounded-full">
                  Soon
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center mb-4 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/40 transition-colors">
                  <feature.icon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h4 className="text-base font-medium text-[#191919] dark:text-[#fcfcf9] mb-2">
                  {feature.title}
                </h4>
                <p className="text-sm text-muted-foreground font-light">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What You Can Do Section */}
      <section id="capabilities" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif text-[#191919] dark:text-[#fcfcf9] mb-4">
              What can you do with CorpusAI?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light">
              Unlock the full potential of your documents
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10 max-w-6xl mx-auto">
            <div className="p-10 bg-white dark:bg-[#201a2b] rounded-[2rem] border border-purple-100 dark:border-purple-900/30 hover:border-purple-300 dark:hover:border-purple-700 transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-2xl font-serif text-[#191919] dark:text-[#fcfcf9] mb-4">Interactive Q&A</h3>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed font-light">
                Transform static documents into interactive knowledge bases. Ask complex questions about your PDFs, reports, and contracts, and get precise answers with direct citations to the source material.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-foreground">
                  <Check className="w-5 h-5 text-purple-600 shrink-0" />
                  <span className="font-light">Extract specific data points</span>
                </li>
                <li className="flex items-center gap-3 text-foreground">
                  <Check className="w-5 h-5 text-purple-600 shrink-0" />
                  <span className="font-light">Summarize long documents</span>
                </li>
                <li className="flex items-center gap-3 text-foreground">
                  <Check className="w-5 h-5 text-purple-600 shrink-0" />
                  <span className="font-light">Compare information across files</span>
                </li>
              </ul>
            </div>

            <div className="p-10 bg-white dark:bg-[#201a2b] rounded-[2rem] border border-purple-100 dark:border-purple-900/30 hover:border-purple-300 dark:hover:border-purple-700 transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Sparkles className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-2xl font-serif text-[#191919] dark:text-[#fcfcf9] mb-4">Visual Understanding</h3>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed font-light">
                Go beyond text. Upload images, charts, and diagrams. Our advanced vision models analyze visual content to provide insights, descriptions, and answers about what's inside your images.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-foreground">
                  <Check className="w-5 h-5 text-purple-600 shrink-0" />
                  <span className="font-light">Analyze charts and graphs</span>
                </li>
                <li className="flex items-center gap-3 text-foreground">
                  <Check className="w-5 h-5 text-purple-600 shrink-0" />
                  <span className="font-light">Extract text from screenshots</span>
                </li>
                <li className="flex items-center gap-3 text-foreground">
                  <Check className="w-5 h-5 text-purple-600 shrink-0" />
                  <span className="font-light">Interpret visual diagrams</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="py-20 px-6 bg-[#f3f0ff] dark:bg-[#201a2b]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif text-[#191919] dark:text-[#fcfcf9] mb-4">
              Use Cases
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light">
              See how different professionals use CorpusAI
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((useCase, index) => (
              <div
                key={index}
                className="p-8 bg-white dark:bg-[#191919] rounded-2xl text-center border border-border hover:border-purple-500/30 transition-all hover:scale-105"
              >
                <div className="w-16 h-16 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-4">
                  <useCase.icon className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-serif text-[#191919] dark:text-[#fcfcf9] mb-2">
                  {useCase.title}
                </h3>
                <p className="text-sm text-muted-foreground font-light">
                  {useCase.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-[3rem] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-900 via-violet-800 to-purple-900" />
            <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
            <div className="relative p-16 md:p-24 text-center">
              <h2 className="text-4xl md:text-5xl font-serif text-white mb-6">
                Ready to get started?
              </h2>
              <p className="text-xl text-white/90 max-w-2xl mx-auto mb-10 font-light">
                Join thousands of users who are already chatting with their documents.
              </p>
              <Link to="/chat">
                <Button className="rounded-full bg-white hover:bg-gray-100 text-purple-900 font-medium px-10 h-14 text-lg shadow-xl">
                  Start for Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-6 bg-[#f3f0ff] dark:bg-[#201a2b]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-serif text-[#191919] dark:text-[#fcfcf9] mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light">
              Got questions? We've got answers.
            </p>
          </div>

          <div className="max-w-4xl mx-auto grid gap-6">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="p-8 bg-white dark:bg-[#191919] rounded-2xl border border-border hover:border-purple-500/30 transition-all cursor-pointer group"
              >
                <h3 className="text-lg font-medium text-[#191919] dark:text-[#fcfcf9] mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {faq.question}
                </h3>
                <p className="text-muted-foreground leading-relaxed font-light">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-serif text-[#191919] dark:text-[#fcfcf9] mb-4">
              Contact Us
            </h2>
            <p className="text-xl text-muted-foreground font-light">
              Have questions? We'd love to hear from you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
            {/* Contact Info */}
            <div className="space-y-6">
              <div className="p-8 bg-white dark:bg-[#201a2b] rounded-[2rem] border border-border">
                <h3 className="text-xl font-serif text-[#191919] dark:text-[#fcfcf9] mb-6">Get in Touch</h3>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <Mail className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-light">Email</p>
                      <p className="text-sm font-medium text-foreground">contact@corpusai.datanestx.tech</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-light">Location</p>
                      <p className="text-sm font-medium text-foreground">San Francisco, CA</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-light">Response Time</p>
                      <p className="text-sm font-medium text-foreground">Up to 24 hours</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="p-8 bg-white dark:bg-[#201a2b] rounded-[2rem] border border-border">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    className="w-full px-4 py-3 bg-[#fcfcf9] dark:bg-[#191919] border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                    className="w-full px-4 py-3 bg-[#fcfcf9] dark:bg-[#191919] border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Query Type</label>
                  <select
                    value={formData.queryType}
                    onChange={(e) => setFormData(prev => ({ ...prev, queryType: e.target.value }))}
                    required
                    className="w-full px-4 py-3 bg-[#fcfcf9] dark:bg-[#191919] border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                  >
                    <option value="">Select a topic</option>
                    {queryOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Message</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    required
                    rows={4}
                    className="w-full px-4 py-3 bg-[#fcfcf9] dark:bg-[#191919] border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 resize-none"
                    placeholder="How can we help?"
                  />
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl h-12 disabled:opacity-50 disabled:cursor-not-allowed">
                  <Send className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Layers className="w-6 h-6 text-purple-600" />
              <span className="text-sm font-medium text-foreground">CorpusAI</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} CorpusAI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
