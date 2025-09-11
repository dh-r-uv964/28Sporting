import React, { memo } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MapPin, ArrowRight, Phone, Globe, ExternalLink, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { formatSportName, formatLocationDisplay } from '@/components/common/constants';

// Professional sports venue images from Unsplash
const VENUE_IMAGES = {
  golf: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=600&h=400&fit=crop',
  tennis: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600&h=400&fit=crop',
  padel_tennis: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=600&h=400&fit=crop',
  pickleball: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&h=400&fit=crop',
  boxing: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=600&h=400&fit=crop',
  basketball: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&h=400&fit=crop',
  swimming: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600&h=400&fit=crop',
  hiking: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&h=400&fit=crop',
  fitness: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop',
  default: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&h=400&fit=crop'
};

const VenueCard = memo(({ venue }) => {
  const navigate = useNavigate();
  const { id, name, image_url, address, state, rating, review_count, sport_type, price_range, phone, website, distance, verified, membership_required } = venue;

  const handleViewDetails = () => {
    navigate(createPageUrl(`VenueDetails?id=${id}`));
  };

  const sportColorMap = {
    golf: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    tennis: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    padel_tennis: 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300',
    pickleball: 'bg-lime-100 text-lime-800 dark:bg-lime-900/50 dark:text-lime-300',
    boxing: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    basketball: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
    swimming: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    hiking: 'bg-stone-100 text-stone-800 dark:bg-stone-900/50 dark:text-stone-300',
    fitness: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300',
  };

  const displayImage = image_url || VENUE_IMAGES[sport_type] || VENUE_IMAGES.default;

  return (
    <Card className="overflow-hidden flex flex-col h-full bg-white dark:bg-gray-800 shadow-sm hover:shadow-lg transition-all duration-300 border-gray-200 dark:border-gray-700 rounded-xl group">
      <CardHeader className="p-0 relative">
        <div className="aspect-w-4 aspect-h-3 relative">
          <img
            src={displayImage}
            alt={name}
            className="object-cover w-full h-48 group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              e.target.src = VENUE_IMAGES.default;
            }}
          />
        </div>
        <div className="absolute top-3 right-3 flex items-center bg-black/70 text-white px-2.5 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm">
          <Star className="w-3 h-3 text-yellow-400 mr-1" />
          <span>{rating?.toFixed(1) || '4.0'}</span>
          <span className="ml-1 text-gray-300">({review_count || 0})</span>
        </div>
        {distance && (
          <div className="absolute top-3 left-3 bg-emerald-500/90 text-white px-2.5 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm">
            {distance} mi
          </div>
        )}
        {verified && (
          <div className="absolute bottom-3 right-3 bg-blue-500/90 text-white px-2 py-1 rounded-full text-xs font-bold backdrop-blur-sm flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Verified
          </div>
        )}
      </CardHeader>

      <CardContent className="p-4 flex-grow">
        <div className="flex justify-between items-start gap-2 mb-3">
            <Badge className={`capitalize text-xs ${sportColorMap[sport_type] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                {formatSportName(sport_type) || 'Sport'}
            </Badge>
            <div className="flex items-center gap-2">
              {price_range && (
                <Badge variant="outline" className="border-gray-300 dark:border-gray-600 font-mono text-xs">
                  {price_range}
                </Badge>
              )}
              {membership_required && (
                <Badge variant="secondary" className="text-xs">
                  Members Only
                </Badge>
              )}
            </div>
        </div>
        <CardTitle className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300 mb-2 line-clamp-2">
            {name}
        </CardTitle>
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
          <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0" />
          <span className="truncate">{formatLocationDisplay(address, state)}</span>
        </div>

        {/* Quick Contact Actions */}
        <div className="flex gap-2 mb-4">
          {phone && (
            <a 
              href={`tel:${phone}`} 
              className="flex items-center justify-center w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-800 transition-colors"
              onClick={(e) => e.stopPropagation()}
              title="Call venue"
            >
              <Phone className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </a>
          )}
          {website && (
            <a 
              href={website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-800 transition-colors"
              onClick={(e) => e.stopPropagation()}
              title="Visit website"
            >
              <Globe className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </a>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button onClick={handleViewDetails} className="w-full bg-emerald-600 hover:bg-emerald-700 transition-colors">
          View Details
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  );
});

export default VenueCard;