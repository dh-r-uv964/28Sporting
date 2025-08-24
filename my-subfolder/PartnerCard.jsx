
import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User } from "@/entities/User";
import { PartnerRequest } from "@/entities/PartnerRequest";
import { Venue } from "@/entities/Venue";
import { X, Heart, Star, Flag, Trophy, Shield, Calendar, MapPin, User as UserIcon, Info } from "lucide-react";
import { format } from 'date-fns';

const sportsConfig = {
  golf: { name: "Golf", icon: Flag, color: "emerald" },
  tennis: { name: "Tennis", icon: Trophy, color: "blue" },
  paddle: { name: "Paddle", icon: Shield, color: "purple" },
  pickleball: { name: "Pickleball", icon: Shield, color: "orange" }
};

const PartnerCard = ({ request, onSwipe, user, venue }) => {
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const SportIcon = sportsConfig[request.sport]?.icon || Info;
  const sportColor = sportsConfig[request.sport]?.color || "gray";

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDrag = (event, info) => {
    setDragOffset(info.offset.x);
  };

  const handleDragEnd = (event, info) => {
    setIsDragging(false);
    setDragOffset(0);
    
    const threshold = 100;
    if (Math.abs(info.offset.x) > threshold) {
      if (info.offset.x > 0) {
        onSwipe('right');
      } else {
        onSwipe('left');
      }
    }
  };

  if (!user || !venue) {
    return (
      <Card className="absolute w-full h-full rounded-3xl flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </Card>
    );
  }

  const getSwipeIndicator = () => {
    if (!isDragging) return null;
    
    if (dragOffset > 50) {
      return (
        <div className="absolute top-8 right-8 bg-green-500 text-white px-4 py-2 rounded-full transform rotate-12 font-bold shadow-lg">
          MATCH!
        </div>
      );
    } else if (dragOffset < -50) {
      return (
        <div className="absolute top-8 left-8 bg-red-500 text-white px-4 py-2 rounded-full transform -rotate-12 font-bold shadow-lg">
          PASS
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.8, opacity: 0, y: 50 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ 
        x: dragOffset > 0 ? 300 : -300, 
        opacity: 0, 
        scale: 0.8,
        rotate: dragOffset > 0 ? 15 : -15
      }}
      transition={{ duration: 0.3 }}
      style={{
        rotate: isDragging ? dragOffset * 0.1 : 0,
      }}
      className="absolute w-full h-full cursor-grab active:cursor-grabbing"
    >
      <Card className="w-full h-full rounded-3xl overflow-hidden shadow-2xl flex flex-col relative">
        {getSwipeIndicator()}
        
        <div className="relative h-1/2 bg-gray-300">
          <img
            src={user.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&background=random&size=400`}
            alt={user.full_name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-6 text-white">
            <h2 className="text-3xl font-bold">{user.full_name}</h2>
            <div className="flex items-center space-x-2 mt-1">
              <UserIcon className="w-4 h-4" />
              <span className="font-medium">Skill: {request.skill_level}</span>
              {user.is_bot && (
                <Badge className="bg-blue-500 text-white text-xs">Active Player</Badge>
              )}
            </div>
          </div>
        </div>
        
        <CardContent className="p-6 flex-1 flex flex-col justify-between bg-white">
          <div>
            <div className={`flex items-center space-x-3 mb-4 text-${sportColor}-600`}>
              <div className={`w-10 h-10 bg-${sportColor}-100 rounded-lg flex items-center justify-center`}>
                <SportIcon className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 capitalize">{request.sport}</h3>
            </div>
            <div className="space-y-3 text-gray-700">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-3 text-gray-400" />
                <span>{format(new Date(request.preferred_date), 'EEEE, MMMM do')} at {request.preferred_time}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-3 text-gray-400" />
                <span>{venue.name}, {venue.location}</span>
              </div>
              {request.notes && (
 
