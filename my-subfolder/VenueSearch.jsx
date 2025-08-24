
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Venue } from "@/entities/Venue";
import { User } from "@/entities/User";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Search, 
  MapPin, 
  Filter,
  Flag,
  Trophy,
  Shield
} from "lucide-react";

const sportsConfig = {
  golf: { name: "Golf", icon: Flag, color: "emerald", page: "GolfVenues" },
  tennis: { name: "Tennis", icon: Trophy, color: "blue", page: "TennisVenues" },
  paddle: { name: "Paddle", icon: Shield, color: "purple", page: "PaddleVenues" },
  pickleball: { name: "Pickleball", icon: Shield, color: "orange", page: "PickleballVenues" }
};

export default function VenueSearch() {
  const [venues, setVenues] = useState([]);
  const [filteredVenues, setFilteredVenues] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSport, setSelectedSport] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    filterVenues();
  }, [venues, searchTerm, selectedSport, selectedLocation]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const userData = await User.me();
      setUserLocation(userData.location);
      
      // Get venues prioritized by user location
      let allVenues = await Venue.list("-rating");
      
      // If user has a location, prioritize nearby venues
      if (userData.location) {
        const locationKeywords = userData.location.toLowerCase().split(/[,\s]+/);
        allVenues = allVenues.sort((a, b) => {
          const aLocationMatch = locationKeywords.some(keyword => 
            a.location.toLowerCase().includes(keyword)
          );
          const bLocationMatch = locationKeywords.some(keyword => 
            b.location.toLowerCase().includes(keyword)
          );
          
          if (aLocationMatch && !bLocationMatch) return -1;
          if (!aLocationMatch && bLocationMatch) return 1;
          return b.rating - a.rating; // Secondary sort by rating
        });
      }
      
      setVenues(allVenues);
    } catch (error) {
      console.error("Error loading venues:", error);
      const allVenues = await Venue.list("-rating");
      setVenues(allVenues);
    } finally {
      setIsLoading(false);
    }
  };

  const filterVenues = () => {
    let filtered = venues.filter(venue =>
      venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venue.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (selectedSport !== "all") {
      filtered = filtered.filter(venue => venue.sport_type === selectedSport);
    }

    if (selectedLocation !== "all") {
      filtered = filtered.filter(venue => 
        venue.location.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    setFilteredVenues(filtered);
  };

  const getUniqueLocations = () => {
    const locations = venues.map(v => v.location.split(',')[0].trim());
    return [...new Set(locations)].sort();
  };

  const groupVenuesBySport = () => {
    return Object.entries(sportsConfig).map(([sportKey, config]) => ({
      ...config,
      key: sportKey,
      venues: filteredVenues.filter(v => v.sport_type === sportKey)
    }));
  };

  const getNearbyRecommendations = () => {
    if (!userLocation) return [];
    
    const locationKeywords = userLocation.toLowerCase().split(/[,\s]+/);
    return venues.filter(venue => 
      locationKeywords.some(keyword => 
        venue.location.toLowerCase().includes(keyword)
      )
    ).slice(0, 6);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  const nearbyVenues = getNearbyRecommendations();

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 pb-24 lg:pb-8">
 
