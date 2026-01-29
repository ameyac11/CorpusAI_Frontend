import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from '@/contexts/ThemeContext';

export function LoadingScreen() {
    const { resolvedTheme } = useTheme();
    const [isVisible, setIsVisible] = useState(true);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Animate progress bar
        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    return 100;
                }
                return prev + 2;
            });
        }, 50);

        return () => {
            clearInterval(progressInterval);
        };
    }, []);

    return (
        <AnimatePresence mode="wait">
            {isVisible && (
                <motion.div
                    key="splash"
                    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden bg-[#030014]"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                >
                    {/* Background Image with Dark Overlay */}
                    <div className="absolute inset-0 z-0">
                        <div className="absolute inset-0 bg-[url('/background.png')] bg-cover bg-center opacity-100" />
                        <div className="absolute inset-0 bg-[#030014]/70 backdrop-blur-[0px]" />
                    </div>

                    {/* Corner Accents */}
                    <div className="absolute top-10 left-10 w-24 h-24 border-t-[1px] border-l-[1px] border-white/10 rounded-tl-3xl pointer-events-none z-10" />
                    <div className="absolute bottom-10 right-10 w-24 h-24 border-b-[1px] border-r-[1px] border-white/10 rounded-br-3xl pointer-events-none z-10" />

                    {/* Content */}
                    <motion.div
                        className="relative z-10 flex flex-col items-center"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        {/* Logo */}
                        <motion.div
                            className="mb-8 p-4 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/5 shadow-2xl"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.6 }}
                        >
                            <img
                                src="/DataNesTX_Logo_Light_Frontend.png"
                                alt="DataNesTX Logo"
                                className="w-20 h-20 object-contain drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                            />
                        </motion.div>

                        {/* Brand Name */}
                        <div className="text-center mb-14 space-y-4">
                            <h1 className="text-5xl md:text-6xl font-black tracking-tight text-white drop-shadow-lg">
                                Corpus<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-500">AI</span>
                            </h1>
                            <p className="text-white/40 text-[10px] md:text-xs tracking-[0.5em] uppercase font-bold">
                                AI-Powered Knowledge Assistant
                            </p>
                        </div>

                        {/* Loading Bar */}
                        <motion.div
                            className="w-72 md:w-80 space-y-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                <motion.div
                                    className="h-full rounded-full bg-gradient-to-r from-purple-600 via-fuchsia-500 to-purple-600 relative overflow-hidden"
                                    style={{ width: `${progress}%` }}
                                >
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                                        animate={{ x: ["-100%", "100%"] }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                    />
                                </motion.div>
                            </div>

                            <motion.p
                                className="text-[10px] text-white/30 text-center font-medium tracking-widest uppercase"
                                animate={{ opacity: [0.4, 0.8, 0.4] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                Loading...
                            </motion.p>
                        </motion.div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
