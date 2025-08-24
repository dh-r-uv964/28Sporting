import React from 'react';
import { motion } from "framer-motion";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Star, Clock, Users, Phone, Globe, Crown, Monitor } from "lucide-react";

export default function VenueCard({ venue, isFetchingImage, index }) {
  const getVenueTypeIcon = (type) => {
    switch (type) {
      case 'private': return <Crown className="w-4 h-4" />;
      case 'simulator': return <Monitor className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const getVenueTypeBadge = (type) => {
    const styles = {
      public: "bg-green-100 text-green-800",
      private: "bg-purple-100 text-purple-800",
      simulator: "bg-blue-100 text-blue-800",
      gym: "bg-orange-100 text-orange-800",
    };
    return styles[type] || styles.public;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
    >
      <Card className="h-full hover:shadow-2xl transition-all duration-300 border-0 overflow-hidden group">
        <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
          {isFetchingImage ? (
            <Skeleton className="w-full h-full" />
          ) : venue.image_url ? (
            <img 
              src={venue.image_url} 
              alt={venue.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
              <div className="text-emerald-500 opacity-50">
                {getVenueTypeIcon(venue.venue_type)}
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-4 left-4 z-10">
            <Badge className={`${getVenueTypeBadge(venue.venue_type)} border-0 shadow-lg`}>
              {getVenueTypeIcon(venue.venue_type)}
              <span className="ml-1 capitalize">{venue.venue_type}</span>
            </Badge>
          </div>
          <div className="absolute top-4 right-4 z-10">
            <Badge className="bg-white/90 text-gray-900 border-0 shadow-lg">
              {venue.price_range || '$$'}
            </Badge>
 
