import React, { useState, useEffect, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User } from '@/api/entities';
import { MatchProfile } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { UploadFile, InvokeLLM } from '@/api/integrations';
import { Upload, Sparkles, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import LocationSearch from '@/components/common/LocationSearch';
import { SPORTS, SKILL_LEVELS, formatSportName, getUserInitials } from '@/components/common/constants';
import { useToast } from '@/components/ui/use-toast';
import { createPageUrl } from '@/utils';

const stepTitles = [
  "Welcome! Let's get to know you.",
  "What sports do you play?",
  "Tell us more about yourself."
];

const ProfileSetup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [user, setUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    state: '',
    profile_image: '',
    sports_preferences: [],
    skill_levels: {},
    golf_handicap: null,
    bio: '',
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await User.me();
        setUser(userData);
        setFormData(prev => ({
          ...prev,
          full_name: userData.full_name || '',
          profile_image: userData.profile_image || '',
        }));
      } catch (e) {
        navigate(createPageUrl('Welcome'));
      }
    };
    fetchUser();
  }, [navigate]);

  const handleFormChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSkillLevelChange = useCallback((sport, value) => {
    handleFormChange('skill_levels', { ...formData.skill_levels, [sport]: value });
  }, [handleFormChange, formData.skill_levels]);
  
  const handleSportsPreferenceChange = useCallback((sport) => {
    const newSports = formData.sports_preferences.includes(sport) 
      ? formData.sports_preferences.filter(s => s !== sport) 
      : [...formData.sports_preferences, sport];
    
    const newSkills = {...formData.skill_levels};
    if (!newSports.includes(sport)) delete newSkills[sport];
    
    handleFormChange('sports_preferences', newSports);
    handleFormChange('skill_levels', newSkills);
  }, [formData.sports_preferences, formData.skill_levels, handleFormChange]);

  const handleFileUpload = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      handleFormChange('profile_image', file_url);
      toast({ title: "Image uploaded successfully!" });
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({ title: "Upload Failed", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  }, [handleFormChange, toast]);

  const handleAnalyzeBio = useCallback(async () => {
    if (!formData.bio || formData.sports_preferences.length === 0) return;
    
    setIsAnalyzing(true);
    try {
      const result = await InvokeLLM({
        prompt: `Analyze this user bio: "${formData.bio}" for these sports: ${formData.sports_preferences.join(', ')}. Suggest skill levels (beginner, intermediate, advanced, expert).`,
        response_json_schema: { type: "object", properties: formData.sports_preferences.reduce((acc, sport) => ({...acc, [sport]: { type: "string", enum: SKILL_LEVELS }}), {}) }
      });
      if (result) handleFormChange('skill_levels', { ...formData.skill_levels, ...result });
    } catch(e) { console.error("AI analysis failed", e); } 
    finally { setIsAnalyzing(false); }
  }, [formData.bio, formData.sports_preferences, formData.skill_levels, handleFormChange]);

  const nextStep = () => {
    if (step === 1 && (!formData.full_name || !formData.state)) {
      toast({ title: "Please fill in your name and state.", variant: "destructive" });
      return;
    }
    if (step === 2 && formData.sports_preferences.length === 0) {
      toast({ title: "Please select at least one sport.", variant: "destructive" });
      return;
    }
    setStep(prev => Math.min(prev + 1, 3));
  };
  
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const finishSetup = async () => {
    setIsSaving(true);
    try {
      await User.updateMyUserData({ ...formData, has_completed_setup: true });
      await MatchProfile.create({
        user_email: user.email,
        play_style: 'any',
        availability: {},
        preferred_partner_skill: SKILL_LEVELS,
        accepting_new_matches: true,
      });
      toast({ title: "Profile setup complete!", description: "Welcome to 28SPORTING!" });
      navigate(createPageUrl('Dashboard'));
    } catch (e) {
      console.error("Failed to save profile:", e);
      toast({ title: "Save failed", description: "Could not save your profile. Please try again.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <Avatar className="w-32 h-32 border-4 border-white dark:border-gray-800 shadow-lg">
                  <AvatarImage src={formData.profile_image} alt={formData.full_name} />
                  <AvatarFallback className="text-4xl bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400">
                    {getUserInitials({ full_name: formData.full_name, email: user?.email })}
                  </AvatarFallback>
                </Avatar>
                <label htmlFor="photo-upload" className="absolute -bottom-2 -right-2 bg-emerald-600 rounded-full p-3 text-white cursor-pointer hover:bg-emerald-700">
                  {isUploading ? <Loader2 className="w-5 h-5 animate-spin"/> : <Upload className="w-5 h-5"/>}
                  <input id="photo-upload" type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} accept="image/*"/>
                </label>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input id="full_name" value={formData.full_name} onChange={(e) => handleFormChange('full_name', e.target.value)} />
            </div>
            <LocationSearch onSelect={(value) => handleFormChange('state', value)} initialValue={formData.state} label="State of Residence" />
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label>Favorite Sports</Label>
              <p className="text-sm text-gray-500 mb-4">Select all the sports you play or are interested in.</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {SPORTS.map(sport => (
                  <Button key={sport} variant={formData.sports_preferences.includes(sport) ? "default" : "outline"} onClick={() => handleSportsPreferenceChange(sport)}>
                    {formatSportName(sport)}
                  </Button>
                ))}
              </div>
            </div>
            {formData.sports_preferences.length > 0 && (
              <div>
                <Label>Skill Levels</Label>
                 <p className="text-sm text-gray-500 mb-4">Rate your skill for each sport you selected.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.sports_preferences.map(sport => (
                    <div key={sport} className="space-y-2">
                      <Label htmlFor={`skill-${sport}`} className="text-sm">{formatSportName(sport)}</Label>
                      <Select value={formData.skill_levels[sport] || ''} onValueChange={(value) => handleSkillLevelChange(sport, value)}>
                        <SelectTrigger id={`skill-${sport}`}><SelectValue placeholder="Select level" /></SelectTrigger>
                        <SelectContent>
                          {SKILL_LEVELS.map(level => <SelectItem key={level} value={level} className="capitalize">{level}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="bio">Your Bio</Label>
              <p className="text-sm text-gray-500">Introduce yourself to other players. What are you looking for in a match?</p>
              <Textarea id="bio" placeholder="e.g., Casual weekend player, looking for friendly matches. Also interested in competitive doubles." value={formData.bio} onChange={(e) => handleFormChange('bio', e.target.value)} className="h-28"/>
            </div>
            {formData.sports_preferences.includes('golf') && (
              <div className="space-y-2 bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg">
                <Label htmlFor="golf_handicap">Golf Handicap Index</Label>
                <Input id="golf_handicap" type="number" placeholder="Optional, e.g., 12.4" value={formData.golf_handicap || ''} onChange={(e) => handleFormChange('golf_handicap', e.target.value ? parseFloat(e.target.value) : null)} />
              </div>
            )}
          </div>
        );
      default: return null;
    }
  };

  if (!user) return <div className="flex justify-center items-center h-screen"><Loader2 className="w-12 h-12 animate-spin text-emerald-600" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <Progress value={(step / 3) * 100} className="mb-4" />
          <CardTitle>{stepTitles[step - 1]}</CardTitle>
          <CardDescription>This will help us find the best matches for you.</CardDescription>
        </CardHeader>
        <CardContent>
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>
        </CardContent>
        <div className="p-6 pt-0 flex justify-between items-center">
          <Button variant="outline" onClick={prevStep} disabled={step === 1}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          {step < 3 ? (
            <Button onClick={nextStep}>
              Next <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={finishSetup} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {isSaving ? "Finishing..." : "Finish Setup"}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ProfileSetup;