import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PartnerRequest } from '@/api/entities';
import { User } from '@/api/entities';
import { Match } from '@/api/entities';
import { Notification } from '@/api/entities';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, UserCheck, UserX, Users, RotateCw } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { SPORTS, SKILL_LEVELS, formatSportName, getUserInitials } from '@/components/common/constants';
import ApiErrorHandler from '@/components/common/ApiErrorHandler';
import { useToast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const CardStack = ({ requests, onSwipe, currentUserEmail }) => {
  const [cards, setCards] = useState(requests);

  useEffect(() => {
    setCards(requests);
  }, [requests]);

  const handleSwipe = (direction, request) => {
    onSwipe(direction, request);
    setCards(prev => prev.filter(r => r.id !== request.id));
  };
  
  if (!cards || cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center h-full min-h-[500px] bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
        <Users className="w-16 h-16 text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">All Caught Up!</h3>
        <p className="text-gray-600 dark:text-gray-400 mt-2">There are no new partner requests matching your filters.</p>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Try adjusting your filters or check back later.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[500px] flex items-center justify-center">
      <AnimatePresence>
        {cards.map((request, index) => {
          if (index < cards.length - 2) return null;

          const isTopCard = index === cards.length - 1;
          const mockUser = {
            full_name: request.requester_full_name,
            email: request.requester_email
          };

          return (
            <motion.div
              key={request.id}
              className="absolute w-full max-w-sm"
              style={{
                zIndex: cards.length - index,
                transform: `scale(${1 - (cards.length - 1 - index) * 0.05}) translateY(${(cards.length - 1 - index) * -10}px)`,
              }}
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{
                x: (dragX) => (dragX > 0 ? 300 : -300),
                opacity: 0,
                transition: { duration: 0.3 }
              }}
              drag={isTopCard ? "x" : false}
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              onDragEnd={(event, info) => {
                if (Math.abs(info.offset.x) > 100) {
                  handleSwipe(info.offset.x > 0 ? 'right' : 'left', request);
                }
              }}
            >
              <Card className="w-full h-[500px] rounded-2xl shadow-xl overflow-hidden flex flex-col bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <div className="relative h-1/2">
                  <Avatar className="object-cover w-full h-full rounded-none">
                    <AvatarImage src={request.requester_profile_image} alt={request.requester_full_name || 'User'} />
                    <AvatarFallback className="text-6xl rounded-none bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400">
                      {getUserInitials(mockUser)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                    <h3 className="text-2xl font-bold text-white">{request.requester_full_name || 'Anonymous'}</h3>
                  </div>
                </div>
                <CardContent className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="capitalize font-semibold text-lg text-emerald-600 dark:text-emerald-400">
                        {request.sport ? formatSportName(request.sport) : 'Sport not specified'}
                      </span>
                      <span className="capitalize bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full text-sm font-medium">
                        {request.skill_level || 'Level not specified'}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">{request.notes || "No notes provided."}</p>
                  </div>
                  {isTopCard && (
                    <div className="flex justify-around mt-6">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-16 w-16 rounded-full border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600"
                        onClick={() => handleSwipe('left', request)}
                      >
                        <UserX className="w-8 h-8" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-16 w-16 rounded-full border-emerald-500 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600"
                        onClick={() => handleSwipe('right', request)}
                      >
                        <UserCheck className="w-8 h-8" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default function PartnerFinder() {
  const [allRequests, setAllRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [filters, setFilters] = useState({ sport: 'all', skill_level: 'all' });
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const [user, requests] = await Promise.all([
        User.me(),
        PartnerRequest.filter({ status: 'active' })
      ]);
      
      setCurrentUser(user);
      
      const swipedUserIds = user.swiped_partner_requests || [];
      // Filter out own requests, and requests already swiped on
      const requestsToShow = requests.filter(req => 
        req.requester_email !== user.email && 
        !swipedUserIds.includes(req.id)
      );

      setAllRequests(requestsToShow);
    } catch (error) {
      console.error("Error fetching data:", error);
      setApiError(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const applyFilters = useCallback(() => {
    if (!currentUser) return;
    
    let requests = [...allRequests];

    if (filters.sport !== 'all') {
      requests = requests.filter(req => req.sport === filters.sport);
    }

    if (filters.skill_level !== 'all') {
      requests = requests.filter(req => req.skill_level === filters.skill_level);
    }

    setFilteredRequests(requests);
  }, [allRequests, filters, currentUser]);

  useEffect(() => {
    applyFilters();
  }, [filters, allRequests, applyFilters]);

  const handleSwipe = useCallback(async (direction, request) => {
    if (!currentUser) return;
    
    // Add request to user's swiped list to prevent seeing it again
    const newSwipedIds = [...(currentUser.swiped_partner_requests || []), request.id];
    
    // Optimistically update UI
    setCurrentUser(prev => ({ ...prev, swiped_partner_requests: newSwipedIds }));
    
    try {
      await User.updateMyUserData({
        swiped_partner_requests: newSwipedIds
      });

      if (direction === 'right') {
        // Create a match when someone swipes right
        const existingMatchCheck = await Match.filter({
            players: { $all: [currentUser.email, request.requester_email] },
            sport: request.sport,
            status: { $in: ['pending', 'scheduled'] }
        });

        if (existingMatchCheck.length === 0) {
            // Create a new match
            const newMatch = await Match.create({
                sport: request.sport,
                players: [currentUser.email, request.requester_email],
                player_names: [currentUser.full_name, request.requester_full_name],
                player_images: [currentUser.profile_image || '', request.requester_profile_image || ''],
                venue_id: request.venue_id,
                match_date: request.preferred_date,
                status: 'pending',
                notes: `Match initiated from ${currentUser.full_name}'s interest in ${request.requester_full_name}'s request.`
            });

            // Create notifications for both users
            await Notification.create({
                user_email: request.requester_email,
                type: 'match_found',
                title: "It's a Match!",
                message: `You've matched with ${currentUser.full_name} for ${formatSportName(request.sport)}.`,
                link_url: createPageUrl(`Chat?match_id=${newMatch.id}`)
            });

             await Notification.create({
                user_email: currentUser.email,
                type: 'match_found',
                title: "It's a Match!",
                message: `You've matched with ${request.requester_full_name} for ${formatSportName(request.sport)}.`,
                link_url: createPageUrl(`Chat?match_id=${newMatch.id}`)
            });

            toast({
                title: "It's a Match! 🎉",
                description: `You and ${request.requester_full_name} can now arrange your game.`,
                action: <Link to={createPageUrl(`Chat?match_id=${newMatch.id}`)}><Button variant="secondary">Open Chat</Button></Link>,
            });
        }
      }
    } catch (error) {
      console.error("Failed to update user swipes or create match:", error);
      // Revert optimistic update on failure
      setCurrentUser(prev => ({
        ...prev,
        swiped_partner_requests: prev.swiped_partner_requests?.filter(id => id !== request.id) || []
      }));
       toast({
          title: "Error",
          description: "Could not process your request. Please try again.",
          variant: "destructive",
        });
    }
  }, [currentUser, toast]);

  const handleFilterChange = useCallback((type, value) => {
    setFilters(prev => ({ ...prev, [type]: value }));
  }, []);

  const resetSwipes = useCallback(async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      await User.updateMyUserData({ swiped_partner_requests: [] });
      await fetchData();
    } catch(e) {
      console.error("Failed to reset swipes", e);
      setApiError(e);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, fetchData]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8">Find Your Next Partner</h1>
        <ApiErrorHandler error={apiError} onRetry={fetchData} />
      </div>
    );
  }

  const sportOptions = ['all', ...SPORTS];
  const skillLevels = ['all', ...SKILL_LEVELS];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">Find Your Next Partner</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">Swipe right to connect, or left to pass. Find your perfect match for a game.</p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6 mb-8 justify-center items-center">
        <div className="flex items-center gap-2">
            <Label htmlFor="sport-filter" className="text-gray-700 dark:text-gray-300">Sport:</Label>
            <Select id="sport-filter" value={filters.sport} onValueChange={(v) => handleFilterChange('sport', v)}>
                <SelectTrigger className="w-40">
                    <SelectValue placeholder="Select Sport" />
                </SelectTrigger>
                <SelectContent>
                    {sportOptions.map(sport => (
                        <SelectItem key={sport} value={sport} className="capitalize">{sport === 'all' ? 'All Sports' : formatSportName(sport)}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
        <div className="flex items-center gap-2">
            <Label htmlFor="skill-filter" className="text-gray-700 dark:text-gray-300">Skill Level:</Label>
            <Select id="skill-filter" value={filters.skill_level} onValueChange={(v) => handleFilterChange('skill_level', v)}>
                <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Levels"/>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    {SKILL_LEVELS.map(level => (
                        <SelectItem key={level} value={level} className="capitalize">{level}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
        <Button onClick={resetSwipes} variant="outline" disabled={isLoading}>
          <RotateCw className="w-4 h-4 mr-2"/>
          Reset Swipes
        </Button>
      </div>

      <CardStack
        requests={filteredRequests}
        onSwipe={handleSwipe}
        currentUserEmail={currentUser?.email}
      />
    </div>
  );
}