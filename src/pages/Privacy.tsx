import React from 'react';
import { Link } from 'react-router-dom';
import { LandingHeader } from '@/components/layout/LandingHeader';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

export default function Privacy() {
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
              <Shield className="w-8 h-8 text-[#7756AF]" />
            </div>
            <h1 className="text-4xl md:text-5xl font-serif text-zinc-900 dark:text-zinc-100 mb-4">
              Privacy Policy
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
                This Privacy Policy explains how CorpusAI ("we", "our", "us") collects, uses, stores, and protects information when you use our website and services.
              </p>
              <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed mb-12">
                By accessing or using CorpusAI, you agree to this Privacy Policy.
              </p>

              {/* Section 1 */}
              <div className="mb-10">
                <h2 className="text-2xl font-serif text-zinc-900 dark:text-zinc-100 mb-4 border-b border-zinc-200 dark:border-[#2a2438] pb-3">
                  1. Information We Collect
                </h2>

                <h3 className="text-xl font-medium text-zinc-900 dark:text-zinc-100 mb-3 mt-6">
                  a) Account Information
                </h3>
                <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4">
                  When you create an account, we collect information such as:
                </p>
                <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-300 leading-relaxed mb-6 space-y-2">
                  <li>Email address</li>
                  <li>Username or name</li>
                  <li>Login credentials (stored securely)</li>
                </ul>

                <h3 className="text-xl font-medium text-zinc-900 dark:text-zinc-100 mb-3 mt-6">
                  b) User-Uploaded Content
                </h3>
                <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4">
                  Users may upload files, documents, images, or other data while using the service.
                </p>
                <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4">
                  We support two types of storage:
                </p>
                <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4 space-y-2">
                  <li>Temporary storage: Files uploaded during chat sessions may be automatically deleted after a limited period unless saved by the user.</li>
                  <li>Permanent storage: Files saved by users as resources are stored until the user deletes them.</li>
                </ul>
                <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed mb-6">
                  Users retain full ownership of their uploaded content.
                </p>

                <h3 className="text-xl font-medium text-zinc-900 dark:text-zinc-100 mb-3 mt-6">
                  c) Technical & Usage Data
                </h3>
                <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed mb-6">
                  We may collect limited technical data such as IP address, browser type, device information, and timestamps. This data is used only for security, debugging, and service reliability.
                </p>
              </div>

              {/* Section 2 */}
              <div className="mb-10">
                <h2 className="text-2xl font-serif text-zinc-900 dark:text-zinc-100 mb-4 border-b border-zinc-200 dark:border-[#2a2438] pb-3">
                  2. Cookies
                </h2>
                <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4">
                  CorpusAI uses only essential session cookies required for:
                </p>
                <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4 space-y-2">
                  <li>User authentication</li>
                  <li>Maintaining login sessions</li>
                  <li>Security purposes</li>
                </ul>
                <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed mb-2">
                  We do not use advertising or tracking cookies.
                </p>
                <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed mb-6">
                  We do not intentionally use analytics cookies at this time.
                </p>
              </div>

              {/* Section 3 */}
              <div className="mb-10">
                <h2 className="text-2xl font-serif text-zinc-900 dark:text-zinc-100 mb-4 border-b border-zinc-200 dark:border-[#2a2438] pb-3">
                  3. How We Use Information
                </h2>
                <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4">
                  We use collected information to:
                </p>
                <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-300 leading-relaxed mb-6 space-y-2">
                  <li>Provide and operate the service</li>
                  <li>Authenticate users and maintain accounts</li>
                  <li>Process user inputs and uploaded content</li>
                  <li>Improve reliability and security</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </div>

              {/* Section 4 */}
              <div className="mb-10">
                <h2 className="text-2xl font-serif text-zinc-900 dark:text-zinc-100 mb-4 border-b border-zinc-200 dark:border-[#2a2438] pb-3">
                  4. AI Processing
                </h2>
                <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4">
                  User inputs and uploaded content are processed using AI systems to generate responses requested by the user.
                </p>
                <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed mb-6">
                  We do not use user content to train public AI models unless explicitly stated.
                </p>
              </div>

              {/* Section 5 */}
              <div className="mb-10">
                <h2 className="text-2xl font-serif text-zinc-900 dark:text-zinc-100 mb-4 border-b border-zinc-200 dark:border-[#2a2438] pb-3">
                  5. Data Sharing
                </h2>
                <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4">
                  We do not sell user data.
                </p>
                <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4">
                  Data may be shared only with:
                </p>
                <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-300 leading-relaxed mb-6 space-y-2">
                  <li>Cloud infrastructure providers (for hosting and storage)</li>
                  <li>AI service providers (for response generation)</li>
                  <li>Legal authorities when required by law</li>
                </ul>
              </div>

              {/* Section 6 */}
              <div className="mb-10">
                <h2 className="text-2xl font-serif text-zinc-900 dark:text-zinc-100 mb-4 border-b border-zinc-200 dark:border-[#2a2438] pb-3">
                  6. Data Security
                </h2>
                <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed mb-6">
                  We use industry-standard security practices including encryption, access controls, and secure infrastructure. However, no system can guarantee absolute security.
                </p>
              </div>

              {/* Section 7 */}
              <div className="mb-10">
                <h2 className="text-2xl font-serif text-zinc-900 dark:text-zinc-100 mb-4 border-b border-zinc-200 dark:border-[#2a2438] pb-3">
                  7. Data Retention
                </h2>
                <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-300 leading-relaxed mb-6 space-y-2">
                  <li>Temporary content is deleted automatically after a limited time.</li>
                  <li>Permanent resources remain until deleted by the user.</li>
                  <li>Account data is retained while the account is active.</li>
                </ul>
              </div>

              {/* Section 8 */}
              <div className="mb-10">
                <h2 className="text-2xl font-serif text-zinc-900 dark:text-zinc-100 mb-4 border-b border-zinc-200 dark:border-[#2a2438] pb-3">
                  8. User Rights
                </h2>
                <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4">
                  Depending on your location, you may have the right to:
                </p>
                <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4 space-y-2">
                  <li>Access your personal data</li>
                  <li>Request correction or deletion</li>
                  <li>Request data export</li>
                  <li>Withdraw consent</li>
                </ul>
                <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed mb-6">
                  Requests can be made by contacting us.
                </p>
              </div>

              {/* Section 9 */}
              <div className="mb-10">
                <h2 className="text-2xl font-serif text-zinc-900 dark:text-zinc-100 mb-4 border-b border-zinc-200 dark:border-[#2a2438] pb-3">
                  9. Children's Privacy
                </h2>
                <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed mb-6">
                  CorpusAI is not intended for users under the age of 13. We do not knowingly collect data from children.
                </p>
              </div>

              {/* Section 10 */}
              <div className="mb-10">
                <h2 className="text-2xl font-serif text-zinc-900 dark:text-zinc-100 mb-4 border-b border-zinc-200 dark:border-[#2a2438] pb-3">
                  10. Changes to This Policy
                </h2>
                <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed mb-6">
                  We may update this Privacy Policy from time to time. Updates will be posted on this page.
                </p>
              </div>

              {/* Section 11 */}
              <div className="mb-6">
                <h2 className="text-2xl font-serif text-zinc-900 dark:text-zinc-100 mb-4 border-b border-zinc-200 dark:border-[#2a2438] pb-3">
                  11. Contact
                </h2>
                <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed mb-2">
                  For any questions about this Privacy Policy, contact:
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
