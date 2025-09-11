
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Match } from '@/api/entities';
import { Message } from '@/api/entities';
import { User } from '@/api/entities';
import { Venue } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Send, ArrowLeft, MapPin, Calendar } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { formatSportName, getUserInitials, formatLocationDisplay, isValidObjectId } from '@/components/common/constants';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';

export default function Chat() {
    const location = useLocation();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [match, setMatch] = useState(null);
    const [venue, setVenue] = useState(null);
    const [messages, setMessages] = useState([]);
    const [user, setUser] = useState(null);
    const [opponent, setOpponent] = useState(null);
    const [messageText, setMessageText] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState(null);

    const loadChatData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            const urlParams = new URLSearchParams(location.search);
            const matchId = urlParams.get('match_id');
            
            if (!matchId) {
                setError('No match ID provided');
                return;
            }

            const [currentUser, matchData] = await Promise.all([
                User.me(),
                Match.filter({ id: matchId })
            ]);

            if (matchData.length === 0) {
                setError('Match not found');
                return;
            }

            const matchInfo = matchData[0];
            setUser(currentUser);
            setMatch(matchInfo);

            // Get opponent info
            const opponentEmail = matchInfo.players.find(email => email !== currentUser.email);
            const opponentIndex = matchInfo.players.indexOf(opponentEmail);
            const opponentName = matchInfo.player_names[opponentIndex];
            const opponentImage = matchInfo.player_images[opponentIndex];
            
            setOpponent({
                email: opponentEmail,
                full_name: opponentName,
                profile_image: opponentImage
            });

            // Get venue info, checking for valid ID first
            if (matchInfo.venue_id && isValidObjectId(matchInfo.venue_id)) {
                const venueData = await Venue.filter({ id: matchInfo.venue_id });
                if (venueData.length > 0) {
                    setVenue(venueData[0]);
                }
            }

            // Get messages
            const conversationId = [currentUser.email, opponentEmail].sort().join('-');
            const chatMessages = await Message.filter({ conversation_id: conversationId }, 'created_date');
            setMessages(chatMessages);

        } catch (err) {
            setError(err.message || 'Failed to load chat');
        } finally {
            setIsLoading(false);
        }
    }, [location.search]);

    useEffect(() => {
        loadChatData();
    }, [loadChatData]);

    const sendMessage = async () => {
        if (!messageText.trim() || !user || !opponent) return;
        
        setIsSending(true);
        try {
            const conversationId = [user.email, opponent.email].sort().join('-');
            await Message.create({
                conversation_id: conversationId,
                sender_email: user.email,
                recipient_email: opponent.email,
                content: messageText.trim(),
                message_type: 'text'
            });
            
            setMessageText('');
            loadChatData(); // Reload to get new messages
        } catch (error) {
            toast({ title: "Failed to send message", variant: "destructive" });
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
                <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card className="text-center p-8">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Chat Not Found</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                    <Button onClick={() => navigate(createPageUrl('MyMatches'))}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to My Games
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 pb-24 lg:pb-8">
            <Button 
                onClick={() => navigate(createPageUrl('MyMatches'))} 
                variant="ghost" 
                className="mb-6"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to My Games
            </Button>

            <div className="grid lg:grid-cols-4 gap-6">
                {/* Match Info Sidebar */}
                <div className="lg:col-span-1 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3">
                                <Avatar className="w-10 h-10">
                                    <AvatarImage src={opponent.profile_image} alt={opponent.full_name} />
                                    <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400">
                                        {getUserInitials(opponent)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{opponent.full_name}</p>
                                    <p className="text-sm text-gray-500 capitalize">{formatSportName(match.sport)}</p>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                <Calendar className="w-4 h-4 mr-2" />
                                <span>{format(new Date(match.match_date), 'EEE, MMM d, yyyy')}</span>
                            </div>
                            {venue ? (
                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                    <MapPin className="w-4 h-4 mr-2" />
                                    <span className="truncate">{venue.name}</span>
                                </div>
                            ) : match.venue_id ? (
                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                    <MapPin className="w-4 h-4 mr-2" />
                                    <span className="italic truncate">Venue unavailable</span>
                                </div>
                            ) : (
                                 <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                    <MapPin className="w-4 h-4 mr-2" />
                                    <span className="italic truncate">No venue specified</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Chat Area */}
                <div className="lg:col-span-3">
                    <Card className="h-[600px] flex flex-col">
                        <CardHeader className="border-b">
                            <CardTitle>Chat with {opponent.full_name}</CardTitle>
                        </CardHeader>
                        
                        {/* Messages */}
                        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.length === 0 ? (
                                <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
                                    <p>No messages yet. Say hello to start the conversation!</p>
                                </div>
                            ) : (
                                messages.map(message => (
                                    <div
                                        key={message.id}
                                        className={`flex ${message.sender_email === user.email ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                            message.sender_email === user.email 
                                                ? 'bg-emerald-600 text-white' 
                                                : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                                        }`}>
                                            <p>{message.content}</p>
                                            <p className={`text-xs mt-1 ${
                                                message.sender_email === user.email ? 'text-emerald-100' : 'text-gray-500 dark:text-gray-400'
                                            }`}>
                                                {format(new Date(message.created_date), 'h:mm a')}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                        
                        {/* Message Input */}
                        <div className="border-t p-4">
                            <div className="flex gap-2">
                                <Input
                                    value={messageText}
                                    onChange={(e) => setMessageText(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Type your message..."
                                    disabled={isSending}
                                    className="flex-1"
                                />
                                <Button onClick={sendMessage} disabled={!messageText.trim() || isSending}>
                                    {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
