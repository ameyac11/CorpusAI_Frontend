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
    UsersRound
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LandingHeader } from '@/components/layout/LandingHeader';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5 }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

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
    'Other',
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
        <div className="min-h-screen bg-white dark:bg-black font-sans selection:bg-[#7756AF]/20">
            <LandingHeader />

            {/* Hero Section */}
            <section id="about" className="pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-5xl md:text-7xl font-serif tracking-tight text-zinc-900 dark:text-zinc-100 mb-6 leading-[1.1]">
                            Chat with your documents
                            <br />
                            <span className="text-[#7756AF]">efficiency redefined.</span>
                        </h1>

                        <p className="text-xl md:text-2xl text-zinc-600 dark:text-zinc-400 max-w-3xl mx-auto mb-12 font-light leading-relaxed">
                            Upload documents, ask questions, and get instant AI-powered answers.
                            CorpusAI makes knowledge retrieval effortless.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
                            <Link to="/chat">
                                <Button className="rounded-full bg-[#7756AF] hover:bg-[#664996] text-white font-medium px-10 h-14 text-lg transition-all hover:scale-105 shadow-lg shadow-[#7756AF]/20">
                                    Try for Free
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </Link>
                        </div>

                        {/* Preview */}
                        <motion.div
                            className="relative max-w-5xl mx-auto"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                        >
                            <div className="w-full rounded-3xl overflow-hidden relative bg-zinc-900 dark:bg-zinc-800 p-8 shadow-2xl border border-zinc-200 dark:border-zinc-800">
                                <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
                                <div className="relative bg-white dark:bg-[#0a0a0a] rounded-2xl p-6 shadow-inner">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-3 h-3 rounded-full bg-red-400/80" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                                        <div className="w-3 h-3 rounded-full bg-green-400/80" />
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex gap-3 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50">
                                            <div className="w-8 h-8 rounded-lg bg-[#7756AF] flex items-center justify-center text-white text-xs font-medium">U</div>
                                            <div className="flex-1">
                                                <p className="text-sm text-zinc-900 dark:text-zinc-100">What are the key findings from my research paper?</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 p-4 rounded-xl bg-white dark:bg-black border border-zinc-100 dark:border-zinc-800 shadow-sm">
                                            <div className="w-8 h-8 rounded-lg bg-[#F1EBF9] dark:bg-[#7756AF]/20 flex items-center justify-center">
                                                <Sparkles className="w-4 h-4 text-[#7756AF]" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm text-zinc-600 dark:text-zinc-300">Based on the analysis, the key findings indicate a significant correlation between...</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 px-6 bg-zinc-50 dark:bg-zinc-900/20">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        className="text-center mb-16"
                        {...fadeInUp}
                    >
                        <h2 className="text-4xl md:text-5xl font-serif text-zinc-900 dark:text-zinc-100 mb-4">
                            Features
                        </h2>
                        <p className="text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto font-light">
                            Powerful tools designed for clarity and speed
                        </p>
                    </motion.div>

                    {/* Current Features */}
                    <motion.div
                        className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20"
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                    >
                        {currentFeatures.map((feature, index) => (
                            <motion.div
                                key={index}
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    show: { opacity: 1, y: 0 }
                                }}
                                className="p-8 bg-white dark:bg-black rounded-[2rem] border border-zinc-200 dark:border-zinc-800 hover:border-[#7756AF]/30 transition-all group hover:shadow-lg hover:shadow-[#7756AF]/5"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-[#F1EBF9] dark:bg-[#7756AF]/10 flex items-center justify-center mb-6 group-hover:bg-[#7756AF]/10 dark:group-hover:bg-[#7756AF]/20 transition-colors">
                                    <feature.icon className="w-7 h-7 text-[#7756AF]" />
                                </div>
                                <h3 className="text-xl font-serif text-zinc-900 dark:text-zinc-100 mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed font-light">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Coming Soon Features */}
                    <motion.div
                        className="text-center mb-12"
                        {...fadeInUp}
                    >
                        <h3 className="text-3xl font-serif text-zinc-400 dark:text-zinc-600 mb-2">Coming Soon</h3>
                    </motion.div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {comingSoonFeatures.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="p-6 bg-white dark:bg-black rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 relative group hover:border-[#7756AF]/30 transition-colors"
                            >
                                <div className="absolute top-3 right-3 px-2 py-1 bg-[#F1EBF9] dark:bg-[#7756AF]/10 text-[#7756AF] text-xs font-medium rounded-full">
                                    Soon
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-center mb-4 group-hover:bg-[#7756AF]/5 dark:group-hover:bg-[#7756AF]/10 transition-colors">
                                    <feature.icon className="w-6 h-6 text-zinc-400 group-hover:text-[#7756AF]/50 transition-colors" />
                                </div>
                                <h4 className="text-base font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                                    {feature.title}
                                </h4>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 font-light">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* What You Can Do Section */}
            <section id="capabilities" className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        className="text-center mb-16"
                        {...fadeInUp}
                    >
                        <h2 className="text-4xl md:text-5xl font-serif text-zinc-900 dark:text-zinc-100 mb-4">
                            Capabilities
                        </h2>
                        <p className="text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto font-light">
                            Unlock the full potential of your documents
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-10 max-w-6xl mx-auto">
                        <motion.div
                            className="p-10 bg-zinc-50 dark:bg-zinc-900/30 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 hover:border-[#7756AF]/30 transition-all group"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="w-14 h-14 rounded-2xl bg-white dark:bg-zinc-900 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                                <MessageSquare className="w-7 h-7 text-[#7756AF]" />
                            </div>
                            <h3 className="text-2xl font-serif text-zinc-900 dark:text-zinc-100 mb-4">Interactive Q&A</h3>
                            <p className="text-lg text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed font-light">
                                Transform static documents into interactive knowledge bases. Ask complex questions about your PDFs, reports, and contracts.
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-3 text-zinc-700 dark:text-zinc-300">
                                    <Check className="w-5 h-5 text-[#7756AF] shrink-0" />
                                    <span className="font-light">Extract specific data points</span>
                                </li>
                                <li className="flex items-center gap-3 text-zinc-700 dark:text-zinc-300">
                                    <Check className="w-5 h-5 text-[#7756AF] shrink-0" />
                                    <span className="font-light">Summarize long documents</span>
                                </li>
                                <li className="flex items-center gap-3 text-zinc-700 dark:text-zinc-300">
                                    <Check className="w-5 h-5 text-[#7756AF] shrink-0" />
                                    <span className="font-light">Compare information across files</span>
                                </li>
                            </ul>
                        </motion.div>

                        <motion.div
                            className="p-10 bg-zinc-50 dark:bg-zinc-900/30 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 hover:border-[#7756AF]/30 transition-all group"
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="w-14 h-14 rounded-2xl bg-white dark:bg-zinc-900 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                                <Sparkles className="w-7 h-7 text-[#7756AF]" />
                            </div>
                            <h3 className="text-2xl font-serif text-zinc-900 dark:text-zinc-100 mb-4">Visual Understanding</h3>
                            <p className="text-lg text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed font-light">
                                Go beyond text. Upload images, charts, and diagrams. Our advanced vision models analyze visual content to provide insights.
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-3 text-zinc-700 dark:text-zinc-300">
                                    <Check className="w-5 h-5 text-[#7756AF] shrink-0" />
                                    <span className="font-light">Analyze charts and graphs</span>
                                </li>
                                <li className="flex items-center gap-3 text-zinc-700 dark:text-zinc-300">
                                    <Check className="w-5 h-5 text-[#7756AF] shrink-0" />
                                    <span className="font-light">Extract text from screenshots</span>
                                </li>
                                <li className="flex items-center gap-3 text-zinc-700 dark:text-zinc-300">
                                    <Check className="w-5 h-5 text-[#7756AF] shrink-0" />
                                    <span className="font-light">Interpret visual diagrams</span>
                                </li>
                            </ul>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Use Cases Section */}
            <section id="use-cases" className="py-20 px-6 bg-zinc-50 dark:bg-zinc-900/20">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        className="text-center mb-16"
                        {...fadeInUp}
                    >
                        <h2 className="text-4xl md:text-5xl font-serif text-zinc-900 dark:text-zinc-100 mb-4">
                            Use Cases
                        </h2>
                        <p className="text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto font-light">
                            See how different professionals use CorpusAI
                        </p>
                    </motion.div>

                    <motion.div
                        className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                    >
                        {useCases.map((useCase, index) => (
                            <motion.div
                                key={index}
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    show: { opacity: 1, y: 0 }
                                }}
                                className="p-8 bg-white dark:bg-black rounded-2xl text-center border border-zinc-200 dark:border-zinc-800 hover:border-[#7756AF]/30 transition-all hover:scale-105"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-[#F1EBF9] dark:bg-[#7756AF]/10 flex items-center justify-center mx-auto mb-4">
                                    <useCase.icon className="w-8 h-8 text-[#7756AF]" />
                                </div>
                                <h3 className="text-lg font-serif text-zinc-900 dark:text-zinc-100 mb-2">
                                    {useCase.title}
                                </h3>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 font-light">
                                    {useCase.description}
                                </p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        className="relative rounded-[3rem] overflow-hidden bg-zinc-900 dark:bg-zinc-800"
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
                        {/* Soft purple glow in background of CTA for variety */}
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#7756AF]/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>

                        <div className="relative p-16 md:p-24 text-center">
                            <h2 className="text-4xl md:text-5xl font-serif text-white mb-6">
                                Ready to get started?
                            </h2>
                            <p className="text-xl text-zinc-300 max-w-2xl mx-auto mb-10 font-light">
                                Join thousands of users who are already chatting with their documents.
                            </p>
                            <Link to="/chat">
                                <Button className="rounded-full bg-[#7756AF] hover:bg-[#664996] text-white font-medium px-10 h-14 text-lg shadow-xl transition-all hover:scale-105">
                                    Start for Free
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="py-20 px-6 bg-zinc-50 dark:bg-zinc-900/20">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        className="text-center mb-12"
                        {...fadeInUp}
                    >
                        <h2 className="text-4xl md:text-5xl font-serif text-zinc-900 dark:text-zinc-100 mb-4">
                            Frequently Asked Questions
                        </h2>
                    </motion.div>

                    <div className="max-w-4xl mx-auto grid gap-6">
                        {faqs.map((faq, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="p-8 bg-white dark:bg-black rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-[#7756AF]/30 transition-all cursor-pointer group"
                            >
                                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-3 group-hover:text-[#7756AF] transition-colors">
                                    {faq.question}
                                </h3>
                                <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed font-light">
                                    {faq.answer}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        className="text-center mb-12"
                        {...fadeInUp}
                    >
                        <h2 className="text-4xl md:text-5xl font-serif text-zinc-900 dark:text-zinc-100 mb-4">
                            Contact Us
                        </h2>
                        <p className="text-xl text-zinc-500 dark:text-zinc-400 font-light">
                            Have questions? We'd love to hear from you.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
                        {/* Contact Info */}
                        <motion.div
                            className="space-y-6"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="p-8 bg-zinc-50 dark:bg-zinc-900/30 rounded-[2rem] border border-zinc-200 dark:border-zinc-800">
                                <h3 className="text-xl font-serif text-zinc-900 dark:text-zinc-100 mb-6">Get in Touch</h3>
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-white dark:bg-zinc-800 flex items-center justify-center border border-zinc-100 dark:border-zinc-700">
                                            <Mail className="w-6 h-6 text-[#7756AF]" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-light">Email</p>
                                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">contact@corpusai.datanestx.tech</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-white dark:bg-zinc-800 flex items-center justify-center border border-zinc-100 dark:border-zinc-700">
                                            <MapPin className="w-6 h-6 text-[#7756AF]" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-light">Location</p>
                                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">San Francisco, CA</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-white dark:bg-zinc-800 flex items-center justify-center border border-zinc-100 dark:border-zinc-700">
                                            <Clock className="w-6 h-6 text-[#7756AF]" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-light">Response Time</p>
                                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Up to 24 hours</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Contact Form */}
                        <motion.div
                            className="p-8 bg-zinc-50 dark:bg-zinc-900/30 rounded-[2rem] border border-zinc-200 dark:border-zinc-800"
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                        >
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2 block">Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        required
                                        className="w-full px-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#7756AF] focus:border-transparent transition-all"
                                        placeholder="Your name"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2 block">Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                        required
                                        className="w-full px-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#7756AF] focus:border-transparent transition-all"
                                        placeholder="your@email.com"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2 block">Query Type</label>
                                    <select
                                        value={formData.queryType}
                                        onChange={(e) => setFormData(prev => ({ ...prev, queryType: e.target.value }))}
                                        required
                                        className="w-full px-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#7756AF] focus:border-transparent transition-all"
                                    >
                                        <option value="">Select a topic</option>
                                        {queryOptions.map((option) => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2 block">Message</label>
                                    <textarea
                                        value={formData.message}
                                        onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                                        required
                                        rows={4}
                                        className="w-full px-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#7756AF] focus:border-transparent resize-none transition-all"
                                        placeholder="How can we help?"
                                    />
                                </div>

                                <Button type="submit" disabled={isSubmitting} className="w-full bg-[#7756AF] hover:bg-[#664996] text-white rounded-xl h-12 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                                    <Send className="w-4 h-4 mr-2" />
                                    {isSubmitting ? 'Sending...' : 'Send Message'}
                                </Button>
                            </form>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <img src="/logo.png" alt="DataNesTX Logo" className="w-12 h-12" />
                            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">CorpusAI</span>
                        </div>
                        <div className="flex flex-col md:flex-row items-center gap-3 md:gap-6">
                            <div className="flex items-center gap-4 text-sm">
                                <Link to="/privacy" className="text-zinc-500 dark:text-zinc-400 hover:text-[#7756AF] transition-colors">
                                    Privacy Policy
                                </Link>
                                <Link to="/terms" className="text-zinc-500 dark:text-zinc-400 hover:text-[#7756AF] transition-colors">
                                    Terms of Service
                                </Link>
                            </div>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                © {new Date().getFullYear()} CorpusAI. All rights reserved.
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
