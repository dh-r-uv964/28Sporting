import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Target, Shield, Heart } from 'lucide-react';

const values = [
  {
    icon: Users,
    title: "Community First",
    description: "Building meaningful connections between sports enthusiasts nationwide"
  },
  {
    icon: Shield,
    title: "Safety & Trust",
    description: "Verified venues and comprehensive safety protocols for peace of mind"
  },
  {
    icon: Target,
    title: "Premium Experience",
    description: "Curated selection of top-tier venues and exceptional playing partners"
  },
  {
    icon: Heart,
    title: "Passion for Sports",
    description: "Founded by athletes, for athletes who live and breathe competition"
  }
];

export default function AboutUs() {
  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 pb-24 lg:pb-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="w-20 h-20 bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl font-black text-white">28</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">About 28SPORTING</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            We're revolutionizing how athletes connect, compete, and thrive in premium sports communities across America.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <Card className="bg-white dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
              <img
                src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop&crop=face"
                alt="Dhruv Yogeshwar Warior"
                className="w-40 h-40 rounded-full object-cover shadow-lg"
              />
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">A Note from the Founder</h2>
                <p className="text-emerald-600 dark:text-emerald-400 font-semibold mb-4">Dhruv Yogeshwar Warior</p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  "As a lifelong sports enthusiast, I created 28SPORTING to solve a simple problem: finding great people to play with at high-quality venues. My vision is to build more than just an app; it's a community built on respect, competition, and a shared passion for the game. We handle the logistics so you can focus on what you love—playing."
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <Card className="h-full dark:bg-gray-800 dark:border-gray-700 text-center">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center flex-shrink-0 mx-auto mb-4">
                      <value.icon className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{value.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}