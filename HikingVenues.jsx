import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Venue } from "@/api/entities";
import { User } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { Mountain, Frown } from "lucide-react";
import VenueCard from "../components/venues/VenueCard";
import VenueFilters from "../components/venues/VenueFilters";

const HIKING_CONFIG = {
  name: "Hiking",
  icon: Mountain,
  venueTypes: {
    public: "National Parks",
    private: "State Parks",
    gym: "Local Trails",
  }
};

export default function HikingVenues() {
  const [venues, setVenues] = useState([]);
  const [filteredVenues, setFilteredVenues] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [venueType, setVenueType] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [imageFetchingStatus, setImageFetchingStatus] = useState({});
  const [userLocation, setUserLocation] = useState(null);

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

  const fetchImagesForVenues = useCallback(async (venuesToUpdate) => {
    const venuesWithoutImages = venuesToUpdate.filter(v => !v.image_url);
    if (venuesWithoutImages.length === 0) return;

    for (const venue of venuesWithoutImages) {
      setImageFetchingStatus(prev => ({ ...prev, [venue.id]: 'fetching' }));
      try {
        const result = await InvokeLLM({
          prompt: `Find a high-quality, scenic, publicly usable image URL for the hiking trail or park "${venue.name}" in "${venue.location}". Only return the direct image URL.`,
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
  }, []);

  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const userData = await User.me();
      const location = userData.location;
      setUserLocation(location);

      const query = { sport_type: "hiking" };
      const data = await Venue.filter(query, "-rating");
      setVenues(data);
      fetchImagesForVenues(data);
    } catch (error) {
      console.error("Error loading initial data:", error);
      const data = await Venue.filter({ sport_type: "hiking" }, "-rating");
      setVenues(data);
      fetchImagesForVenues(data);
    } finally {
      setIsLoading(false);
    }
  }, [fetchImagesForVenues]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    filterVenues();
  }, [filterVenues]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 pb-24 lg:pb-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-teal-700 rounded-xl flex items-center justify-center">
              <HIKING_CONFIG.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Hiking Trails & Parks</h1>
              <p className="text-gray-600">Showing venues {userLocation ? `near ${userLocation}` : "from all areas"}</p>
            </div>
          </div>
          <VenueFilters 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            venueType={venueType}
            setVenueType={setVenueType}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            sportConfig={HIKING_CONFIG}
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
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Frown className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Trails Found</h3>
            <p className="text-gray-600">Try adjusting your location or search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}