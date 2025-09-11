import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from 'framer-motion';
import { User } from '@/api/entities';
import { Venue } from '@/api/entities';
import { PartnerRequest } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, PartyPopper, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SPORTS, SKILL_LEVELS, TIME_SLOTS, DURATIONS, formatSportName } from '@/components/common/constants';
import { useToast } from '@/components/ui/use-toast';

export default function CreatePartnerRequest() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [user, setUser] = useState(null);
  const [venues, setVenues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    sport: '',
    venue_id: '',
    preferred_date: '',
    preferred_time: 'Any',
    duration: '1',
    skill_level: '',
    notes: '',
    liability_acknowledged: false,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const userData = await User.me();
        setUser(userData);

        const urlParams = new URLSearchParams(location.search);
        const venueIdFromUrl = urlParams.get('venue_id');
        
        let initialSport = '';
        if (userData.sports_preferences && userData.sports_preferences.length > 0) {
          initialSport = userData.sports_preferences[0];
        }
        
        if (venueIdFromUrl) {
          const venueResults = await Venue.filter({ id: venueIdFromUrl });
          if (venueResults.length > 0) {
            const venueData = venueResults[0];
            initialSport = venueData.sport_type;
          }
        }

        const initialSkill = initialSport && userData.skill_levels && userData.skill_levels[initialSport]
          ? userData.skill_levels[initialSport]
          : 'intermediate';

        setFormData(prev => ({ 
          ...prev, 
          sport: initialSport, 
          skill_level: initialSkill,
          venue_id: venueIdFromUrl || ''
        }));
      } catch (e) {
        navigate(createPageUrl('Welcome'));
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, [navigate, location.search]);

  useEffect(() => {
    const loadVenues = async () => {
      if (formData.sport && user?.state) {
        try {
          const sportVenues = await Venue.filter({ 
            sport_type: formData.sport, 
            state: user.state 
          });
          setVenues(sportVenues);
        } catch (error) {
          console.error('Failed to load venues:', error);
          setVenues([]);
        }
      } else {
        setVenues([]);
      }
    };
    loadVenues();
  }, [formData.sport, user?.state]);
  
  useEffect(() => {
    if (user && formData.sport) {
      setFormData(prev => ({
        ...prev,
        skill_level: user.skill_levels?.[formData.sport] || 'intermediate'
      }));
    }
  }, [formData.sport, user]);

  const handleChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = async () => {
    setError('');
    if (!formData.sport || !formData.venue_id || !formData.preferred_date || !formData.skill_level) {
      setError('Please fill out all required fields: Sport, Venue, Date, and Skill Level.');
      return;
    }
    if (!formData.liability_acknowledged) {
      setError('You must acknowledge the liability and safety policy.');
      return;
    }

    setIsSubmitting(true);
    try {
      await PartnerRequest.create({
        ...formData,
        requester_email: user.email,
        requester_full_name: user.full_name || user.email,
        requester_profile_image: user.profile_image || '',
        status: 'active',
      });
      setStep(2);
    } catch (e) {
      console.error("Failed to create request", e);
      setError('There was an error creating your request. Please try again.');
      toast({
        title: "Submission Failed",
        description: "Could not create your match request. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepOne = () => (
    <Card className="w-full max-w-2xl mx-auto dark:bg-gray-800">
      <CardHeader>
        <CardTitle>Create a New Match Request</CardTitle>
        <CardDescription>Find the perfect partner for your next game. Fill out the details below.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="sport">Sport</Label>
            <Select value={formData.sport} onValueChange={(value) => handleChange('sport', value)}>
              <SelectTrigger id="sport">
                <SelectValue placeholder="Select a sport" />
              </SelectTrigger>
              <SelectContent>
                {user?.sports_preferences?.map(sport => (
                  <SelectItem key={sport} value={sport}>
                    {formatSportName(sport)}
                  </SelectItem>
                )) ?? (
                  <SelectItem value={null} disabled>
                    Go to settings to select sports
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="venue">Venue (in your state: {user?.state})</Label>
            <Select 
              value={formData.venue_id} 
              onValueChange={(value) => handleChange('venue_id', value)} 
              disabled={!formData.sport || isLoading}
            >
              <SelectTrigger id="venue">
                <SelectValue placeholder={isLoading ? "Loading venues..." : "Select a venue"} />
              </SelectTrigger>
              <SelectContent>
                {venues.length > 0 ? venues.map(venue => (
                  <SelectItem key={venue.id} value={venue.id}>
                    {venue.name}
                  </SelectItem>
                )) : (
                  <SelectItem value={null} disabled>
                    No venues found for this sport in your state.
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input 
              id="date" 
              type="date" 
              min={new Date().toISOString().split("T")[0]} 
              value={formData.preferred_date} 
              onChange={(e) => handleChange('preferred_date', e.target.value)} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="time">Preferred Time</Label>
            <Select value={formData.preferred_time} onValueChange={(value) => handleChange('preferred_time', value)}>
              <SelectTrigger id="time">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIME_SLOTS.map(slot => (
                  <SelectItem key={slot.value} value={slot.value}>
                    {slot.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration">Duration</Label>
            <Select value={formData.duration} onValueChange={(value) => handleChange('duration', value)}>
              <SelectTrigger id="duration">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DURATIONS.map(duration => (
                  <SelectItem key={duration.value} value={duration.value}>
                    {duration.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="skill_level">Skill Level for this Game</Label>
          <Select value={formData.skill_level} onValueChange={(value) => handleChange('skill_level', value)}>
            <SelectTrigger id="skill_level">
              <SelectValue placeholder="Select your skill level"/>
            </SelectTrigger>
            <SelectContent>
              {SKILL_LEVELS.map(level => (
                <SelectItem key={level} value={level} className="capitalize">
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <CardDescription>This is for this specific match, not your overall profile skill.</CardDescription>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes for potential partners</Label>
          <Textarea 
            id="notes" 
            placeholder="e.g., 'Looking for a friendly match, not too competitive!' or 'Training for a tournament, need serious practice.'" 
            value={formData.notes} 
            onChange={(e) => handleChange('notes', e.target.value)} 
          />
        </div>

        <div className="space-y-3">
          <Label>Safety & Liability</Label>
          <div className="items-top flex space-x-2 p-4 rounded-md border bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700">
            <Checkbox 
              id="liability" 
              checked={formData.liability_acknowledged} 
              onCheckedChange={(checked) => handleChange('liability_acknowledged', !!checked)} 
            />
            <div className="grid gap-1.5 leading-none">
              <label htmlFor="liability" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                I acknowledge that 28SPORTING is a matchmaking platform. I am responsible for my own safety, and I agree to the{' '}
                <Link to={createPageUrl('Legal')} className="text-emerald-600 dark:text-emerald-400 underline">
                  Terms of Service and Liability Waiver
                </Link>.
              </label>
            </div>
          </div>
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button onClick={handleSubmit} className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isSubmitting ? 'Submitting...' : 'Submit Request'}
        </Button>
      </CardContent>
    </Card>
  );

  const renderStepTwo = () => (
    <Card className="w-full max-w-lg mx-auto text-center dark:bg-gray-800">
      <CardHeader>
        <div className="w-20 h-20 mx-auto bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
          <PartyPopper className="w-12 h-12 text-green-600 dark:text-green-400" />
        </div>
        <CardTitle className="mt-4 text-2xl">Request Submitted!</CardTitle>
        <CardDescription>Your match request is live. We'll notify you when you get a match.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-300">While you wait, why not check out other open requests?</p>
        <div className="flex justify-center space-x-4">
          <Button asChild variant="outline">
            <Link to={createPageUrl('Dashboard')}>Go to Dashboard</Link>
          </Button>
          <Button asChild>
            <Link to={createPageUrl('PartnerFinder')}>Find Partners</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen p-4 md:p-8">
      <motion.div
        key={step}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {step === 1 ? renderStepOne() : renderStepTwo()}
      </motion.div>
    </div>
  );
}