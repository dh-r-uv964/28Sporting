import React from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Filter, Users } from "lucide-react";

export default function VenueFilters({
  searchTerm,
  setSearchTerm,
  venueType,
  setVenueType,
  priceRange,
  setPriceRange,
  sportConfig
}) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder={`Search ${sportConfig.name.toLowerCase()} venues...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12"
          />
        </div>
        
        <Select value={venueType} onValueChange={setVenueType}>
          <SelectTrigger className="h-12">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Venue Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="public">{sportConfig.venueTypes.public}</SelectItem>
            <SelectItem value="private">{sportConfig.venueTypes.private}</SelectItem>
            <SelectItem value="simulator">{sportConfig.venueTypes.simulator}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priceRange} onValueChange={setPriceRange}>
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Price Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Prices</SelectItem>
            <SelectItem value="$">$ - Budget</SelectItem>
            <SelectItem value="$$">$$ - Moderate</SelectItem>
            <SelectItem value="$$$">$$$ - Premium</SelectItem>
            <SelectItem value="$$$$">$$$$ - Luxury</SelectItem>
          </SelectContent>
        </Select>

        <Button className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white h-12">
          <Users className="w-4 h-4 mr-2" />
          Find Partners
        </Button>
      </div>
    </div>
  );
}
