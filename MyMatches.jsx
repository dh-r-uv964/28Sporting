import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Calendar, Users, MapPin, Loader2, MessageSquare, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Match } from '@/api/entities';
import { User } from '@/api/entities';
import { Venue } from '@/api/entities';
import ApiErrorHandler from '@/components/common/ApiErrorHandler';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatSportName } from '@/components/common/constants';
import { format, isPast } from 'date-fns';

const MatchCard = ({ match, venue, currentUser }) => {
    const navigate = useNavigate();
    const opponentEmail = match.players.find(p => p !== currentUser.email);
    const opponentIndex = match.players.indexOf(opponentEmail);
    const opponentName = match.player_names[opponentIndex];

    const isMatchPast = isPast(new Date(match.match_date));

    return (
        <Card className={`bg-white dark:bg-gray-800/50 shadow-sm hover:shadow-md transition-shadow duration-300 ${isMatchPast ? 'opacity-70' : ''}`}>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="capitalize text-lg">
                            {formatSportName(match.sport)}
                        </CardTitle>
                        <CardDescription>vs. {opponentName || 'Partner'}</CardDescription>
                    </div>
                    <Badge variant={isMatchPast ? 'outline' : 'secondary'} className="capitalize">{isMatchPast ? "Past" : "Upcoming"}</Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4 mr-2" /> 
                    <span>{format(new Date(match.match_date), 'EEE, MMM d, yyyy h:mm a')}</span>
                </div>
                {venue ? (
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <MapPin className="w-4 h-4 mr-2" /> 
                        <span>{venue.name}</span>
                    </div>
                ) : match.venue_id ? (
                    <div className="flex items-center text-gray-500 dark:text-gray-500">
                        <MapPin className="w-4 h-4 mr-2" /> 
                        <span className="italic">Venue information unavailable</span>
                    </div>
                ) : (
                    <div className="flex items-center text-gray-500 dark:text-gray-500">
                        <MapPin className="w-4 h-4 mr-2" /> 
                        <span className="italic">No venue specified</span>
                    </div>
                )}
                {match.result && <p><strong>Result:</strong> {match.result}</p>}
                <div className="pt-2">
                    <Button onClick={() => navigate(createPageUrl(`Chat?match_id=${match.id}`))} className="w-full">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Go to Chat
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default function MyMatches() {
    const navigate = useNavigate();
    const [matches, setMatches] = useState([]);
    const [venues, setVenues] = useState({});
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Helper function to check if a string is a valid ObjectId
    const isValidObjectId = (id) => {
        if (!id || typeof id !== 'string') return false;
        return /^[0-9a-fA-F]{24}$/.test(id);
    };

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const currentUser = await User.me();
            setUser(currentUser);
            
            // Fetch matches where the current user is one of the players
            const userMatches = await Match.filter({ players: currentUser.email }, "-match_date");

            if (userMatches.length > 0) {
                // Get unique venue IDs, but only valid ObjectIds
                const validVenueIds = [...new Set(userMatches
                    .map(m => m.venue_id)
                    .filter(id => id && isValidObjectId(id))
                )];

                if (validVenueIds.length > 0) {
                    try {
                        // Fetch venues using individual queries to avoid batch failures
                        const venuePromises = validVenueIds.map(async (venueId) => {
                            try {
                                const venueData = await Venue.filter({ id: venueId });
                                return venueData.length > 0 ? venueData[0] : null;
                            } catch (error) {
                                console.warn(`Failed to fetch venue ${venueId}:`, error);
                                return null;
                            }
                        });

                        const venueResults = await Promise.all(venuePromises);
                        const venueMap = {};
                        
                        validVenueIds.forEach((id, index) => {
                            if (venueResults[index]) {
                                venueMap[id] = venueResults[index];
                            }
                        });

                        setVenues(venueMap);
                    } catch (error) {
                        console.warn("Failed to fetch some venues:", error);
                        // Continue without venues rather than failing completely
                        setVenues({});
                    }
                } else {
                    setVenues({});
                }
            }
            setMatches(userMatches);
        } catch (e) {
            setError(e);
            console.error("Failed to fetch matches", e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const upcomingMatches = matches.filter(m => !isPast(new Date(m.match_date)));
    const pastMatches = matches.filter(m => isPast(new Date(m.match_date)));

    if (isLoading) {
        return (
          <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
            <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
          </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 pb-24 lg:pb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">My Games</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                        Keep track of your upcoming and past games.
                    </p>
                </div>
                <Button onClick={() => navigate(createPageUrl('PartnerFinder'))}>
                    <PlusCircle className="w-5 h-5 mr-2" /> Find a New Match
                </Button>
            </div>

            {error && <ApiErrorHandler error={error} onRetry={fetchData} />}

            <Tabs defaultValue="upcoming" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upcoming">Upcoming ({upcomingMatches.length})</TabsTrigger>
                    <TabsTrigger value="past">Past ({pastMatches.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="upcoming" className="mt-6">
                    {upcomingMatches.length === 0 ? (
                        <Card className="text-center p-8 bg-white dark:bg-gray-800/50 shadow-sm border-gray-200 dark:border-gray-700/50">
                            <Trophy className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-4 text-lg font-semibold text-gray-800 dark:text-white">No Upcoming Games</h3>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">You don't have any games scheduled. Time to find a partner!</p>
                            <Button onClick={() => navigate(createPageUrl('PartnerFinder'))} className="mt-4">
                              <Users className="w-4 h-4 mr-2" />
                              Find a Partner
                            </Button>
                        </Card>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {upcomingMatches.map(match => (
                                <MatchCard key={match.id} match={match} venue={venues[match.venue_id]} currentUser={user} />
                            ))}
                        </div>
                    )}
                </TabsContent>
                <TabsContent value="past" className="mt-6">
                    {pastMatches.length === 0 ? (
                         <Card className="text-center p-8 bg-white dark:bg-gray-800/50 shadow-sm border-gray-200 dark:border-gray-700/50">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">No Past Games</h3>
                            <p className="text-gray-600 dark:text-gray-400">Your match history will appear here once you complete a game.</p>
                        </Card>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {pastMatches.map(match => (
                               <MatchCard key={match.id} match={match} venue={venues[match.venue_id]} currentUser={user} />
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}