
import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Venue } from "@/api/entities";
import { User } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { Dribbble, Frown } from "lucide-react";
import VenueCard from "../components/venues/VenueCard";
import VenueFilters from "../components/venues/VenueFilters";

const BASKETBALL_CONFIG = {
  name: "Basketball",
  icon: Dribbble,
  venueTypes: {
    indoor_court: "Indoor Courts",
    outdoor_court: "Outdoor Courts",
    recreation_center: "Recreation Centers",
  }
};

export default function BasketballVenues() {
  const [venues, setVenues] = useState([]);
  const [filteredVenues, setFilteredVenues] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [venueType, setVenueType] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [imageFetchingStatus, setImageFetchingStatus] = useState({});
  const [userLocation, setUserLocation] = useState(null);

  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const userData = await User.me();
      const location = userData.location;
      setUserLocation(location);

      const query = location ? { sport_type: "basketball", location } : { sport_type: "basketball" };
      const data = await Venue.filter(query, "-rating");
      setVenues(data);
      fetchImagesForVenues(data);
    } catch (error) {
      console.error("Error loading initial data:", error);
      const data = await Venue.filter({ sport_type: "basketball" }, "-rating");
      setVenues(data);
      fetchImagesForVenues(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const filterVenues = useCallback(() => {
    let filtered = venues.filter(venue =>
      venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venue.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (venueType !== "all") {
      filtered = filtered.filter(venue => venue.venue_type === venueType);
    }

    if (priceRange !== "all") {
      filtered = filtered.filter(venue => venue.price_range === priceRange);
    }

    setFilteredVenues(filtered);
  }, [venues, searchTerm, venueType, priceRange]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    filterVenues();
  }, [filterVenues]);

  const fetchImagesForVenues = async (venuesToUpdate) => {
    const venuesWithoutImages = venuesToUpdate.filter(v => !v.image_url);
    if (venuesWithoutImages.length === 0) return;

    for (const venue of venuesWithoutImages) {
      setImageFetchingStatus(prev => ({ ...prev, [venue.id]: 'fetching' }));
      try {
        const result = await InvokeLLM({
          prompt: `Find a high-quality, publicly usable image URL for the basketball court "${venue.name}" in "${venue.location}". Only return the direct image URL.`,
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: { image_url: { type: "string", format: "uri" } }
          }
        });
        
        if (result && result.image_url) {
          await Venue.update(venue.id, { image_url: result.image_url });
          setVenues(prev => prev.map(v => v.id === venue.id ? { ...v, image_url: result.image_url } : v));
        }
        setImageFetchingStatus(prev => ({ ...prev, [venue.id]: 'done' }));
      } catch (e) {
        console.error(`Failed to fetch image for ${venue.name}:`, e);
        setImageFetchingStatus(prev => ({ ...prev, [venue.id]: 'error' }));
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 pb-24 lg:pb-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-xl flex items-center justify-center">
              <BASKETBALL_CONFIG.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Basketball Courts</h1>
              <p className="text-gray-600 dark:text-gray-300">Showing venues {userLocation ? `near ${userLocation}` : "from all areas"}</p>
            </div>
          </div>
          <VenueFilters 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            venueType={venueType}
            setVenueType={setVenueType}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            sportConfig={BASKETBALL_CONFIG}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          {filteredVenues.map((venue, index) => (
            <VenueCard
              key={venue.id}
              venue={venue}
              isFetchingImage={imageFetchingStatus[venue.id] === 'fetching'}
              index={index}
            />
          ))}
        </motion.div>

        {filteredVenues.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Frown className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Basketball Courts Found</h3>
            <p className="text-gray-600 dark:text-gray-300">Try adjusting your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
