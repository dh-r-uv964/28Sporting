import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { CheckCircle, Zap, Bot, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';

const freeFeatures = [
    "Search and discover all venues",
    "Find and match with partners", 
    "Schedule and track your games",
    "10 free AI Concierge messages"
];

const proFeatures = [
    "Everything in Free, plus:",
    "Unlimited access to AI Concierge",
    "AI-powered venue & partner suggestions"
];

const PRO_PRICE = 10;

export default function Subscriptions() {
    const navigate = useNavigate();

    const handleChoosePro = () => {
        navigate(createPageUrl('Checkout'));
    };
    
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 lg:py-12">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8 lg:mb-12">
                    <Button 
                        variant="ghost" 
                        onClick={() => navigate(createPageUrl('Dashboard'))}
                        className="mb-6 self-start text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                    </Button>
                    
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
                            Upgrade to AI Concierge Pro
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                            Unlock unlimited, AI-powered sports recommendations and personalized assistance.
                        </p>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {/* Free Plan */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="flex flex-col h-full rounded-2xl shadow-md bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700">
                            <CardHeader className="pt-8 pb-6">
                                <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">Free</CardTitle>
                                <CardDescription className="text-gray-600 dark:text-gray-400 text-lg">
                                    Perfect for getting started
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <div className="mb-8">
                                    <span className="text-5xl font-extrabold text-gray-900 dark:text-white">$0</span>
                                    <span className="text-xl text-gray-500 dark:text-gray-400">/month</span>
                                </div>
                                <ul className="space-y-4">
                                    {freeFeatures.map((feature, i) => (
                                        <li key={i} className="flex items-start">
                                            <CheckCircle className="flex-shrink-0 w-5 h-5 text-emerald-500 mr-3 mt-0.5" />
                                            <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter className="pt-6">
                                <Button className="w-full py-4 text-lg" variant="outline" disabled>
                                    Your Current Plan
                                </Button>
                            </CardFooter>
                        </Card>
                    </motion.div>

                    {/* Pro Plan */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Card className="flex flex-col h-full rounded-2xl shadow-xl bg-gradient-to-b from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-2 border-emerald-500 dark:border-emerald-600 relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-center py-3 font-bold text-sm">
                                ✨ RECOMMENDED
                            </div>
                            <CardHeader className="pt-12 pb-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">AI Concierge Pro</CardTitle>
                                        <CardDescription className="text-emerald-700 dark:text-emerald-300 text-lg font-medium">
                                            Unlimited AI-powered assistance
                                        </CardDescription>
                                    </div>
                                    <Bot className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
                                </div>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <div className="mb-8">
                                    <span className="text-5xl font-extrabold text-gray-900 dark:text-white">${PRO_PRICE}</span>
                                    <span className="text-xl text-gray-500 dark:text-gray-400">/month</span>
                                </div>
                                <ul className="space-y-4">
                                    {proFeatures.map((feature, i) => (
                                        <li key={i} className="flex items-start">
                                            <CheckCircle className="flex-shrink-0 w-5 h-5 text-emerald-500 mr-3 mt-0.5" />
                                            <span className="text-gray-700 dark:text-gray-200 font-medium">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter className="pt-6">
                                <Button 
                                    className="w-full py-4 text-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg" 
                                    onClick={handleChoosePro}
                                >
                                    <Zap className="w-5 h-5 mr-2" />
                                    Upgrade to Pro
                                </Button>
                            </CardFooter>
                        </Card>
                    </motion.div>
                </div>

                <div className="text-center mt-12">
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        You can cancel anytime. No questions asked.
                    </p>
                </div>
            </div>
        </div>
    );
}