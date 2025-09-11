import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "@/api/entities";
import { MapPin, Navigation } from "lucide-react";

export default function LocationSetup() {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const [isDetecting, setIsDetecting] = useState(false);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setIsGuest(urlParams.get('guest') === 'true');
  }, []);

  const detectLocation = () => {
    setIsDetecting(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          // In a real app, you'd reverse geocode these coordinates
          const { latitude, longitude } = position.coords;
          setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          setIsDetecting(false);
        },
        (error) => {
          console.error("Location detection failed:", error);
          setIsDetecting(false);
        }
      );
    }
  };

  const handleContinue = async () => {
    if (location.trim()) {
      if (!isGuest) {
        try {
          await User.updateMyUserData({ 
            location: location.trim(),
            is_guest: false 
          });
        } catch (error) {
          console.error("Error saving location:", error);
        }
      }
      navigate(createPageUrl("Dashboard"));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-600 via-green-600 to-emerald-700 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="w-24 h-24 mx-auto mb-8 bg-white/10 backdrop-blur-lg rounded-2xl flex items-center justify-center shadow-xl"
        >
          <MapPin className="w-12 h-12 text-white" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-4">
            {isGuest ? "Set Your Location" : "Where Are You?"}
          </h1>
          <p className="text-white/90 text-lg leading-relaxed">
            {isGuest 
              ? "Tell us your location to find nearby courts and players"
              : "We'll use your location to show nearby sports venues and connect you with local players"
            }
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="space-y-6"
        >
          <div className="space-y-2">
            <Label htmlFor="location" className="text-white font-medium">
              Your Location
            </Label>
            <Input
              id="location"
              type="text"
              placeholder="Enter city, state or zip code"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-white/10 backdrop-blur-lg border-white/20 text-white placeholder-white/60 py-3 px-4 rounded-xl"
            />
          </div>

          <Button
            onClick={detectLocation}
            disabled={isDetecting}
            variant="outline"
            className="w-full border-white/30 text-white bg-white/10 backdrop-blur-lg hover:bg-white/20 py-3 px-8 rounded-xl font-medium transition-all duration-300"
          >
            <Navigation className="w-5 h-5 mr-2" />
            {isDetecting ? "Detecting..." : "Use Current Location"}
          </Button>

          <Button
            onClick={handleContinue}
            disabled={!location.trim()}
            className="w-full bg-white text-emerald-600 py-4 px-8 rounded-2xl font-bold text-lg shadow-xl hover:bg-white/95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </Button>

          {isGuest && (
            <p className="text-white/70 text-sm text-center">
              You're browsing as a guest. Create an account to access all features.
            </p>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}