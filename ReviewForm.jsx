import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Upload, X, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SPORTS, formatSportName } from '@/components/common/constants';
import { UploadFile } from '@/api/integrations';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReviewForm({ venue, user, onSubmit, onCancel }) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [formData, setFormData] = useState({
    rating: 0,
    title: '',
    content: '',
    visit_date: '',
    sport_played: venue.sport_type,
    photos: [],
    pros: [],
    cons: []
  });
  const [currentPro, setCurrentPro] = useState('');
  const [currentCon, setCurrentCon] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a star rating for your review.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.content.trim()) {
      toast({
        title: "Review Content Required",
        description: "Please write your review.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const reviewData = {
        venue_id: venue.id,
        user_email: user.email,
        reviewer_name: user.full_name || user.email.split('@')[0],
        reviewer_image: user.profile_image || '',
        ...formData
      };

      await onSubmit(reviewData);
      
      // Reset form
      setFormData({
        rating: 0,
        title: '',
        content: '',
        visit_date: '',
        sport_played: venue.sport_type,
        photos: [],
        pros: [],
        cons: []
      });
      
      toast({
        title: "Review Submitted",
        description: "Thank you for sharing your experience!"
      });
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Could not submit your review. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploadingPhoto(true);
    
    try {
      const uploadPromises = files.map(file => UploadFile({ file }));
      const results = await Promise.all(uploadPromises);
      const newPhotoUrls = results.map(result => result.file_url);
      
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, ...newPhotoUrls]
      }));
      
      toast({
        title: "Photos Uploaded",
        description: `${files.length} photo${files.length > 1 ? 's' : ''} added to your review.`
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Could not upload photos. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const removePhoto = (index) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const addPro = () => {
    if (currentPro.trim()) {
      setFormData(prev => ({
        ...prev,
        pros: [...prev.pros, currentPro.trim()]
      }));
      setCurrentPro('');
    }
  };

  const addCon = () => {
    if (currentCon.trim()) {
      setFormData(prev => ({
        ...prev,
        cons: [...prev.cons, currentCon.trim()]
      }));
      setCurrentCon('');
    }
  };

  const removePro = (index) => {
    setFormData(prev => ({
      ...prev,
      pros: prev.pros.filter((_, i) => i !== index)
    }));
  };

  const removeCon = (index) => {
    setFormData(prev => ({
      ...prev,
      cons: prev.cons.filter((_, i) => i !== index)
    }));
  };

  const renderStarRating = () => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
            className="p-1 hover:scale-110 transition-transform"
          >
            <Star
              className={`w-8 h-8 ${
                star <= formData.rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300 hover:text-yellow-200'
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
          {formData.rating > 0 ? `${formData.rating} star${formData.rating > 1 ? 's' : ''}` : 'Select rating'}
        </span>
      </div>
    );
  };

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle>Write a Review for {venue.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div className="space-y-2">
            <Label>Overall Rating *</Label>
            {renderStarRating()}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Review Title</Label>
            <Input
              id="title"
              placeholder="Summarize your experience"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Your Review *</Label>
            <Textarea
              id="content"
              placeholder="Share details about your experience at this venue..."
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              className="h-32"
            />
          </div>

          {/* Visit Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="visit_date">Visit Date</Label>
              <Input
                id="visit_date"
                type="date"
                value={formData.visit_date}
                onChange={(e) => setFormData(prev => ({ ...prev, visit_date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sport_played">Sport Played</Label>
              <Select
                value={formData.sport_played}
                onValueChange={(value) => setFormData(prev => ({ ...prev, sport_played: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sport" />
                </SelectTrigger>
                <SelectContent>
                  {SPORTS.map(sport => (
                    <SelectItem key={sport} value={sport}>
                      {formatSportName(sport)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Pros and Cons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>What You Liked</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a positive point"
                  value={currentPro}
                  onChange={(e) => setCurrentPro(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPro())}
                />
                <Button type="button" onClick={addPro} size="sm">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.pros.map((pro, index) => (
                  <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                    {pro}
                    <button
                      type="button"
                      onClick={() => removePro(index)}
                      className="ml-1 hover:text-green-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Areas for Improvement</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a concern"
                  value={currentCon}
                  onChange={(e) => setCurrentCon(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCon())}
                />
                <Button type="button" onClick={addCon} size="sm">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.cons.map((con, index) => (
                  <Badge key={index} variant="secondary" className="bg-red-100 text-red-800">
                    {con}
                    <button
                      type="button"
                      onClick={() => removeCon(index)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Photo Upload */}
          <div className="space-y-2">
            <Label>Photos (Optional)</Label>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  id="photos"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('photos').click()}
                  disabled={isUploadingPhoto}
                >
                  {isUploadingPhoto ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  {isUploadingPhoto ? 'Uploading...' : 'Add Photos'}
                </Button>
                <span className="text-sm text-gray-500">
                  Max 5 photos, 10MB each
                </span>
              </div>
              
              {formData.photos.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <AnimatePresence>
                    {formData.photos.map((photo, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="relative"
                      >
                        <img
                          src={photo}
                          alt={`Review photo ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || formData.rating === 0}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Review'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}