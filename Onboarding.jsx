import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from 'lucide-react';
import { User } from "@/api/entities";

export default function Onboarding() {
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState(false);

  const handleAction = async () => {
    if (!agreed) {
      setError(true);
      return;
    }
    setError(false);
    try {
      await User.loginWithRedirect(window.location.origin + createPageUrl("ProfileSetup"));
    } catch (e) {
      console.error("Login failed", e);
      await User.login();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-600 via-green-600 to-emerald-700 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-lg bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 text-white"
      >
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-white/20 rounded-3xl flex items-center justify-center ring-4 ring-white/10">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-2">Liability & Safety Agreement</h1>
          <p className="text-lg text-white/80">Your safety is your responsibility. Please read and agree before proceeding.</p>
        </div>

        <div className="bg-black/20 p-4 rounded-lg text-sm space-y-3 mb-6 max-h-48 overflow-y-auto custom-scrollbar">
            <p><strong>1. Assumption of Risk:</strong> You understand that participating in sports involves inherent risks of injury. You voluntarily assume all risks associated with your participation.</p>
            <p><strong>2. No Liability:</strong> 28SPORTING is a technology platform for connecting people. We are NOT liable for any injuries, damages, theft, or any illegal activity that may occur between players or at venues.</p>
            <p><strong>3. Personal Responsibility:</strong> You are responsible for your own safety, your actions, and for vetting any playing partners you connect with through the app. Always meet in public, well-known venues.</p>
            <p><strong>4. Venue Disclaimer:</strong> We do not own, operate, or endorse any listed venues. You must verify venue safety, rules, and operating hours independently.</p>
        </div>
        
        <div 
            className={`bg-white/10 p-4 rounded-lg mb-6 transition-all ${error ? 'ring-2 ring-red-400' : ''}`}
        >
          <div className="flex items-start space-x-3">
            <Checkbox id="terms" onCheckedChange={(checked) => { setAgreed(!!checked); setError(false); }} className="border-white data-[state=checked]:bg-white data-[state=checked]:text-emerald-600 mt-0.5" />
            <label htmlFor="terms" className="text-sm font-medium leading-normal">
              I have read, understood, and agree to the Terms of Service and Liability Policy.
            </label>
          </div>
        </div>

        {error && (
            <motion.div initial={{opacity: 0, y: -10}} animate={{opacity: 1, y: 0}} className="mb-4">
                <Alert variant="destructive" className="bg-red-500/80 border-red-400 text-white">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>You must agree to the terms to continue.</AlertDescription>
                </Alert>
            </motion.div>
        )}

        <div className="space-y-4">
          <Button
            onClick={handleAction}
            className="w-full bg-white text-emerald-600 py-4 px-8 rounded-xl font-bold text-lg shadow-xl hover:bg-white/95 transition-all duration-300 transform hover:scale-105"
            disabled={!agreed}
          >
            Agree & Create Account
          </Button>

          <Button
            onClick={() => navigate(createPageUrl('Welcome'))}
            variant="ghost"
            className="w-full text-white/80 hover:bg-white/10 transition-all duration-300"
          >
            Go Back
          </Button>
        </div>
      </motion.div>
    </div>
  );
}