import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MapPin, UserCheck, Users } from "lucide-react";
import { User } from "@/entities/User";

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const steps = [
    {
      icon: MapPin,
      title: "Find a court near you",
      description: "Enable location to discover premium courts and local players in your area.",
      action: "Enable Location",
      skip: "Maybe Later"
    },
    {
      icon: UserCheck,
      title: "Join the Community",
      description: "Create a free account to find playing partners, join matches, and track your progress.",
      action: "Create Account & Sign In",
      skip: "Continue as Guest"
    }
  ];

  const handleAction = async () => {
    if (step === 0) {
      // In a real app, this would trigger the browser's location permission prompt.
      // For this demo, we'll just move to the next step.
      setStep(1);
    } else {
      // Step 1 action: Create Account
      try {
        await User.loginWithRedirect(window.location.origin + createPageUrl("Dashboard"));
      } catch (e) {
        console.error("Login failed", e);
        // Fallback for local dev or if popup fails
        await User.login();
        navigate(createPageUrl("Dashboard"));
      }
    }
  };

  const handleSkip = () => {
    if (step === 0) {
      // Step 0 skip: just move to the next step without location
      setStep(1);
    } else {
      // Step 1 skip: Continue as Guest
      navigate(createPageUrl("Dashboard?guest=true"));
    }
  };

  const currentStep = steps[step];
  const Icon = currentStep.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-600 via-green-600 to-emerald-700 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex space-x-3">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === step ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="w-24 h-24 mx-auto mb-8 bg-white/10 backdrop-blur-lg rounded-2xl flex items-center justify-center shadow-xl"
          >
            <Icon className="w-12 h-12 text-white" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-3xl font-bold text-white mb-4"
          >
            {currentStep.title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-white/90 text-lg mb-12 leading-relaxed"
          >
            {currentStep.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="space-y-4"
          >
            <Button
              onClick={handleAction}
              className="w-full bg-white text-emerald-600 py-4 px-8 rounded-2xl font-bold text-lg shadow-xl hover:bg-white/95 transition-all duration-300"
            >
              {currentStep.action}
            </Button>

            {currentStep.skip && (
              <Button
                onClick={handleSkip}
                variant="ghost"
                className="w-full text-white/80 py-3 px-8 rounded-2xl font-medium hover:bg-white/10 transition-all duration-300"
              >
                {currentStep.skip}
              </Button>
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
