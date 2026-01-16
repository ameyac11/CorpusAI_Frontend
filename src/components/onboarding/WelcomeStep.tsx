import React, { useEffect, useState } from 'react';
import { motion } from "framer-motion";

export function WelcomeStep() {
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
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-background">
            {/* Animated dot grid background */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(147, 51, 234, 0.12) 1px, transparent 0)`,
                        backgroundSize: "32px 32px",
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                />
            </div>

            {/* Glowing orb */}
            <motion.div
                className="absolute w-[400px] h-[400px] md:w-[600px] md:h-[600px] rounded-full pointer-events-none"
                style={{
                    background: `radial-gradient(circle, rgba(147, 51, 234, 0.15) 0%, rgba(147, 51, 234, 0.05) 40%, transparent 70%)`,
                }}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
            />

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
                            src="/logo.png"
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
                        <span className="text-foreground">Welcome to </span>
                        <motion.span
                            className="text-purple-500"
                            animate={{ opacity: [1, 0.5, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            CorpusAI
                        </motion.span>
                    </h1>
                    <motion.p
                        className="text-muted-foreground text-xs md:text-sm tracking-[0.3em] uppercase font-medium"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.6 }}
                    >
                        Setting up your account
                    </motion.p>
                </motion.div>

                {/* Loading bar */}
                <motion.div
                    className="w-56 md:w-72"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.7 }}
                >
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden shadow-inner">
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
                        className="text-xs text-muted-foreground text-center mt-3 font-medium"
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
        </div>
    );
}
