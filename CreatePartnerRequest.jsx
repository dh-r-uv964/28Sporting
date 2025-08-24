import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Venue } from "@/entities/Venue";
import { PartnerRequest } from "@/entities/PartnerRequest";
import { User } from "@/entities/User";
import { Calendar as CalendarIcon, Clock } from "lucide-react";

export default function CreatePartnerRequest() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    sport: '',
    venue_id: '',
    preferred_date: '',
    preferred_time: '',
    skill_level: 'intermediate',
    notes: ''
  });
  const [venues, setVenues] = useState([]);
  const [filteredVenues, setFilteredVenues] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const allVenues = await Venue.list();
      setVenues(allVenues);
      const me = await User.me();
      setCurrentUser(me);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (formData.sport) {
      setFilteredVenues(venues.filter(v => v.sport_type === formData.sport));
    } else {
      setFilteredVenues([]);
    }
    setFormData(prev => ({...prev, venue_id: ''}));
  }, [formData.sport, venues]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await PartnerRequest.create({
        ...formData,
        requester_email: currentUser.email,
      });
      navigate(createPageUrl("MyMatches"));
    } catch (error) {
      console.error("Failed to create request:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Find a Playing Partner</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="sport">Sport</Label>
                  <Select onValueChange={(v) => handleChange('sport', v)} value={formData.sport}>
                    <SelectTrigger id="sport"><SelectValue placeholder="Select a sport" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="golf">Golf</SelectItem>
                      <SelectItem value="tennis">Tennis</SelectItem>
                      <SelectItem value="paddle">Paddle</SelectItem>
                      <SelectItem value="pickleball">Pickleball</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="venue">Venue</Label>
                  <Select onValueChange={(v) => handleChange('venue_id', v)} value={formData.venue_id} disabled={!formData.sport}>
                    <SelectTrigger id="venue"><SelectValue placeholder="Select a venue" /></SelectTrigger>
                    <SelectContent>
                      {filteredVenues.map(venue => (
                        <SelectItem key={venue.id} value={venue.id}>{venue.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input id="date" type="date" value={formData.preferred_date} onChange={(e) => handleChange('preferred_date', e.target.value)} className="pl-10"/>
                  </div>
                </div>
                <div>
                  <Label htmlFor="time">Time</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input id="time" type="time" value={formData.preferred_time} onChange={(e) => handleChange('preferred_time', e.target.value)} className="pl-10"/>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="skill_level">Your Skill Level</Label>
                <Select onValueChange={(v) => handleChange('skill_level', v)} defaultValue="intermediate">
                  <SelectTrigger id="skill_level"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
 
