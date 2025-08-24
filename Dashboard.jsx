
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User } from "@/entities/User";
import {
  Flag,
  Trophy,
  Shield,
  Users,
  MapPin,
  Star,
  TrendingUp
} from "lucide-react";

const sports = [
  {
    id: "golf",
    name: "Golf",
    icon: Flag,
    description: "Find courses, tee times & playing partners",
    gradient: "from-green-500 to-emerald-600",
    venues: "120+ Courses"
  },
  {
    id: "tennis",
    name: "Tennis",
    icon: Trophy,
    description: "Discover courts & connect with players",
    gradient: "from-blue-500 to-cyan-600",
    venues: "85+ Courts"
  },
  {
    id: "paddle",
    name: "Paddle",
    icon: Shield,
    description: "Premium paddle courts & communities",
    gradient: "from-purple-500 to-pink-600",
    venues: "45+ Courts"
  },
  {
    id: "pickleball",
    name: "Pickleball",
    icon: Shield,
    description: "Growing pickleball community",
    gradient: "from-orange-500 to-red-600",
    venues: "65+ Courts"
  }
];

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
    } catch (error) {
      console.error("User not logged in or guest mode");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 lg:p-8 pb-24 lg:pb-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h1 className="text-4xl font-black text-gray-900 mb-2">
                Welcome{user?.full_name ? `, ${user.full_name}` : ""}
              </h1>
              <div className="flex items-center space-x-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{user?.location || "Location not set"}</span>
                {user?.is_guest && (
                  <Badge variant="outline" className="ml-2">Guest Mode</Badge>
                )}
              </div>
            </div>

            <div className="mt-4 lg:mt-0 flex items-center space-x-4">
              <Link to={createPageUrl("PartnerFinder")}>
                <Button className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg">
                  <Users className="w-4 h-4 mr-2" />
                  Find Partners
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-600 font-medium">Active Players</p>
                    <p className="text-3xl font-bold text-emerald-800">2,847</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-emerald-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 font-medium">Available Courts</p>
                    <p className="text-3xl font-bold text-blue-800">315</p>
                  </div>
 
