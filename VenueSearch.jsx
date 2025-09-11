
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Venue } from '@/api/entities';
import { User } from '@/api/entities';
import VenueCard from '@/components/venues/VenueCard';
import VenueFilters from '@/components/venues/VenueFilters';
import LocationSearch from '@/components/common/LocationSearch';
import { US_STATES } from '@/components/common/constants';
import { Loader2, Search, Frown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { findVenuesByRadius } from '@/api/functions';
import { useToast } from "@/components/ui/use-toast";

const DEBOUNCE_DELAY = 300;

export default function VenueSearch() {
  const [allVenues, setAllVenues] = useState([]);
  const [filteredVenues, setFilteredVenues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [radiusSearch, setRadiusSearch] = useState(null);
  const [filters, setFilters] = useState({
    sport: 'all',
    price: 'all',
    rating: [0],
    amenities: [],
  });
  const [userState, setUserState] = useState('');
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);
  const { toast } = useToast();
  const venuesPerPage = 12;

  const fetchAndSetAllVenues = useCallback(async () => {
    setIsLoading(true);
    try {
      const venues = await Venue.list('-rating', 5000);
      setAllVenues(venues);
      // Initially, filteredVenues is the same as allVenues
      setFilteredVenues(venues); 
    } catch(e) {
      setError(e);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    const fetchInitialUser = async () => {
      try {
        const currentUser = await User.me().catch(() => null);
        if (currentUser && currentUser.state) {
          setUserState(currentUser.state);
          setSelectedLocation({
            type: 'state',
            state: currentUser.state,
            displayName: US_STATES[currentUser.state]
          });
        }
      } catch (e) {
        console.error("Failed to fetch current user", e);
      }
    };
    fetchInitialUser();
    fetchAndSetAllVenues();
  }, [fetchAndSetAllVenues]);

  const applyFiltersAndSearch = useCallback(async () => {
    setIsSearching(true);
    let venues = [];

    // Location-based filtering (Priority: Radius > Selected Location > All)
    if (radiusSearch && radiusSearch.latitude && radiusSearch.longitude) {
        try {
            const response = await findVenuesByRadius({
                latitude: radiusSearch.latitude,
                longitude: radiusSearch.longitude,
                radius: radiusSearch.radius,
                sport_filter: filters.sport !== 'all' ? filters.sport : null
            });
            venues = response.venues || [];
        } catch (e) {
            console.error("Radius search error:", e);
            toast({ 
                title: "Radius Search Failed", 
                description: "Could not fetch venues for your location. Showing all venues instead.", 
                variant: "destructive" 
            });
            // Fallback to all venues
            venues = [...allVenues];
        }
    } else {
        venues = [...allVenues];
        if (selectedLocation) {
            if (selectedLocation.type === 'state') {
                venues = venues.filter(v => v.state === selectedLocation.state);
            } else if (selectedLocation.type === 'city') {
                venues = venues.filter(v => 
                    v.state === selectedLocation.state && 
                    v.address && v.address.toLowerCase().includes(selectedLocation.name.toLowerCase())
                );
            }
        }
    }

    // Apply secondary filters on the location-filtered list
    let postLocationVenues = [...venues];

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      postLocationVenues = postLocationVenues.filter(v => 
        v.name?.toLowerCase().includes(lowerSearchTerm) ||
        (v.sports_offered && v.sports_offered.some(s => s.toLowerCase().includes(lowerSearchTerm))) ||
        (v.address?.toLowerCase().includes(lowerSearchTerm)) ||
        (v.description?.toLowerCase().includes(lowerSearchTerm))
      );
    }
    
    // Only apply sport filter if we're not doing radius search (since radius search handles it)
    if (filters.sport !== 'all' && !radiusSearch) {
      postLocationVenues = postLocationVenues.filter(v => 
        v.sport_type === filters.sport || 
        (v.sports_offered && v.sports_offered.includes(filters.sport))
      );
    }
    
    if (filters.price !== 'all') {
      postLocationVenues = postLocationVenues.filter(v => v.price_range === filters.price);
    }
    
    if (filters.rating[0] > 0) {
      postLocationVenues = postLocationVenues.filter(v => v.rating && v.rating >= filters.rating[0]);
    }

    if (filters.amenities.length > 0) {
      postLocationVenues = postLocationVenues.filter(v => 
        filters.amenities.every(amenity => v.amenities && v.amenities.includes(amenity))
      );
    }

    setFilteredVenues(postLocationVenues);
    setPage(1); 
    setIsSearching(false);
  }, [allVenues, searchTerm, selectedLocation, radiusSearch, filters, toast]);

  useEffect(() => {
    const handler = setTimeout(() => {
      applyFiltersAndSearch();
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(handler);
  }, [searchTerm, selectedLocation, radiusSearch, filters, applyFiltersAndSearch]);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleLocationSelect = useCallback((location) => {
    setRadiusSearch(null);
    setSelectedLocation(location);
  }, []);

  const handleRadiusSearch = useCallback((radiusData) => {
    setSelectedLocation(null);
    setRadiusSearch(radiusData);
  }, []);

  const paginatedVenues = useMemo(() => {
    const startIndex = (page - 1) * venuesPerPage;
    return filteredVenues.slice(startIndex, startIndex + venuesPerPage);
  }, [filteredVenues, page]);

  const pageCount = Math.ceil(filteredVenues.length / venuesPerPage);

  const Pagination = () => {
    if (pageCount <= 1) return null;
    return (
      <div className="flex justify-center items-center space-x-2 mt-8">
        <Button variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
        {[...Array(pageCount).keys()].map(number => (
          <Button key={number+1} variant={page === number+1 ? "default" : "outline"} onClick={() => setPage(number+1)}>{number+1}</Button>
        )).slice(Math.max(0, page - 3), page + 2)}
        <Button variant="outline" onClick={() => setPage(p => Math.min(pageCount, p + 1))} disabled={page === pageCount}>Next</Button>
      </div>
    );
  };
  
  const getLocationDisplayText = () => {
    if (radiusSearch) {
      return `within ${radiusSearch.radius} miles of your location`;
    }
    if (selectedLocation) {
      return `in ${selectedLocation.displayName}`;
    }
    return 'across all locations';
  };

  if (isLoading && allVenues.length === 0) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-4 mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">Find Your Next Venue</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Search venues by name, sport, or location. Use radius search for precise results.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
             <Label htmlFor="search-term" className="sr-only">Search by name or sport</Label>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="search-term"
              type="text"
              placeholder="Search by name, sport, city, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-base dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>
          <LocationSearch 
            onSelect={handleLocationSelect} 
            onRadiusSearch={handleRadiusSearch}
            initialValue={userState ? US_STATES[userState] : ''}
            allowRadiusSearch={true}
          />
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-4 lg:gap-8">
        <div className="lg:col-span-1 mb-8 lg:mb-0">
          <VenueFilters onFilterChange={handleFilterChange} />
        </div>

        <div className="lg:col-span-3">
          {isSearching ? (
            <div className="flex justify-center items-center h-96">
              <Loader2 className="w-16 h-16 animate-spin text-emerald-600" />
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Showing {paginatedVenues.length > 0 ? `${Math.min((page - 1) * venuesPerPage + 1, filteredVenues.length)}-${Math.min(page * venuesPerPage, filteredVenues.length)} of` : ''} {filteredVenues.length} venues {getLocationDisplayText()}
              </p>
              <AnimatePresence>
                {paginatedVenues.length > 0 ? (
                  <motion.div 
                    layout 
                    className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                  >
                    {paginatedVenues.map(venue => (
                      <motion.div
                         key={venue.id}
                         layout
                         initial={{ opacity: 0, scale: 0.9 }}
                         animate={{ opacity: 1, scale: 1 }}
                         exit={{ opacity: 0, scale: 0.9 }}
                         transition={{ duration: 0.3 }}
                      >
                        <VenueCard venue={venue} />
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center text-center h-96 bg-gray-50 dark:bg-gray-800/50 rounded-xl"
                  >
                    <Frown className="w-16 h-16 text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">No Venues Found</h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Try adjusting your search filters or location to find a match.</p>
                  </motion.div>
                )}
              </AnimatePresence>
              <Pagination />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
