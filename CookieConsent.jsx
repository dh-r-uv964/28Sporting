import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Cookie, X } from 'lucide-react';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('28sporting-cookie-consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('28sporting-cookie-consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('28sporting-cookie-consent', 'declined');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto lg:left-auto lg:right-4 lg:max-w-sm"
        >
          <Card className="shadow-xl border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Cookie className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-sm mb-2">Cookie Consent</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                    We use cookies to enhance your experience and analyze app usage. 
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleAccept} className="flex-1">
                      Accept
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleDecline}>
                      Decline
                    </Button>
                  </div>
                </div>
                <button 
                  onClick={handleDecline}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}