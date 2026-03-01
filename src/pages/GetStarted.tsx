import React from 'react';
import { Search, FileText, FlaskConical, Layout, MessageSquare, ArrowRight, Layers, Database, Brain, Zap, Briefcase, Compass, Globe, Cpu, Image as ImageIcon, BookOpen, Sparkles, SlidersHorizontal } from 'lucide-react';
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
                        CorpusAI is an intelligent AI workspace that lets you chat with multiple advanced models, analyze documents with RAG-powered retrieval, and build context-aware knowledge interactions — all in one place.
                        Upload PDFs, DOCX, TXT, Markdown files, or images and get accurate, citation-backed answers grounded in your own data.
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
                                <MessageSquare className="w-5 h-5 opacity-70" /> Multi-Model Chat
                            </h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Chat with 7 AI models including Llama 4 Scout (vision), GPT-4o, GPT-4o Mini, GPT OSS 120B, Kimi K2, Compound, and Compound Mini.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-xl font-medium text-[#3b1fa8] dark:text-[#d0c2ff] flex items-center gap-2">
                                <FileText className="w-5 h-5 opacity-70" /> Document Analysis
                            </h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Upload PDF, DOCX, DOC, TXT, and Markdown files. Get summaries, key findings, and answers grounded in your documents with inline citations.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-xl font-medium text-[#3b1fa8] dark:text-[#d0c2ff] flex items-center gap-2">
                                <ImageIcon className="w-5 h-5 opacity-70" /> Vision & Image Analysis
                            </h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Analyze images alongside text using vision-capable models like Llama 4 Scout and GPT-4o Mini for multimodal understanding.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-xl font-medium text-[#3b1fa8] dark:text-[#d0c2ff] flex items-center gap-2">
                                <Globe className="w-5 h-5 opacity-70" /> Web Search
                            </h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Augment AI responses with real-time web search results. Compound models have built-in search; others support external search toggle.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-xl font-medium text-[#3b1fa8] dark:text-[#d0c2ff] flex items-center gap-2">
                                <Brain className="w-5 h-5 opacity-70" /> RAG-Powered Citations
                            </h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Responses include clickable inline citations linking to specific document pages. Click a citation to view the source in the built-in document viewer.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-xl font-medium text-[#3b1fa8] dark:text-[#d0c2ff] flex items-center gap-2">
                                <Sparkles className="w-5 h-5 opacity-70" /> Dataset Generation
                            </h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Generate AI training datasets from your documents in the Creative Space. Preview and export structured data for fine-tuning.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Data Source Modes */}
                <section>
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl font-serif text-[#191919] dark:text-[#fcfcf9] mb-6">
                                Three Data Source Modes
                            </h2>
                            <div className="space-y-6 text-muted-foreground font-light">
                                <div className="flex items-start gap-4 p-4 border border-purple-100 dark:border-purple-900/30 rounded-2xl bg-white dark:bg-[#191919]">
                                    <Database className="w-6 h-6 text-purple-600 shrink-0 mt-1" />
                                    <div>
                                        <p className="text-base font-medium text-foreground mb-1">Documents Mode</p>
                                        <p className="text-sm text-muted-foreground">Answers strictly from your uploaded documents. Best for research, analysis, and fact-checking against your own data.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 p-4 border border-purple-100 dark:border-purple-900/30 rounded-2xl bg-white dark:bg-[#191919]">
                                    <Layers className="w-6 h-6 text-purple-600 shrink-0 mt-1" />
                                    <div>
                                        <p className="text-base font-medium text-foreground mb-1">Hybrid Mode</p>
                                        <p className="text-sm text-muted-foreground">Combines document context with AI knowledge. Great for getting comprehensive answers that reference your files and general knowledge.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 p-4 border border-purple-100 dark:border-purple-900/30 rounded-2xl bg-white dark:bg-[#191919]">
                                    <Cpu className="w-6 h-6 text-purple-600 shrink-0 mt-1" />
                                    <div>
                                        <p className="text-base font-medium text-foreground mb-1">AI Only Mode</p>
                                        <p className="text-sm text-muted-foreground">Pure AI conversation without document retrieval. Ideal for general questions, brainstorming, and creative tasks.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-[#f3f0ff] dark:bg-[#201a2b] rounded-[2.5rem] p-12 flex items-center justify-center min-h-[350px]">
                            <MessageSquare className="w-40 h-40 text-purple-200 dark:text-purple-900/50" />
                        </div>
                    </div>
                </section>

                {/* Behavior Modes */}
                <section className="bg-[#f3f0ff] dark:bg-[#201a2b] rounded-[2rem] p-12">
                    <h2 className="text-3xl font-serif text-[#3b1fa8] dark:text-[#d0c2ff] mb-6">
                        Behavior Modes
                    </h2>
                    <p className="text-muted-foreground mb-10 max-w-3xl font-light text-lg">
                        Behavior Modes control the creativity and tone of AI responses independently from how documents are retrieved. Use the slider next to the data source selector in the chat toolbar.
                    </p>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-white dark:bg-[#2a2438] p-6 rounded-2xl border border-purple-100 dark:border-purple-900/30 shadow-sm">
                            <div className="flex items-center gap-2 mb-3">
                                <SlidersHorizontal className="w-5 h-5 text-purple-600" />
                                <h3 className="text-lg font-medium text-foreground">Grounded</h3>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Low temperature, precise and factual. Best for research analysis, technical questions, and data extraction where accuracy is paramount.
                            </p>
                        </div>
                        <div className="bg-white dark:bg-[#2a2438] p-6 rounded-2xl border-2 border-purple-400 dark:border-purple-600 shadow-sm">
                            <div className="flex items-center gap-2 mb-3">
                                <SlidersHorizontal className="w-5 h-5 text-purple-600" />
                                <h3 className="text-lg font-medium text-foreground">Balanced</h3>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium">Default</span>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Moderate temperature, natural and versatile. The default mode that works well for most conversations and document interactions.
                            </p>
                        </div>
                        <div className="bg-white dark:bg-[#2a2438] p-6 rounded-2xl border border-purple-100 dark:border-purple-900/30 shadow-sm">
                            <div className="flex items-center gap-2 mb-3">
                                <SlidersHorizontal className="w-5 h-5 text-purple-600" />
                                <h3 className="text-lg font-medium text-foreground">Creative</h3>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                High temperature, expressive and varied. Great for brainstorming, creative writing, and generating diverse ideas. Auto-downgrades to Balanced in Document Only mode.
                            </p>
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
                                Upload files directly into a chat for immediate analysis. Supports PDF, DOCX, DOC, TXT, MD, PNG, JPG, and JPEG. Files expire after 24 hours.
                            </p>
                        </div>

                        <div className="group p-8 bg-[#fcfcf9] dark:bg-[#191919] rounded-[2rem] border border-border hover:border-purple-500/30 transition-all hover:bg-white dark:hover:bg-[#201a2b]">
                            <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 mb-6 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/40 transition-colors">
                                <Database className="w-7 h-7" />
                            </div>
                            <h3 className="text-2xl font-serif text-[#191919] dark:text-[#fcfcf9] mb-3">Permanent Resources</h3>
                            <p className="text-lg text-muted-foreground leading-relaxed font-light">
                                Save documents to your personal knowledge base in the Resources page. Permanent resources are available across all chats and can be selectively attached via the Data Source selector.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Available Models */}
                <section className="bg-[#f3f0ff] dark:bg-[#201a2b] rounded-[2rem] p-12">
                    <h2 className="text-3xl font-serif text-[#3b1fa8] dark:text-[#d0c2ff] mb-12">
                        Available Models
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { name: 'Llama 4 Scout', tags: ['Default', 'Vision'], desc: 'Meta\'s latest model with image understanding capabilities.' },
                            { name: 'GPT-4o', tags: ['Vision'], desc: 'OpenAI\'s advanced reasoning model for complex analysis.' },
                            { name: 'GPT-4o Mini', tags: ['Vision'], desc: 'Fast, efficient model with vision support for quick tasks.' },
                            { name: 'GPT OSS 120B', tags: [], desc: 'Large open-source model for deep, nuanced responses.' },
                            { name: 'Kimi K2', tags: [], desc: 'Moonshot AI\'s powerful instruct model for diverse tasks.' },
                            { name: 'Compound', tags: ['Web Search'], desc: 'Built-in web search for real-time information retrieval.' },
                            { name: 'Compound Mini', tags: ['Web Search'], desc: 'Lightweight model with integrated web search capabilities.' },
                        ].map((model) => (
                            <div key={model.name} className="bg-white dark:bg-[#2a2438] p-6 rounded-2xl border border-purple-100 dark:border-purple-900/30 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <Cpu className="w-4 h-4 text-purple-600" />
                                    <h3 className="font-medium text-foreground">{model.name}</h3>
                                </div>
                                {model.tags.length > 0 && (
                                    <div className="flex gap-1.5 mb-3">
                                        {model.tags.map(tag => (
                                            <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <p className="text-sm text-muted-foreground leading-relaxed">{model.desc}</p>
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
                            Intelligent query routing automatically chooses the best execution path — full-context summaries for small documents, hierarchical summarization for large ones, and RAG retrieval for specific questions. Summaries are cached for instant repeat access.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-3xl font-serif text-[#191919] dark:text-[#fcfcf9] mb-8 flex items-center gap-3">
                            <Briefcase className="w-8 h-8 text-purple-600" />
                            Built For
                        </h2>
                        <ul className="space-y-6">
                            {['Developers and technical teams', 'Researchers and analysts', 'Startups and product teams', 'Students working with textbooks and papers', 'Anyone working with documents, data, or knowledge'].map((item, i) => (
                                <li key={i} className="flex items-center gap-4 text-muted-foreground text-lg group">
                                    <div className="w-2 h-2 rounded-full bg-purple-300 group-hover:bg-purple-600 transition-colors shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                {/* Supported Formats */}
                <section className="bg-[#f3f0ff] dark:bg-[#201a2b] rounded-[2rem] p-12">
                    <h2 className="text-3xl font-serif text-[#3b1fa8] dark:text-[#d0c2ff] mb-8">
                        Supported File Formats
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { ext: 'PDF', desc: 'Documents & reports' },
                            { ext: 'DOCX / DOC', desc: 'Word documents' },
                            { ext: 'TXT / MD', desc: 'Plain text & Markdown' },
                            { ext: 'PNG / JPG', desc: 'Images for vision models' },
                        ].map(format => (
                            <div key={format.ext} className="bg-white dark:bg-[#2a2438] p-5 rounded-2xl border border-purple-100 dark:border-purple-900/30 text-center">
                                <p className="font-semibold text-purple-700 dark:text-purple-300 text-lg mb-1">{format.ext}</p>
                                <p className="text-xs text-muted-foreground">{format.desc}</p>
                            </div>
                        ))}
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
                            Upload your documents, select a model, and start asking questions. CorpusAI will retrieve relevant context, generate grounded answers, and provide clickable citations back to your source material.
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
