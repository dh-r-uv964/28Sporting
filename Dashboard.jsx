import React, { useState, useEffect, useCallback, memo } from 'react';
import { User } from '@/api/entities';
import { Venue } from '@/api/entities';
import { PartnerRequest } from '@/api/entities';
import { Match } from '@/api/entities';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowRight, MapPin, Users, Trophy, Bot, AlertCircle, RefreshCw } from 'lucide-react';
import VenueCard from '@/components/venues/VenueCard';
import { US_STATES } from '@/components/common/constants';
import { format, isPast } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';

const StatCard = memo(({ icon: Icon, title, value, description, linkTo, linkText, isLoading = false }) => (
  <Card className="flex flex-col justify-between bg-white dark:bg-gray-800 shadow-sm border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-300 h-full">
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</CardTitle>
        <Icon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
      </div>
    </CardHeader>
    <CardContent className="flex-grow flex flex-col justify-between">
      <div className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-1">
        {isLoading ? <Loader2 className="w-8 h-8 animate-spin" /> : value}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">{description}</p>
      {linkTo && (
        <Link to={linkTo} className="text-sm font-medium text-emerald-600 dark:text-emerald-500 hover:underline flex items-center group">
          {linkText} <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </Link>
      )}
    </CardContent>
  </Card>
));

