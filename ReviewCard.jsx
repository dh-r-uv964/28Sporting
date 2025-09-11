import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star, ThumbsUp, Calendar, Trophy } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { formatSportName, getUserInitials } from '@/components/common/constants';
import { motion } from 'framer-motion';

export default function ReviewCard({ review, onHelpfulVote }) {
  const [isVoting, setIsVoting] = useState(false);

  const handleHelpfulClick = async () => {
    setIsVoting(true);
    await onHelpfulVote(review.id);
    setIsVoting(false);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating 
            ? 'fill-yellow-400 text-yellow-400' 
            : 'text-gray-300 dark:text-gray-600'
        }`}
      />
    ));
  };

  const mockUser = {
    full_name: review.reviewer_name,
    email: review.user_email
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 mb-4">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12 border-2 border-gray-200 dark:border-gray-700">
                <AvatarImage src={review.reviewer_image} alt={review.reviewer_name} />
                <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 font-bold">
                  {getUserInitials(mockUser)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {review.reviewer_name}
                </h4>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Calendar className="w-3 h-3" />
                  {review.visit_date 
                    ? `Visited ${formatDistanceToNow(new Date(review.visit_date))} ago`
                    : `Reviewed ${formatDistanceToNow(new Date(review.created_date))} ago`
                  }
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {renderStars(review.rating)}
              </div>
              {review.sport_played && (
                <Badge variant="outline" className="text-xs">
                  <Trophy className="w-3 h-3 mr-1" />
                  {formatSportName(review.sport_played)}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {review.title && (
            <h5 className="font-semibold text-gray-900 dark:text-white">
              "{review.title}"
            </h5>
          )}
          
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {review.content}
          </p>

          {(review.pros?.length > 0 || review.cons?.length > 0) && (
            <div className="grid md:grid-cols-2 gap-4">
              {review.pros?.length > 0 && (
                <div>
                  <h6 className="font-medium text-green-700 dark:text-green-400 mb-2">
                    👍 What they liked:
                  </h6>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    {review.pros.map((pro, index) => (
                      <li key={index}>• {pro}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {review.cons?.length > 0 && (
                <div>
                  <h6 className="font-medium text-red-700 dark:text-red-400 mb-2">
                    👎 Areas for improvement:
                  </h6>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    {review.cons.map((con, index) => (
                      <li key={index}>• {con}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {review.photos?.length > 0 && (
            <div>
              <h6 className="font-medium text-gray-900 dark:text-white mb-2">Photos:</h6>
              <div className="flex gap-2 overflow-x-auto">
                {review.photos.map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`Review photo ${index + 1}`}
                    className="w-24 h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-700 flex-shrink-0"
                  />
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleHelpfulClick}
              disabled={isVoting}
              className="text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400"
            >
              <ThumbsUp className="w-4 h-4 mr-2" />
              Helpful ({review.helpful_votes || 0})
            </Button>
            
            {review.verified_visit && (
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
                ✓ Verified Visit
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}