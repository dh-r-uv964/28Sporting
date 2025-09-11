import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, UserPlus, LogIn, Trophy, Users, MapPin } from "lucide-react";
import { User } from "@/api/entities";

export default function Welcome() {
  const navigate = useNavigate();

  const handleCreateAccount = () => {
    navigate(createPageUrl("Onboarding"));
  };
  
  const handleLogin = async () => {
    try {
      await User.loginWithRedirect(`${window.location.origin}${createPageUrl("Dashboard")}`);
    } catch(e) {
      console.error("Login failed", e);
    }
  };

  const features = [
    { icon: MapPin, title: "Find Venues", desc: "Discover courts, courses & gyms" },
    { icon: Users, title: "Match Players", desc: "Connect with partners at your skill level" },
    { icon: Trophy, title: "Track Games", desc: "Schedule and manage your matches" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 text-white overflow-hidden relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.1),transparent_50%)]"></div>
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="inline-block mb-8">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-emerald-500 to-green-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-500/30">
              <span className="text-4xl md:text-6xl font-black">28</span>
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 bg-gradient-to-r from-white via-emerald-200 to-green-300 bg-clip-text text-transparent">
            28SPORTING
          </h1>

          <p className="max-w-3xl mx-auto text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
            Connect with athletes, discover venues, and elevate your game. The premier sports networking platform.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="text-center p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20"
              >
                <feature.icon className="w-8 h-8 mx-auto mb-3 text-emerald-400" />
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-300">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col items-center gap-4 max-w-sm mx-auto"
          >
            <Button
              onClick={handleCreateAccount}
              size="lg"
              className="w-full text-lg font-bold bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white py-6 rounded-xl shadow-lg hover:shadow-emerald-500/40 transition-all duration-300 transform hover:scale-105"
            >
              <UserPlus className="mr-3 w-5 h-5" />
              Get Started
              <ArrowRight className="ml-3 w-5 h-5" />
            </Button>
            
            <Button
              onClick={handleLogin}
              size="lg"
              variant="outline"
              className="w-full text-lg font-medium text-white border-white/40 hover:bg-white/10 hover:border-white/60 py-6 rounded-xl transition-all duration-300 backdrop-blur-sm"
            >
              <LogIn className="mr-3 w-5 h-5" />
              I have an account
            </Button>
          </motion.div>

          <p className="text-sm text-gray-400 mt-8">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </motion.div>
      </div>
    </div>
  );
}