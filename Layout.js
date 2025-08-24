
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Home, 
  MapPin, 
  User, 
  Search,
  Menu,
  X,
  Users
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import ChatWidget from "./components/chat/ChatWidget";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  
  const isWelcomeFlow = ['Welcome', 'Onboarding', 'LocationSetup'].includes(currentPageName);
  
  const navigationItems = [
    { name: 'Dashboard', icon: Home, href: createPageUrl('Dashboard') },
    { name: 'Find Partners', icon: Users, href: createPageUrl('PartnerFinder') },
    { name: 'My Matches', icon: User, href: createPageUrl('MyMatches') },
    { name: 'Find Venues', icon: Search, href: createPageUrl('VenueSearch') },
  ];

  const sportsItems = [
    { name: 'Golf', href: createPageUrl('GolfVenues') },
    { name: 'Tennis', href: createPageUrl('TennisVenues') },
    { name: 'Paddle', href: createPageUrl('PaddleVenues') },
    { name: 'Pickleball', href: createPageUrl('PickleballVenues') },
  ];

  if (isWelcomeFlow) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white/90 backdrop-blur-md border-b border-emerald-100 px-4 py-3 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <Link to={createPageUrl('Dashboard')} className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-600 to-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">28</span>
            </div>
            <span className="font-bold text-gray-900">28SPORTING</span>
          </Link>
          
 
