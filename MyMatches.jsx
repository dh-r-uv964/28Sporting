import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User } from '@/entities/User';
import { PartnerRequest } from '@/entities/PartnerRequest';
import { Venue } from '@/entities/Venue';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, MapPin, Users, Shield, Trophy, Flag, Info } from 'lucide-react';

const sportsConfig = {
  golf: { name: "Golf", icon: Flag, color: "emerald" },
  tennis: { name: "Tennis", icon: Trophy, color: "blue" },
  paddle: { name: "Paddle", icon: Shield, color: "purple" },
  pickleball: { name: "Pickleball", icon: Shield, color: "orange" }
};

const MatchCard = ({ request, venue, otherPlayer }) => {
  const SportIcon = sportsConfig[request.sport]?.icon || Info;
  const sportColor = sportsConfig[request.sport]?.color || "gray";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className={`p-4 bg-gradient-to-r from-${sportColor}-500 to-${sportColor}-600 text-white flex justify-between items-center`}>
          <div className="flex items-center space-x-3">
            <SportIcon className="w-6 h-6" />
            <h3 className="text-xl font-bold capitalize">{request.sport}</h3>
          </div>
          <Badge className="bg-white/20 text-white capitalize">{request.status}</Badge>
        </div>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3 mb-3">
            <Users className="w-5 h-5 text-gray-500" />
            <span className="font-semibold">{otherPlayer ? `With ${otherPlayer.full_name}` : 'Awaiting Match'}</span>
          </div>
          <div className="flex items-center space-x-3 mb-2">
            <MapPin className="w-5 h-5 text-gray-500" />
            <span>{venue?.name || 'Venue loading...'}</span>
          </div>
          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-gray-500" />
            <span>{new Date(request.preferred_date).toLocaleDateString()} at {request.preferred_time}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function MyMatches() {
  const [myRequests, setMyRequests] = useState([]);
  const [matchedGames, setMatchedGames] = useState([]);
  const [venues, setVenues] = useState({});
  const [users, setUsers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const me = await User.me();
        setCurrentUser(me);

        const allMyRequests = await PartnerRequest.filter({
          $or: [
            { requester_email: me.email },
            { matched_with_email: me.email }
          ]
        });

        const open = allMyRequests.filter(r => r.status === 'open' && r.requester_email === me.email);
        const matched = allMyRequests.filter(r => r.status === 'matched');
        
        setMyRequests(open);
        setMatchedGames(matched);

        const venueIds = [...new Set(allMyRequests.map(r => r.venue_id))];
        const userEmails = [...new Set(allMyRequests.flatMap(r => [r.requester_email, r.matched_with_email].filter(Boolean)))];

        const venuesData = await Venue.filter({ id: { $in: venueIds } });
        const usersData = await User.filter({ email: { $in: userEmails } });

        setVenues(venuesData.reduce((acc, v) => ({ ...acc, [v.id]: v }), {}));
        setUsers(usersData.reduce((acc, u) => ({ ...acc, [u.email]: u }), {}));

      } catch (error) {
        console.error("Error loading matches:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div></div>;
  }
  
  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Games</h1>
        <Tabs defaultValue="matched" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="matched">Matched Games</TabsTrigger>
            <TabsTrigger value="requests">My Open Requests</TabsTrigger>
          </TabsList>
          <TabsContent value="matched" className="mt-6">
            <div className="space-y-4">
              {matchedGames.length > 0 ? matchedGames.map(req => {
                const otherPlayerEmail = req.requester_email === currentUser.email ? req.matched_with_email : req.requester_email;
                return (
                  <MatchCard
                    key={req.id}
                    request={req}
                    venue={venues[req.venue_id]}
                    otherPlayer={users[otherPlayerEmail]}
                  />
                )
              }) : <p>No matched games yet. Go find a partner!</p>}
            </div>
          </TabsContent>
          <TabsContent value="requests" className="mt-6">
            <div className="space-y-4">
              {myRequests.length > 0 ? myRequests.map(req => (
                <MatchCard
                  key={req.id}
                  request={req}
                  venue={venues[req.venue_id]}
                  otherPlayer={null}
 
