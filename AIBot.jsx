
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { User } from '@/api/entities';
import { InvokeLLM } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bot, Send, Loader2, Zap, Lock } from 'lucide-react';
import { getUserInitials } from '@/components/common/constants';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ReactMarkdown from 'react-markdown';

const AIBotPage = () => {
    const [user, setUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isComponentLoading, setIsComponentLoading] = useState(true);
    const messagesEndRef = useRef(null);
    const { toast } = useToast();
    const navigate = useNavigate();

    const FREE_MESSAGE_LIMIT = 10;
    const isPro = user?.subscription_tier === 'Pro';
    const messagesUsed = user?.ai_messages_used_count || 0;
    const remainingMessages = FREE_MESSAGE_LIMIT - messagesUsed;
    const isLocked = !isPro && remainingMessages <= 0;

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await User.me();
                setUser(userData);
                setMessages([{ role: 'assistant', content: `Hi ${userData.full_name?.split(' ')[0] || 'there'}! I'm your AI Concierge. How can I help you find the perfect game today?` }]);
            } catch (e) {
                navigate(createPageUrl('Welcome'));
            } finally {
                setIsComponentLoading(false);
            }
        };
        fetchUser();
    }, [navigate]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = useCallback(async () => {
        if (!input.trim() || isLoading || isLocked) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const result = await InvokeLLM({
                prompt: `You are a friendly and expert sports concierge named "28SPORTING AI". Your goal is to help users find sports venues, playing partners, and give advice. Keep responses concise, friendly, and use markdown for formatting. User's question: "${input}"`,
                add_context_from_internet: true,
            });
            
            const aiMessage = { role: 'assistant', content: result };
            setMessages(prev => [...prev, aiMessage]);

            if (!isPro) {
                const newCount = messagesUsed + 1;
                await User.updateMyUserData({ ai_messages_used_count: newCount });
                setUser(prev => ({...prev, ai_messages_used_count: newCount}));
            }
        } catch (e) {
            toast({ title: 'Error', description: 'Could not connect to the AI. Please try again.', variant: 'destructive' });
            setMessages(prev => prev.slice(0, -1)); // remove the user's message if AI fails
        } finally {
            setIsLoading(false);
        }
    }, [input, isLoading, isLocked, toast, isPro, messagesUsed]);

    if (isComponentLoading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
                <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
            </div>
        );
    }
    
    return (
        <div className="container mx-auto px-4 py-8 pb-24 lg:pb-8 h-full flex flex-col">
            <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl flex items-center justify-center">
                    <Bot className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Concierge</h1>
                    <p className="text-gray-600 dark:text-gray-400">Your personal assistant for all things sports.</p>
                </div>
            </div>

            <Card className="flex-grow flex flex-col shadow-lg dark:bg-gray-800/80">
                <CardContent className="p-4 flex-grow flex flex-col">
                    <div className="flex-grow space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                        {messages.map((msg, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
                            >
                                {msg.role === 'assistant' && (
                                    <Avatar className="w-8 h-8 bg-emerald-500 text-white">
                                        <Bot className="w-5 h-5 m-auto" />
                                    </Avatar>
                                )}
                                <div className={`max-w-md p-3 rounded-xl ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>
                                    <ReactMarkdown className="prose dark:prose-invert prose-sm max-w-none">
                                        {msg.content}
                                    </ReactMarkdown>
                                </div>
                                {msg.role === 'user' && (
                                    <Avatar className="w-8 h-8">
                                        <AvatarImage src={user.profile_image} />
                                        <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
                                    </Avatar>
                                )}
                            </motion.div>
                        ))}
                        {isLoading && (
                            <div className="flex items-start gap-3">
                                <Avatar className="w-8 h-8 bg-emerald-500 text-white"><Bot className="w-5 h-5 m-auto" /></Avatar>
                                <div className="max-w-md p-3 rounded-xl bg-gray-100 dark:bg-gray-700">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    
                    <div className="mt-4 pt-4 border-t dark:border-gray-700">
                        {isLocked ? (
                            <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                                <Lock className="mx-auto w-8 h-8 text-red-500 mb-2" />
                                <h4 className="font-semibold text-red-800 dark:text-red-200">Free Messages Used</h4>
                                <p className="text-sm text-red-700 dark:text-red-300 mb-3">You've used all your free messages. Upgrade to Pro for unlimited access.</p>
                                <Button onClick={() => navigate(createPageUrl('Checkout'))}>
                                    <Zap className="w-4 h-4 mr-2" /> Upgrade to Pro
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className="relative">
                                    <Textarea
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Ask for venue recommendations, find a partner, or get sports advice..."
                                        className="pr-20"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage();
                                            }
                                        }}
                                        disabled={isLoading}
                                    />
                                    <Button
                                        size="icon"
                                        className="absolute right-2 top-1/2 -translate-y-1/2"
                                        onClick={handleSendMessage}
                                        disabled={isLoading || !input.trim()}
                                    >
                                        <Send className="w-5 h-5" />
                                    </Button>
                                </div>
                                {!isPro && (
                                    <p className="text-xs text-center text-gray-500 mt-2">
                                        You have {remainingMessages} free message{remainingMessages !== 1 ? 's' : ''} left.
                                    </p>
                                )}
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AIBotPage;
