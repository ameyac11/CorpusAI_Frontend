import React from 'react';
import { Link } from 'react-router-dom';
import { LandingHeader } from '@/components/layout/LandingHeader';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';

export default function Terms() {
    return (
        <div className="min-h-screen bg-[#fcfcf9] dark:bg-[#191919] font-sans">
            <LandingHeader />

            {/* Hero Section */}
            <section className="pt-32 pb-12 px-6">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        className="text-center mb-12"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="w-16 h-16 rounded-2xl bg-[#F1EBF9] dark:bg-[#7756AF]/10 flex items-center justify-center mx-auto mb-6">
                            <FileText className="w-8 h-8 text-[#7756AF]" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-serif text-zinc-900 dark:text-zinc-100 mb-4">
                            Terms of Service
                        </h1>
                        <p className="text-lg text-zinc-500 dark:text-zinc-400 font-light">
                            Last updated: January 16, 2026
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Content Section */}
            <section className="pb-20 px-6">
                <motion.div
                    className="max-w-4xl mx-auto"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    <div className="prose prose-zinc dark:prose-invert max-w-none">
                        <div className="bg-white dark:bg-zinc-900/50 rounded-[2rem] p-8 md:p-12 border border-purple-100 dark:border-purple-500/10">
                            <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed mb-8">
                                By accessing or using CorpusAI, you agree to these Terms of Service. If you do not agree, do not use the service.
                            </p>

                            {/* Section 1 */}
                            <div className="mb-10">
                                <h2 className="text-2xl font-serif text-zinc-900 dark:text-zinc-100 mb-4 border-b border-zinc-200 dark:border-[#2a2438] pb-3">
                                    1. Description of Service
                                </h2>
                                <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4">
                                    CorpusAI is an AI-powered platform that processes user inputs and uploaded content to generate responses and insights.
                                </p>
                                <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed mb-6">
                                    The service may change, improve, or be discontinued at any time.
                                </p>
                            </div>

                            {/* Section 2 */}
                            <div className="mb-10">
                                <h2 className="text-2xl font-serif text-zinc-900 dark:text-zinc-100 mb-4 border-b border-zinc-200 dark:border-[#2a2438] pb-3">
                                    2. User Accounts
                                </h2>
                                <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-300 leading-relaxed mb-6 space-y-2">
                                    <li>You are responsible for maintaining the security of your account.</li>
                                    <li>You must provide accurate information.</li>
                                    <li>You are responsible for all activity under your account.</li>
                                </ul>
                            </div>

                            {/* Section 3 */}
                            <div className="mb-10">
                                <h2 className="text-2xl font-serif text-zinc-900 dark:text-zinc-100 mb-4 border-b border-zinc-200 dark:border-[#2a2438] pb-3">
                                    3. User Content
                                </h2>
                                <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-300 leading-relaxed mb-6 space-y-2">
                                    <li>Users retain ownership of all uploaded content.</li>
                                    <li>You grant CorpusAI permission to process content solely to provide the service.</li>
                                    <li>You are responsible for ensuring your content is lawful.</li>
                                </ul>
                            </div>

                            {/* Section 4 */}
                            <div className="mb-10">
                                <h2 className="text-2xl font-serif text-zinc-900 dark:text-zinc-100 mb-4 border-b border-zinc-200 dark:border-[#2a2438] pb-3">
                                    4. Acceptable Use
                                </h2>
                                <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4">
                                    You agree not to:
                                </p>
                                <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4 space-y-2">
                                    <li>Upload illegal, harmful, or abusive content</li>
                                    <li>Attempt to breach system security</li>
                                    <li>Misuse the service for unlawful purposes</li>
                                    <li>Interfere with service performance</li>
                                </ul>
                                <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed mb-6">
                                    We may suspend or terminate accounts that violate these rules.
                                </p>
                            </div>

                            {/* Section 5 */}
                            <div className="mb-10">
                                <h2 className="text-2xl font-serif text-zinc-900 dark:text-zinc-100 mb-4 border-b border-zinc-200 dark:border-[#2a2438] pb-3">
                                    5. AI Disclaimer
                                </h2>
                                <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4">
                                    AI-generated responses:
                                </p>
                                <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4 space-y-2">
                                    <li>May be inaccurate, incomplete, or outdated</li>
                                    <li>Are not professional, legal, medical, or financial advice</li>
                                </ul>
                                <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed mb-6">
                                    You are responsible for verifying outputs before relying on them.
                                </p>
                            </div>

                            {/* Section 6 */}
                            <div className="mb-10">
                                <h2 className="text-2xl font-serif text-zinc-900 dark:text-zinc-100 mb-4 border-b border-zinc-200 dark:border-[#2a2438] pb-3">
                                    6. Service Availability
                                </h2>
                                <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4">
                                    The service is provided "as is" and "as available".
                                </p>
                                <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed mb-6">
                                    We do not guarantee uninterrupted or error-free operation.
                                </p>
                            </div>

                            {/* Section 7 */}
                            <div className="mb-10">
                                <h2 className="text-2xl font-serif text-zinc-900 dark:text-zinc-100 mb-4 border-b border-zinc-200 dark:border-[#2a2438] pb-3">
                                    7. Limitation of Liability
                                </h2>
                                <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4">
                                    To the maximum extent permitted by law, CorpusAI is not liable for:
                                </p>
                                <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4 space-y-2">
                                    <li>Data loss</li>
                                    <li>Incorrect AI outputs</li>
                                    <li>Service interruptions</li>
                                </ul>
                                <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed mb-6">
                                    Use of the service is at your own risk.
                                </p>
                            </div>

                            {/* Section 8 */}
                            <div className="mb-10">
                                <h2 className="text-2xl font-serif text-zinc-900 dark:text-zinc-100 mb-4 border-b border-zinc-200 dark:border-[#2a2438] pb-3">
                                    8. Termination
                                </h2>
                                <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed mb-6">
                                    We may suspend or terminate access for violations of these terms or for security reasons. Users may stop using the service at any time.
                                </p>
                            </div>

                            {/* Section 9 */}
                            <div className="mb-10">
                                <h2 className="text-2xl font-serif text-zinc-900 dark:text-zinc-100 mb-4 border-b border-zinc-200 dark:border-[#2a2438] pb-3">
                                    9. Changes to Terms
                                </h2>
                                <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed mb-6">
                                    We may update these Terms periodically. Continued use means acceptance of the updated terms.
                                </p>
                            </div>

                            {/* Section 10 */}
                            <div className="mb-10">
                                <h2 className="text-2xl font-serif text-zinc-900 dark:text-zinc-100 mb-4 border-b border-zinc-200 dark:border-[#2a2438] pb-3">
                                    10. Governing Law
                                </h2>
                                <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed mb-6">
                                    These Terms are governed by the laws of India.
                                </p>
                            </div>

                            {/* Section 11 */}
                            <div className="mb-6">
                                <h2 className="text-2xl font-serif text-zinc-900 dark:text-zinc-100 mb-4 border-b border-zinc-200 dark:border-[#2a2438] pb-3">
                                    11. Contact
                                </h2>
                                <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed mb-2">
                                    For questions regarding these Terms, contact:
                                </p>
                                <p className="text-[#7756AF] font-medium">
                                    support@corpusai.datanestx.tech
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Back to Home Link */}
                    <div className="mt-8 text-center">
                        <Link
                            to="/"
                            className="text-[#7756AF] hover:text-[#664996] font-medium transition-colors inline-flex items-center gap-2"
                        >
                            ← Back to Home
                        </Link>
                    </div>
                </motion.div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-6 border-t border-purple-100 dark:border-[#2a2438] bg-[#fcfcf9] dark:bg-[#191919]">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <img src="/DataNesTX_Logo_Light_Frontend.png" alt="DataNesTX Logo" className="w-10 h-10 block dark:hidden" />
                            <img src="/DataNesTX_Logo_Dark_Frontend.png" alt="DataNesTX Logo" className="w-10 h-10 hidden dark:block" />
                            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">CorpusAI</span>
                        </div>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            © {new Date().getFullYear()} CorpusAI. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
