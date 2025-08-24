import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function Welcome() {
  const navigate = useNavigate();
  const [showLogo, setShowLogo] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const logoTimer = setTimeout(() => {
      setShowLogo(false);
      setShowWelcome(true);
    }, 3000);

    return () => clearTimeout(logoTimer);
  }, []);

  const handleGetStarted = () => {
    navigate(createPageUrl("Onboarding"));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-600 via-green-600 to-emerald-700 flex items-center justify-center px-4">
      <AnimatePresence mode="wait">
        {showLogo && (
          <motion.div
            key="logo"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center"
          >
            <motion.div
              initial={{ rotate: -10 }}
              animate={{ rotate: 0 }}
              transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
              className="w-32 h-32 mx-auto mb-8 bg-white/10 backdrop-blur-lg rounded-3xl flex items-center justify-center shadow-2xl"
            >
              <span className="text-6xl font-black text-white">28</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="text-5xl font-black text-white mb-2"
            >
              SPORTING
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="text-white/80 text-lg font-medium"
            >
              Premium Sports Network
            </motion.p>
          </motion.div>
        )}

        {showWelcome && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center max-w-md"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="w-24 h-24 mx-auto mb-8 bg-white/10 backdrop-blur-lg rounded-2xl flex items-center justify-center shadow-xl"
            >
              <span className="text-4xl font-black text-white">28</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-4xl font-black text-white mb-4"
            >
              Welcome to<br />28SPORTING
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-white/90 text-lg mb-8 leading-relaxed"
            >
              Connect with players, discover premium courts, and elevate your game across golf, tennis, paddle, and pickleball.
            </motion.p>

            <motion.button
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGetStarted}
              className="w-full bg-white text-emerald-600 py-4 px-8 rounded-2xl font-bold text-lg shadow-2xl hover:bg-white/95 transition-all duration-300"
            >
              Get Started
            </motion.button>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="flex items-center justify-center space-x-6 mt-12"
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-white">50K+</div>
                <div className="text-white/70 text-sm">Active Players</div>
              </div>
              <div className="w-px h-12 bg-white/30"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">1K+</div>
                <div className="text-white/70 text-sm">Premium Courts</div>
              </div>
              <div className="w-px h-12 bg-white/30"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">4.9★</div>
                <div className="text-white/70 text-sm">App Rating</div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
