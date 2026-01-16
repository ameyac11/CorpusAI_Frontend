import React from 'react';
import { Search, FileText, FlaskConical, Layout, MessageSquare, ArrowRight, Layers, Database, Brain, Zap, Briefcase, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useTheme } from '@/contexts/ThemeContext';

export default function GetStarted() {
    const { resolvedTheme } = useTheme();

    return (
        <div className="min-h-screen bg-[#fcfcf9] dark:bg-[#191919] text-foreground font-sans selection:bg-purple-500/20">
            {/* Navbar */}
            <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
                <div className="flex items-center gap-2">
                    <img src={resolvedTheme === 'dark' ? "/DataNesTX_Logo_Dark_Frontend.png" : "/DataNesTX_Logo_Light_Frontend.png"} alt="DataNesTX Logo" className="w-12 h-12" />
                    <span className="text-xl font-medium tracking-tight">CorpusAI</span>
                </div>
                <div className="flex items-center gap-6">
                    <Link to="/chat" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">Chat</Link>
                    <Link to="/documents" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">Resources</Link>
                    <Link to="/chat">
                        <Button className="rounded-full bg-purple-600 hover:bg-purple-700 text-white font-medium px-6">
                            Try CorpusAI
                        </Button>
                    </Link>
                </div>
            </nav>

            {/* Hero (Original Design Restored) */}
            <div className="max-w-7xl mx-auto px-6 pt-20 pb-16">
                <h1 className="text-[5rem] leading-[0.95] font-serif tracking-tight text-[#191919] dark:text-[#fcfcf9] mb-12">
                    Getting Started
                </h1>
                <div className="w-full h-[300px] rounded-3xl overflow-hidden relative border border-purple-500/20 shadow-2xl">
                    <img
                        src="/get_started_hero.png"
                        alt="Get Started Hero"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#191919] to-transparent opacity-60"></div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 pb-32 space-y-32">

                {/* Intro Section - What is CorpusAI? */}
                <section>
                    <h2 className="text-4xl font-serif text-[#191919] dark:text-[#fcfcf9] mb-6">
                        What is CorpusAI?
                    </h2>
                    <p className="text-xl leading-relaxed text-muted-foreground max-w-3xl font-light">
                        CorpusAI is an intelligent AI workspace designed to help you chat with advanced models, work with your documents, and build context-aware knowledge interactions — all in one place.
                        It combines conversational AI with structured resource management, allowing you to get accurate, relevant answers grounded in your own data.
                    </p>
                </section>

                {/* What You Can Do (Styled Container) */}
                <section className="bg-[#f3f0ff] dark:bg-[#201a2b] rounded-[2rem] p-12">
                    <h2 className="text-3xl font-serif text-[#3b1fa8] dark:text-[#d0c2ff] mb-12">
                        What You Can Do
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
                        <div className="space-y-3">
                            <h3 className="text-xl font-medium text-[#3b1fa8] dark:text-[#d0c2ff] flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 opacity-70" /> General Q&A
                            </h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Ask general questions and get explanations using advanced AI models.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-xl font-medium text-[#3b1fa8] dark:text-[#d0c2ff] flex items-center gap-2">
                                <FlaskConical className="w-5 h-5 opacity-70" /> Technical Discussions
                            </h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Engage in deep technical and research-oriented conversations.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-xl font-medium text-[#3b1fa8] dark:text-[#d0c2ff] flex items-center gap-2">
                                <FileText className="w-5 h-5 opacity-70" /> Document Analysis
                            </h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Upload documents for understanding, summarization, and key insight extraction.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-xl font-medium text-[#3b1fa8] dark:text-[#d0c2ff] flex items-center gap-2">
                                <Layout className="w-5 h-5 opacity-70" /> Image Analysis
                            </h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Analyze images and files alongside text for multimodal understanding.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-xl font-medium text-[#3b1fa8] dark:text-[#d0c2ff] flex items-center gap-2">
                                <Brain className="w-5 h-5 opacity-70" /> Knowledge Reasoning
                            </h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Use your own resources for grounded, context-aware reasoning.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Chat-Based AI Interaction */}
                <section>
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl font-serif text-[#191919] dark:text-[#fcfcf9] mb-6">
                                Chat-Based AI Interaction
                            </h2>
                            <div className="space-y-6 text-xl leading-relaxed text-muted-foreground font-light">
                                <p>
                                    Conversations in CorpusAI are continuous and context-aware. The AI understands previous messages within the same chat and responds accordingly, enabling deeper follow-up questions and iterative exploration.
                                </p>
                                <div className="flex items-start gap-4 p-4 border border-purple-100 dark:border-purple-900/30 rounded-2xl bg-white dark:bg-[#191919]">
                                    <Layers className="w-6 h-6 text-purple-600 shrink-0 mt-1" />
                                    <p className="text-base text-muted-foreground"> Each chat operates independently, ensuring clarity and focus for different tasks or topics.</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-[#f3f0ff] dark:bg-[#201a2b] rounded-[2.5rem] p-12 flex items-center justify-center min-h-[350px]">
                            <MessageSquare className="w-40 h-40 text-purple-200 dark:text-purple-900/50" />
                        </div>
                    </div>
                </section>

                {/* Working with Files and Data */}
                <section>
                    <h2 className="text-3xl font-serif text-[#191919] dark:text-[#fcfcf9] mb-12">
                        Working with Files and Data
                    </h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="group p-8 bg-[#fcfcf9] dark:bg-[#191919] rounded-[2rem] border border-border hover:border-purple-500/30 transition-all hover:bg-white dark:hover:bg-[#201a2b]">
                            <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 mb-6 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/40 transition-colors">
                                <FileText className="w-7 h-7" />
                            </div>
                            <h3 className="text-2xl font-serif text-[#191919] dark:text-[#fcfcf9] mb-3">Temporary Chat Uploads</h3>
                            <p className="text-lg text-muted-foreground leading-relaxed font-light">
                                Intended for short-term interactions. Upload files directly to a chat for immediate analysis without cluttering your permanent library.
                            </p>
                        </div>

                        <div className="group p-8 bg-[#fcfcf9] dark:bg-[#191919] rounded-[2rem] border border-border hover:border-purple-500/30 transition-all hover:bg-white dark:hover:bg-[#201a2b]">
                            <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 mb-6 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/40 transition-colors">
                                <Database className="w-7 h-7" />
                            </div>
                            <h3 className="text-2xl font-serif text-[#191919] dark:text-[#fcfcf9] mb-3">Permanent Resources</h3>
                            <p className="text-lg text-muted-foreground leading-relaxed font-light">
                                Designed for long-term reuse and knowledge building. Saved resources form your personal knowledge base and are available across all chats.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Context Awareness */}
                <section className="bg-[#f3f0ff] dark:bg-[#201a2b] rounded-[2rem] p-12">
                    <div className="flex flex-col md:flex-row gap-8 mb-12 items-start">
                        <div>
                            <h2 className="text-3xl font-serif text-[#3b1fa8] dark:text-[#d0c2ff] mb-6">
                                Context Awareness
                            </h2>
                            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
                                CorpusAI determines relevance automatically. Responses are generated using a combination of active chat context, uploaded files, and saved resources. Only necessary information is used, helping maintain precision.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {['Active Chat Context', 'Uploaded Files', 'Saved Resources'].map((item, i) => (
                            <div key={item} className="bg-white dark:bg-[#2a2438] p-8 rounded-2xl border border-purple-100 dark:border-purple-900/30 flex items-center justify-center text-center font-medium text-purple-900 dark:text-purple-100 text-lg shadow-sm">
                                {item}
                            </div>
                        ))}
                    </div>
                </section>

                {/* Performance & Workflows */}
                <section className="grid lg:grid-cols-2 gap-16">
                    <div>
                        <h2 className="text-3xl font-serif text-[#191919] dark:text-[#fcfcf9] mb-8 flex items-center gap-3">
                            <Zap className="w-8 h-8 text-purple-600" />
                            Performance
                        </h2>
                        <p className="text-xl leading-relaxed text-muted-foreground font-light">
                            The system is optimized to handle large documents and repeated queries efficiently. Relevant content may be cached or processed incrementally to improve speed and reduce unnecessary computation, depending on the model in use.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-3xl font-serif text-[#191919] dark:text-[#fcfcf9] mb-8 flex items-center gap-3">
                            <Briefcase className="w-8 h-8 text-purple-600" />
                            Real Workflows
                        </h2>
                        <ul className="space-y-6">
                            {['Developers and technical teams', 'Researchers and analysts', 'Startups and product teams', 'Anyone working with documents, data, or knowledge'].map((item, i) => (
                                <li key={i} className="flex items-center gap-4 text-muted-foreground text-lg group">
                                    <div className="w-2 h-2 rounded-full bg-purple-300 group-hover:bg-purple-600 transition-colors shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                {/* Start Exploring */}
                <section className="border-t border-border pt-16 text-center">
                    <div className="py-12">
                        <div className="w-16 h-16 bg-[#f3f0ff] dark:bg-[#201a2b] rounded-full flex items-center justify-center mx-auto mb-8">
                            <Compass className="w-8 h-8 text-purple-600" />
                        </div>
                        <h2 className="text-4xl font-serif text-[#191919] dark:text-[#fcfcf9] mb-6">
                            Start Exploring
                        </h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12 font-light leading-relaxed">
                            CorpusAI works best when questions are clear and context is meaningful. As you chat, upload files, and build resources, the system becomes more powerful — turning information into usable knowledge.
                        </p>
                        <Link to="/chat">
                            <Button className="rounded-full bg-purple-600 hover:bg-purple-700 text-white font-medium px-10 h-14 text-lg">
                                Start Chatting <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </Link>
                    </div>
                </section>

            </div>

            {/* Footer */}
            <footer className="border-t border-border mt-24">
                <div className="max-w-7xl mx-auto px-6 py-12 flex items-center justify-between text-muted-foreground text-sm">
                    <p>© 2026 CorpusAI data engine.</p>
                    <div className="flex gap-6">
                        <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
                        <Link to="/terms" className="hover:text-foreground">Terms</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
