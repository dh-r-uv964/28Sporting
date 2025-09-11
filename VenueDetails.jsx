import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Venue } from '@/api/entities';
import { Review } from '@/api/entities';
import { User } from '@/api/entities';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft, Star, MapPin, Phone, Globe, Clock, 
  Users, Car, Wifi, CheckCircle, ExternalLink,
  Calendar, MessageSquare, Loader2
} from 'lucide-react';
import { formatSportName, formatLocationDisplay, isValidObjectId } from '@/components/common/constants';
import ReviewCard from '@/components/reviews/ReviewCard';
import ReviewForm from '@/components/reviews/ReviewForm';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';

export default function VenueDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [venue, setVenue] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [error, setError] = useState(null);

  const loadVenueData = useCallback(async () => {
    const urlParams = new URLSearchParams(location.search);
    const venueId = urlParams.get('id');

    if (!venueId) {
      setError('No venue ID provided');
      setIsLoading(false);
      return;
    }

    if (!isValidObjectId(venueId)) {
      setError('Invalid venue ID');
      setIsLoading(false);
      return;
    }

    try {
      const [currentUser, venueData] = await Promise.all([
        User.me().catch(() => null),
        Venue.filter({ id: venueId })
      ]);

      setUser(currentUser);

      if (venueData.length === 0) {
        setError('Venue not found');
        setIsLoading(false);
        return;
      }

      const venueInfo = venueData[0];
      setVenue(venueInfo);

      // Load reviews
      try {
        const venueReviews = await Review.filter({ venue_id: venueId }, '-created_date');
        setReviews(venueReviews);
      } catch (reviewError) {
        console.warn('Could not load reviews:', reviewError);
        setReviews([]);
      }

    } catch (error) {
      console.error('Error loading venue:', error);
      setError('Failed to load venue data');
    } finally {
      setIsLoading(false);
    }
  }, [location.search]);

  useEffect(() => {
    loadVenueData();
  }, [loadVenueData]);

  const handleReviewSubmit = async (reviewData) => {
    try {
      await Review.create(reviewData);
      
      // Reload reviews
      const updatedReviews = await Review.filter({ venue_id: venue.id }, '-created_date');
      setReviews(updatedReviews);
      
      setShowReviewForm(false);
      
      toast({
        title: "Review Added",
        description: "Your review has been posted successfully!"
      });
    } catch (error) {
      console.error('Failed to submit review:', error);
      throw error;
    }
  };

  const handleHelpfulVote = async (reviewId) => {
    // This would increment the helpful_votes count
    // For now, just show a toast
    toast({
      title: "Vote Recorded",
      description: "Thank you for your feedback!"
    });
  };

  const handleBookVenue = () => {
    if (venue.booking_system_url) {
      window.open(venue.booking_system_url, '_blank');
    } else {
      navigate(createPageUrl(`CreatePartnerRequest?venue_id=${venue.id}`));
    }
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : venue?.rating || 0;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Venue Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <Button onClick={() => navigate(createPageUrl('VenueSearch'))}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Venue Search
          </Button>
        </div>
      </div>
    );
  }

  if (!venue) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-24 lg:pb-8">
      <Button 
        onClick={() => navigate(createPageUrl('VenueSearch'))} 
        variant="ghost" 
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Search
      </Button>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero Section */}
          <Card className="overflow-hidden">
            <div className="aspect-w-16 aspect-h-9 relative">
              <img
                src={venue.image_url || `https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&h=400&fit=crop`}
                alt={venue.name}
                className="object-cover w-full h-64 lg:h-80"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&h=400&fit=crop';
                }}
              />
              <div className="absolute top-4 right-4 flex items-center bg-black/70 text-white px-3 py-2 rounded-full">
                <Star className="w-4 h-4 text-yellow-400 mr-1" />
                <span className="font-semibold">{averageRating.toFixed(1)}</span>
                <span className="ml-1 text-gray-300">({reviews.length} reviews)</span>
              </div>
            </div>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{venue.name}</h1>
                  <div className="flex items-center gap-4 flex-wrap">
                    <Badge className="capitalize bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                      {formatSportName(venue.sport_type)}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {venue.venue_type?.replace('_', ' ')}
                    </Badge>
                    {venue.price_range && (
                      <Badge variant="outline" className="font-mono">
                        {venue.price_range}
                      </Badge>
                    )}
                    {venue.verified && (
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center text-gray-600 dark:text-gray-400 mb-4">
                <MapPin className="w-5 h-5 mr-2" />
                <span>{formatLocationDisplay(venue.address, venue.state)}</span>
              </div>

              {venue.description && (
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {venue.description}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
              <TabsTrigger value="photos">Photos</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Amenities */}
              {venue.amenities && venue.amenities.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Amenities & Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {venue.amenities.map((amenity, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Operating Hours */}
              {venue.operating_hours && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Operating Hours
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2">
                      {Object.entries(venue.operating_hours).map(([day, hours]) => (
                        <div key={day} className="flex justify-between items-center">
                          <span className="capitalize font-medium">{day}</span>
                          <span className="text-gray-600 dark:text-gray-400">{hours}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Sports Offered */}
              {venue.sports_offered && venue.sports_offered.length > 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Sports Available</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {venue.sports_offered.map((sport, index) => (
                        <Badge key={index} variant="secondary" className="capitalize">
                          {formatSportName(sport)}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="reviews" className="space-y-6">
              {user && (
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">User Reviews</h3>
                  <Button onClick={() => setShowReviewForm(!showReviewForm)}>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Write Review
                  </Button>
                </div>
              )}

              {showReviewForm && user && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <ReviewForm
                    venue={venue}
                    user={user}
                    onSubmit={handleReviewSubmit}
                    onCancel={() => setShowReviewForm(false)}
                  />
                </motion.div>
              )}

              <div className="space-y-4">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <ReviewCard
                      key={review.id}
                      review={review}
                      onHelpfulVote={handleHelpfulVote}
                    />
                  ))
                ) : (
                  <Card className="text-center p-8">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Reviews Yet</h3>
                    <p className="text-gray-600 dark:text-gray-400">Be the first to share your experience!</p>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="photos">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {venue.image_url && (
                  <img
                    src={venue.image_url}
                    alt={venue.name}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                )}
                {/* Add more photos from reviews here if available */}
                {reviews.flatMap(review => review.photos || []).map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`Review photo ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Booking Actions */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <Button onClick={handleBookVenue} className="w-full" size="lg">
                  <Calendar className="w-5 h-5 mr-2" />
                  {venue.booking_system_url ? 'Book Online' : 'Find Partners'}
                </Button>
                
                <Button
                  onClick={() => navigate(createPageUrl(`CreatePartnerRequest?venue_id=${venue.id}`))}
                  variant="outline"
                  className="w-full"
                >
                  <Users className="w-5 h-5 mr-2" />
                  Create Match Request
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {venue.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-500" />
                  <a
                    href={`tel:${venue.phone}`}
                    className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                  >
                    {venue.phone}
                  </a>
                </div>
              )}
              
              {venue.website && (
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-gray-500" />
                  <a
                    href={venue.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-1"
                  >
                    Visit Website
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {venue.external_review_url && (
                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-gray-500" />
                  <a
                    href={venue.external_review_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-1"
                  >
                    View on {venue.external_review_provider}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {venue.parking_availability && (
                <div className="flex items-center gap-3">
                  <Car className="w-5 h-5 text-gray-500" />
                  <span className="capitalize">{venue.parking_availability} Parking</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>At a Glance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Type:</span>
                <span className="capitalize">{venue.venue_type?.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Price Range:</span>
                <span>{venue.price_range || 'Not specified'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Membership:</span>
                <span>{venue.membership_required ? 'Required' : 'Not Required'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Safety Rating:</span>
                <span className="capitalize">{venue.safety_rating || 'Good'}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}