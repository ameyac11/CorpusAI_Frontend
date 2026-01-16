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
                    className={cn(
                        "fixed inset-0 z-[9999] flex flex-col items-center justify-center",
                        resolvedTheme === 'dark' ? "bg-[#1a1b1e]" : "bg-[#fcfcf9]"
                    )}
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                >
                    {/* Animated dot grid background */}
                    <div className="absolute inset-0 overflow-hidden">
                        <motion.div
                            className="absolute inset-0"
                            style={{
                                backgroundImage: `radial-gradient(circle at 1px 1px, ${resolvedTheme === 'dark' ? 'rgba(147, 51, 234, 0.12)' : 'rgba(147, 51, 234, 0.08)'} 1px, transparent 0)`,
                                backgroundSize: "32px 32px",
                            }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1 }}
                        />
                    </div>



                    {/* Content */}
                    <motion.div
                        className="relative z-10 flex flex-col items-center"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    >
                        {/* Logo */}
                        <motion.div
                            className="relative mb-10"
                            initial={{ rotate: -90, scale: 0 }}
                            animate={{ rotate: 0, scale: 1 }}
                            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                        >
                            <div className="relative w-28 h-28 md:w-36 md:h-36 flex items-center justify-center">
                                {/* Logo Image */}
                                <motion.img
                                    src={resolvedTheme === 'dark' ? "/DataNesTX_Logo_Dark_Frontend.png" : "/DataNesTX_Logo_Light_Frontend.png"}
                                    alt="DataNesTX Logo"
                                    className="w-24 h-24 md:w-32 md:h-32 drop-shadow-2xl"
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.4, delay: 0.5 }}
                                />

                                {/* Pulsing rings */}
                                {[0, 1, 2].map((i) => (
                                    <motion.div
                                        key={i}
                                        className="absolute inset-0 rounded-2xl border border-purple-500/20"
                                        initial={{ scale: 1, opacity: 0.6 }}
                                        animate={{
                                            scale: [1, 1.5, 1.5],
                                            opacity: [0.6, 0, 0],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeOut",
                                            delay: i * 0.6,
                                        }}
                                    />
                                ))}
                            </div>
                        </motion.div>

                        {/* Brand name */}
                        <motion.div
                            className="text-center mb-12"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                        >
                            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-2">
                                <span className={resolvedTheme === 'dark' ? "text-white" : "text-[#191919]"}>Corpus</span>
                                <motion.span
                                    className="text-purple-500"
                                    animate={{ opacity: [1, 0.5, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    AI
                                </motion.span>
                            </h1>
                            <motion.p
                                className={cn(
                                    "text-xs md:text-sm tracking-[0.3em] uppercase font-medium",
                                    resolvedTheme === 'dark' ? "text-gray-400" : "text-gray-600"
                                )}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.4, delay: 0.6 }}
                            >
                                AI-Powered Knowledge Assistant
                            </motion.p>
                        </motion.div>

                        {/* Loading bar */}
                        <motion.div
                            className="w-56 md:w-72"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.7 }}
                        >
                            <div className={cn(
                                "h-1.5 rounded-full overflow-hidden shadow-inner",
                                resolvedTheme === 'dark' ? "bg-gray-700" : "bg-gray-200"
                            )}>
                                <motion.div
                                    className="h-full bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 rounded-full relative"
                                    style={{ width: `${progress}%` }}
                                    transition={{ duration: 0.1 }}
                                >
                                    {/* Shimmer effect */}
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                        animate={{ x: ["-100%", "100%"] }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                                    />
                                </motion.div>
                            </div>
                            <motion.p
                                className={cn(
                                    "text-xs text-center mt-3 font-medium",
                                    resolvedTheme === 'dark' ? "text-gray-400" : "text-gray-600"
                                )}
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            >
                                Loading...
                            </motion.p>
                        </motion.div>
                    </motion.div>

                    {/* Corner decorations */}
                    <motion.div
                        className="absolute top-8 left-8 w-16 h-16 border-l-2 border-t-2 border-purple-500/20 rounded-tl-xl"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.8 }}
                    />
                    <motion.div
                        className="absolute bottom-8 right-8 w-16 h-16 border-r-2 border-b-2 border-purple-500/20 rounded-br-xl"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.9 }}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
