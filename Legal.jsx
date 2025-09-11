import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Scale, Shield, AlertTriangle, FileText } from 'lucide-react';

export default function Legal() {
  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 pb-24 lg:pb-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Legal Information</h1>
              <p className="text-gray-600 dark:text-gray-300">Terms, policies, and important disclaimers</p>
            </div>
          </div>
        </motion.div>

        {/* Liability Disclaimer */}
        <Alert className="mb-8 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            <strong>IMPORTANT LIABILITY DISCLAIMER:</strong> 28SPORTING is a matchmaking and venue discovery platform only. 
            We are not responsible for any injuries, accidents, crimes, or incidents that occur during gameplay, 
            travel to venues, or interactions between users. All activities are undertaken at your own risk.
          </AlertDescription>
        </Alert>

        <div className="space-y-8">
          {/* Terms of Service */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 dark:text-white">
                <FileText className="w-5 h-5" />
                <span>Terms of Service</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 dark:text-gray-300">
              <h3 className="font-semibold text-lg">1. Platform Purpose</h3>
              <p>28SPORTING provides a platform for sports enthusiasts to connect and discover venues. We facilitate introductions only.</p>
              
              <h3 className="font-semibold text-lg">2. User Responsibilities</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Verify all venue information independently before visiting</li>
                <li>Comply with local laws and venue rules</li>
                <li>Treat all users with respect and professionalism</li>
                <li>Report any inappropriate behavior immediately</li>
              </ul>

              <h3 className="font-semibold text-lg">3. Limitation of Liability</h3>
              <p>
                28SPORTING SHALL NOT BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, 
                CONSEQUENTIAL, OR PUNITIVE DAMAGES arising from your use of the platform, 
                interactions with other users, or visits to recommended venues.
              </p>

              <h3 className="font-semibold text-lg">4. Venue Information</h3>
              <p>
                All venue information is provided for reference only. Users must independently verify 
                pricing, availability, rules, and safety measures before visiting any facility.
              </p>
            </CardContent>
          </Card>

          {/* Privacy Policy */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 dark:text-white">
                <Shield className="w-5 h-5" />
                <span>Privacy Policy</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 dark:text-gray-300">
              <h3 className="font-semibold text-lg">Data Collection</h3>
              <p>We collect minimal information necessary to provide our matchmaking service:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Profile information (name, email, location)</li>
                <li>Sports preferences and skill levels</li>
                <li>Match history and feedback</li>
                <li>Device and usage analytics</li>
              </ul>

              <h3 className="font-semibold text-lg">Data Protection</h3>
              <p>Your personal information is encrypted and never shared with third parties without consent.</p>

              <h3 className="font-semibold text-lg">Cookie Policy</h3>
              <p>We use essential cookies for app functionality and optional analytics cookies to improve our service.</p>
            </CardContent>
          </Card>

          {/* Safety Guidelines */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 dark:text-white">
                <Shield className="w-5 h-5" />
                <span>Safety Guidelines</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 dark:text-gray-300">
              <h3 className="font-semibold text-lg">Meeting New Players</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Always meet at the designated venue during operating hours</li>
                <li>Inform someone about your plans and expected return time</li>
                <li>Trust your instincts - leave if you feel uncomfortable</li>
                <li>Verify the other player's identity when possible</li>
              </ul>

              <h3 className="font-semibold text-lg">Venue Safety</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Check venue safety certifications and insurance coverage</li>
                <li>Follow all venue rules and safety protocols</li>
                <li>Bring appropriate safety equipment for your sport</li>
                <li>Report any unsafe conditions to venue management</li>
              </ul>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="dark:text-gray-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Support</h3>
                  <p>support@28sporting.com</p>
                  <p>1-800-28-SPORT</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Legal</h3>
                  <p>legal@28sporting.com</p>
                  <p>For terms and privacy inquiries</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>© 2024 28SPORTING. All rights reserved.</p>
          <p className="mt-2">Available only in the United States</p>
        </footer>
      </div>
    </div>
  );
}