const ErrorCard = memo(({ onRetry }) => (
  <Card className="text-center p-8 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
      <AlertCircle className="w-8 h-8 text-red-500" />
    </div>
    <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">Unable to Load Data</h3>
    <p className="text-red-700 dark:text-red-300 mb-4">There was an issue loading your dashboard data.</p>
    <Button onClick={onRetry} variant="outline" className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-600 dark:text-red-300 dark:hover:bg-red-900/20">
      <RefreshCw className="w-4 h-4 mr-2" />
      Try Again
    </Button>
  </Card>
));

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ venues: 0, partners: 0, upcomingGames: 0 });
  const [nearbyVenues, setNearbyVenues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(false);
  const [isVenuesLoading, setIsVenuesLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const navigate = useNavigate();
  const { toast } = useToast();

  const loadUserData = useCallback(async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      if (!currentUser.state || !currentUser.has_completed_setup) {
        navigate(createPageUrl('ProfileSetup'));
        return null;
      }
      
      return currentUser;
    } catch (error) {
      console.error("User not authenticated on Dashboard:", error);
      navigate(createPageUrl('Welcome'));
      return null;
    }
  }, [navigate]);

  const loadStats = useCallback(async (currentUser) => {
    if (!currentUser) return;
    
    setIsStatsLoading(true);
    try {
      const [venues, partners, userMatches] = await Promise.all([
        Venue.list('', 1),
        PartnerRequest.filter({ status: 'active' }),
        Match.filter({ players: currentUser.email })
      ]);
      
      const upcoming = userMatches.filter(m => !isPast(new Date(m.match_date)));
      const allVenues = await Venue.list();
      
      setStats({ 
        venues: allVenues.length, 
        partners: partners.length, 
        upcomingGames: upcoming.length
      });
    } catch (error) {
      console.error("Error loading stats:", error);
      toast({
        title: "Failed to Load Stats",
        description: "Some dashboard statistics may be outdated.",
        variant: "destructive"
      });
    } finally {
      setIsStatsLoading(false);
    }
  }, [toast]);

  const loadVenues = useCallback(async (currentUser) => {
    if (!currentUser) return;
    
    setIsVenuesLoading(true);
    try {
      // Always fetch fresh user data to get updated state
      const freshUserData = await User.me();
      let venues;
      
      if (freshUserData.state) {
        venues = await Venue.filter({ state: freshUserData.state }, '-rating', 4);
      } else {
        venues = await Venue.list('-rating', 4);
      }
      setNearbyVenues(venues);
      
      // Update user state if it changed
      if (freshUserData.state !== currentUser.state) {
        setUser(freshUserData);
      }
    } catch (error) {
      console.error("Error loading venues:", error);
      toast({
        title: "Failed to Load Venues",
        description: "Unable to load venue recommendations.",
        variant: "destructive"
      });
    } finally {
      setIsVenuesLoading(false);
    }
  }, [toast]);

  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const currentUser = await loadUserData();
      if (currentUser) {
        await Promise.all([
          loadStats(currentUser),
          loadVenues(currentUser)
        ]);
        setLastRefresh(Date.now());
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [loadUserData, loadStats, loadVenues]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Listen for URL parameters to trigger refresh (from Settings page)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('refresh')) {
      fetchAllData();
      // Clean up URL
      window.history.replaceState({}, '', createPageUrl('Dashboard'));
    }
  }, [fetchAllData]);

  // Auto-refresh data every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (user) {
        loadStats(user);
        loadVenues(user);
        setLastRefresh(Date.now());
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user, loadStats, loadVenues]);

  const handleRetry = useCallback(() => {
    fetchAllData();
  }, [fetchAllData]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <ErrorCard onRetry={handleRetry} />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const userStateFullName = user.state ? US_STATES[user.state] : 'your area';
  const aiMessagesRemaining = Math.max(0, 10 - (user.ai_messages_used_count || 0));
  const isPro = user.subscription_tier === 'Pro';

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user.full_name?.split(' ')[0] || 'there'}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
            Ready to find your next game? Let's get started.
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            Last updated: {format(lastRefresh, 'MMM d, h:mm a')}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={() => navigate(createPageUrl('AIBot'))} variant="outline" className="gap-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <Bot className="w-5 h-5" /> 
            AI Concierge {!isPro && `(${aiMessagesRemaining} left)`}
          </Button>
          <Button onClick={() => navigate(createPageUrl('CreatePartnerRequest'))} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            <Users className="w-5 h-5" /> Find a Match
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard 
          icon={MapPin}
          title="Venues Available"
          value={stats.venues}
          description="Across all sports and locations"
          linkTo={createPageUrl('VenueSearch')}
          linkText="Find a Venue"
          isLoading={isStatsLoading}
        />
        <StatCard 
          icon={Users}
          title="Active Partner Requests"
          value={stats.partners}
          description="Players looking for a match right now"
          linkTo={createPageUrl('PartnerFinder')}
          linkText="Find a Partner"
          isLoading={isStatsLoading}
        />
         <StatCard 
          icon={Trophy}
          title="Your Upcoming Games"
          value={stats.upcomingGames}
          description={stats.upcomingGames === 1 ? "You have one game scheduled" : `Games on your calendar`}
          linkTo={createPageUrl('MyMatches')}
          linkText="View My Games"
          isLoading={isStatsLoading}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            Top Venues {user.state ? `in ${userStateFullName}`: 'Near You'}
          </h2>
          <Link 
            to={createPageUrl('VenueSearch')} 
            className="text-sm font-medium text-emerald-600 dark:text-emerald-500 hover:underline flex items-center group"
          >
            View All <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        {isVenuesLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => (
              <Card key={i} className="animate-pulse bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-t-xl"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : nearbyVenues.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {nearbyVenues.map(venue => (
              <VenueCard key={venue.id} venue={venue} />
            ))}
          </div>
        ) : (
          <Card className="text-center p-12 bg-white dark:bg-gray-800 shadow-sm border-gray-200 dark:border-gray-700">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                {user.state ? `No Venues Found in ${userStateFullName}` : "No Venues Found"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">We couldn't find any venues in your area. Try running the test data population or explore all venues.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => navigate(createPageUrl('VenueSearch'))} variant="outline">
                Explore All Venues
              </Button>
              <Button onClick={() => navigate(createPageUrl('DevTools'))} className="bg-emerald-600 hover:bg-emerald-700">
                Populate Test Data
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}