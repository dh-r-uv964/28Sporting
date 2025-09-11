import React, { useState, useEffect, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User } from '@/api/entities';
import { MatchProfile } from '@/api/entities';
import { UploadFile } from "@/api/integrations";
import { InvokeLLM } from "@/api/integrations";
import { deleteUserAccount } from '@/api/functions';
import { 
  User as UserIcon,
  Save,
  Upload,
  Sparkles,
  Loader2,
  Settings as SettingsIcon,
  Trash2,
  ShieldAlert
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import LocationSearch from '../components/common/LocationSearch';
import { SPORTS, SKILL_LEVELS, formatSportName, getUserInitials } from '@/components/common/constants';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

// Define US_STATES mapping for LocationSearch integration
const US_STATES = {
    "AL": "Alabama", "AK": "Alaska", "AZ": "Arizona", "AR": "Arkansas", "CA": "California",
    "CO": "Colorado", "CT": "Connecticut", "DE": "Delaware", "FL": "Florida", "GA": "Georgia",
    "HI": "Hawaii", "ID": "Idaho", "IL": "Illinois", "IN": "Indiana", "IA": "Iowa",
    "KS": "Kansas", "KY": "Kentucky", "LA": "Louisiana", "ME": "Maine", "MD": "Maryland",
    "MA": "Massachusetts", "MI": "Michigan", "MN": "Minnesota", "MS": "Mississippi", "MO": "Missouri",
    "MT": "Montana", "NE": "Nebraska", "NV": "Nevada", "NH": "New Hampshire", "NJ": "New Jersey",
    "NM": "New Mexico", "NY": "New York", "NC": "North Carolina", "ND": "North Dakota", "OH": "Ohio",
    "OK": "Oklahoma", "OR": "Oregon", "PA": "Pennsylvania", "RI": "Rhode Island", "SC": "South Carolina",
    "SD": "South Dakota", "TN": "Tennessee", "TX": "Texas", "UT": "Utah", "VT": "Vermont",
    "VA": "Virginia", "WA": "Washington", "WV": "West Virginia", "WI": "Wisconsin", "WY": "Wyoming"
};

const DeleteAccountDialog = ({ onConfirm }) => {
    const [confirmationText, setConfirmationText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        await onConfirm();
        setIsDeleting(false);
    };

    const isConfirmationMatching = confirmationText === 'DELETE';

    return (
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                    <ShieldAlert className="w-6 h-6 text-red-500" />
                    Delete Account
                </DialogTitle>
                <DialogDescription>
                    This action is irreversible. All of your data, including matches, profile, and messages, will be permanently deleted.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
                <p className="text-sm font-medium">To confirm, please type "<strong>DELETE</strong>" in the box below.</p>
                <Input
                    value={confirmationText}
                    onChange={(e) => setConfirmationText(e.target.value)}
                    placeholder="DELETE"
                    className="border-red-300 focus-visible:ring-red-500"
                />
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button
                    variant="destructive"
                    disabled={!isConfirmationMatching || isDeleting}
                    onClick={handleDelete}
                >
                    {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isDeleting ? 'Deleting...' : 'Delete My Account'}
                </Button>
            </DialogFooter>
        </DialogContent>
    );
};

export default function Settings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [matchProfile, setMatchProfile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    state: '',
    bio: '',
    sports_preferences: [],
    skill_levels: {},
    golf_handicap: null,
  });
  const [matchProfileData, setMatchProfileData] = useState({
      play_style: 'any',
      availability: {},
      preferred_partner_skill: [],
      accepting_new_matches: true,
  });

  const loadData = useCallback(async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      setFormData({
        full_name: userData.full_name || '',
        state: userData.state || '',
        bio: userData.bio || '',
        sports_preferences: userData.sports_preferences || [],
        skill_levels: userData.skill_levels || {},
        golf_handicap: userData.golf_handicap || null,
      });
      
      const profiles = await MatchProfile.filter({ user_email: userData.email });
      if (profiles.length > 0) {
        setMatchProfile(profiles[0]);
        setMatchProfileData({
            play_style: profiles[0].play_style || 'any',
            availability: profiles[0].availability || {},
            preferred_partner_skill: profiles[0].preferred_partner_skill || [],
            accepting_new_matches: profiles[0].accepting_new_matches !== false,
        });
      }

    } catch (error) {
      navigate(createPageUrl('Onboarding'));
    }
  }, [navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFormChange = useCallback((field, value) => setFormData(prev => ({ ...prev, [field]: value })), []);
  const handleMatchProfileChange = useCallback((field, value) => setMatchProfileData(prev => ({...prev, [field]: value})), []);
  const handleAvailabilityChange = useCallback((day, checked) => handleMatchProfileChange('availability', {...matchProfileData.availability, [day]: checked}), [handleMatchProfileChange, matchProfileData.availability]);

  const handleSkillLevelChange = useCallback((sport, value) => handleFormChange('skill_levels', { ...formData.skill_levels, [sport]: value }), [handleFormChange, formData.skill_levels]);
  
  const handleSportsPreferenceChange = useCallback((sport) => {
    const newSports = formData.sports_preferences.includes(sport) ? formData.sports_preferences.filter(s => s !== sport) : [...formData.sports_preferences, sport];
    const newSkills = {...formData.skill_levels};
    if (!newSports.includes(sport)) delete newSkills[sport];
    handleFormChange('sports_preferences', newSports);
    handleFormChange('skill_levels', newSkills);
  }, [formData.sports_preferences, formData.skill_levels, handleFormChange]);

  const handleLocationSelect = useCallback((location) => {
      const selectedStateAbbr = location.state; 
      if (selectedStateAbbr && US_STATES[selectedStateAbbr]) {
          handleFormChange('state', selectedStateAbbr);
      } else {
          toast({ title: "Please select a valid US state from the suggestions.", variant: "destructive" });
      }
  }, [handleFormChange, toast]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await User.updateMyUserData(formData);
      if (matchProfile) {
          await MatchProfile.update(matchProfile.id, matchProfileData);
      } else {
          const newProfile = await MatchProfile.create({ ...matchProfileData, user_email: user.email });
          setMatchProfile(newProfile);
      }
      toast({ title: "Settings saved successfully!", description: "Your changes are now active." });
      
      // Force dashboard refresh by navigating with a timestamp
      navigate(createPageUrl(`Dashboard?refresh=${Date.now()}`));
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({ title: "Save Failed", description: "Could not save your settings. Please try again.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  }, [formData, matchProfile, matchProfileData, user, toast, navigate]);

  const handleFileUpload = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    try {
        const { file_url } = await UploadFile({ file });
        await User.updateMyUserData({ profile_image: file_url });
        setUser(prev => ({ ...prev, profile_image: file_url }));
        toast({ title: "Profile image updated!" });
    } catch (error) { 
      console.error("Error uploading file:", error);
      toast({ title: "Upload Failed", variant: "destructive" });
    } 
    finally { setIsUploading(false); }
  }, [toast]);

  const handleAnalyzeBio = useCallback(async () => {
    if (!formData.bio || formData.sports_preferences.length === 0) {
      toast({ title: "AI Suggestion Unavailable", description: "Please enter a bio and select at least one sport to use AI suggestion.", variant: "destructive" });
      return;
    }
    setIsAnalyzing(true);
    try {
        const result = await InvokeLLM({
            prompt: `Analyze this bio: "${formData.bio}" for these sports: ${formData.sports_preferences.map(s => formatSportName(s)).join(', ')}. Suggest skill levels (beginner, intermediate, advanced, expert) for each of the listed sports only. Return a JSON object where keys are the sport names (e.g., 'tennis', 'golf') and values are the suggested skill levels. Only include sports mentioned in the list.`,
            response_json_schema: { type: "object", properties: formData.sports_preferences.reduce((acc, sport) => ({...acc, [sport]: { type: "string", enum: SKILL_LEVELS }}), {}) }
        });
        if (result && Object.keys(result).length > 0) {
          // Filter out any results that are not in the current sports preferences to avoid errors
          const filteredResult = Object.keys(result).reduce((acc, sport) => {
            if (formData.sports_preferences.includes(sport)) {
              acc[sport] = result[sport];
            }
            return acc;
          }, {});
          handleFormChange('skill_levels', { ...formData.skill_levels, ...filteredResult });
          toast({ title: "AI suggestions applied!" });
        } else {
          toast({ title: "No AI suggestions found", description: "AI could not suggest skill levels based on your bio.", variant: "info" });
        }
    } catch(e) { 
      console.error("AI analysis failed", e);
      toast({ title: "AI Analysis Failed", description: "There was an error communicating with the AI. Please try again later.", variant: "destructive" });
    } 
    finally { setIsAnalyzing(false); }
  }, [formData.bio, formData.sports_preferences, formData.skill_levels, handleFormChange, toast]);

  const handleDeleteAccount = useCallback(async () => {
      try {
          await deleteUserAccount();
          toast({
              title: "Account Deleted",
              description: "Your account and all associated data have been permanently removed.",
          });
          // The backend function will log the user out.
          // We just need to redirect to the welcome page.
          navigate(createPageUrl('Welcome'), { replace: true });
      } catch (error) {
          console.error("Failed to delete account:", error);
          toast({
              title: "Deletion Failed",
              description: "Could not delete your account at this time. Please try again later.",
              variant: "destructive",
          });
      }
  }, [navigate, toast]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-24 lg:pb-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl flex items-center justify-center">
          <SettingsIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile & Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">This is your identity on 28SPORTING. Make it count.</p>
        </div>
      </div>

      <Dialog>
        <div className="space-y-8">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between">
                <div><CardTitle className="text-gray-900 dark:text-white">Public Profile</CardTitle><CardDescription className="text-gray-600 dark:text-gray-400">What other players will see.</CardDescription></div>
                <div className="relative mt-4 md:mt-0">
                    <Avatar className="w-24 h-24 border-4 border-white dark:border-gray-800 shadow-lg">
                        <AvatarImage src={user.profile_image} alt={user.full_name} />
                        <AvatarFallback className="text-3xl bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400">
                          {getUserInitials(user)}
                        </AvatarFallback>
                    </Avatar>
                    <label htmlFor="photo-upload" className="absolute -bottom-2 -right-2 bg-emerald-600 rounded-full p-2 text-white cursor-pointer hover:bg-emerald-700 transition-colors shadow-md" aria-label="Upload profile picture">
                        {isUploading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Upload className="w-4 h-4"/>}
                        <input id="photo-upload" type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} accept="image/*"/>
                    </label>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="full_name" className="text-gray-700 dark:text-gray-300">Full Name</Label>
                        <Input id="full_name" value={formData.full_name} onChange={(e) => handleFormChange('full_name', e.target.value)} className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white" />
                      </div>
                      <div className="space-y-2">
                        <LocationSearch 
                          onSelect={handleLocationSelect} 
                          initialValue={formData.state ? US_STATES[formData.state] : ''} 
                          label="State of Residence"
                          placeholder="Search for a state or city..."
                        />
                      </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-gray-700 dark:text-gray-300">Bio</Label>
                    <Textarea id="bio" placeholder="Tell us about your play style..." value={formData.bio} onChange={(e) => handleFormChange('bio', e.target.value)} className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white" />
                  </div>
                  {formData.sports_preferences.includes('golf') && (
                    <div className="space-y-2 bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg">
                      <Label htmlFor="golf_handicap" className="text-gray-700 dark:text-gray-300">Golf Handicap Index</Label>
                      <Input 
                        id="golf_handicap" 
                        type="number" 
                        placeholder="Optional, e.g., 12.4" 
                        value={formData.golf_handicap || ''} 
                        onChange={(e) => handleFormChange('golf_handicap', e.target.value ? parseFloat(e.target.value) : null)} 
                        className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                      />
                    </div>
                  )}
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Your Sports & Skills</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">Select your sports and define your skill level for better matchmaking.</CardDescription>
              </CardHeader>
              <CardContent>
                  <div className="space-y-2 mb-6">
                    <Label className="text-gray-700 dark:text-gray-300">Favorite Sports</Label>
                    <div className="flex flex-wrap gap-2">
                      {SPORTS.map(sport => (
                        <Button 
                          key={sport} 
                          variant={formData.sports_preferences.includes(sport) ? "default" : "outline"} 
                          onClick={() => handleSportsPreferenceChange(sport)} 
                          className="capitalize"
                        >
                          {formatSportName(sport)}
                        </Button>
                      ))}
                    </div>
                  </div>
                  {formData.sports_preferences.length > 0 && (
                       <div className="space-y-4">
                         <div className="flex items-center justify-between">
                           <Label className="text-gray-700 dark:text-gray-300">Skill Levels</Label>
                           <Button onClick={handleAnalyzeBio} variant="outline" size="sm" disabled={isAnalyzing || !formData.bio || formData.sports_preferences.length === 0}>
                             {isAnalyzing ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Sparkles className="w-4 h-4 mr-2"/>}
                             {isAnalyzing ? "Analyzing..." : "AI Suggest"}
                           </Button>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                           {formData.sports_preferences.map(sport => (
                             <div key={sport} className="space-y-2">
                               <Label htmlFor={`skill-${sport}`} className="capitalize text-gray-700 dark:text-gray-300">{formatSportName(sport)}</Label>
                               <Select value={formData.skill_levels[sport] || ''} onValueChange={(value) => handleSkillLevelChange(sport, value)}>
                                 <SelectTrigger id={`skill-${sport}`} className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                                   <SelectValue placeholder="Select level" />
                                 </SelectTrigger>
                                 <SelectContent>
                                   {SKILL_LEVELS.map(level => (
                                     <SelectItem key={level} value={level} className="capitalize">{level}</SelectItem>
                                   ))}
                                 </SelectContent>
                               </Select>
                             </div>
                           ))}
                         </div>
                       </div>
                  )}
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Matchmaking Preferences</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">Fine-tune how you find partners.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="accepting-matches" className="text-gray-700 dark:text-gray-300">Accepting New Matches</Label>
                    <Switch id="accepting-matches" checked={matchProfileData.accepting_new_matches} onCheckedChange={(c) => handleMatchProfileChange('accepting_new_matches', c)}/>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700 dark:text-gray-300">Play Style</Label>
                    <Select value={matchProfileData.play_style} onValueChange={v => handleMatchProfileChange('play_style', v)}>
                      <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                        <SelectValue/>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="competitive">Competitive</SelectItem>
                        <SelectItem value="training">Training</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700 dark:text-gray-300">Availability</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {Object.entries({
                        weekdays_morning:"Weekdays AM", 
                        weekdays_afternoon:"Weekdays PM", 
                        weekdays_evening:"Weekdays Eve", 
                        weekends_morning:"Weekends AM", 
                        weekends_afternoon:"Weekends PM", 
                        weekends_evening:"Weekends Eve"
                      }).map(([key, label]) => (
                        <div key={key} className="flex items-center space-x-2">
                          <Checkbox 
                            id={key} 
                            checked={!!matchProfileData.availability[key]} 
                            onCheckedChange={c=>handleAvailabilityChange(key, !!c)}
                          />
                          <label htmlFor={key} className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
                        </div>
                      ))}
                    </div>
                  </div>
              </CardContent>
            </Card>
            
            <Card className="border-red-500/50 dark:border-red-500/30 bg-red-50/50 dark:bg-red-900/10">
                <CardHeader>
                    <CardTitle className="text-red-700 dark:text-red-400">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <p className="font-medium text-gray-800 dark:text-gray-200">Delete Your Account</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Once you delete your account, there is no going back. Please be certain.</p>
                    </div>
                    <DialogTrigger asChild>
                        <Button variant="destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Account
                        </Button>
                    </DialogTrigger>
                </CardContent>
            </Card>
            
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={isSaving} size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                {isSaving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                {isSaving ? 'Saving...' : 'Save All Changes'}
              </Button>
            </div>
        </div>
        <DeleteAccountDialog onConfirm={handleDeleteAccount} />
      </Dialog>
    </div>
  );
}