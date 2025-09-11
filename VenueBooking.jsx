import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Venue } from '@/api/entities';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, MapPin, CreditCard, ArrowLeft, Loader2 } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { formatSportName, formatLocationDisplay } from '@/components/common/constants';

export default function VenueBooking() {
    const navigate = useNavigate();
    const location = useLocation();
    const [venue, setVenue] = useState(null);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [bookingData, setBookingData] = useState({
        date: '',
        time: '10:00',
        duration: '1',
        participants: 1
    });

    const urlParams = new URLSearchParams(location.search);
    const venueId = urlParams.get('id');

    useEffect(() => {
        const loadData = async () => {
            try {
                const [venueData, userData] = await Promise.all([
                    Venue.filter({ id: venueId }),
                    User.me()
                ]);
                
                if (venueData.length === 0) {
                    navigate(createPageUrl('VenueSearch'));
                    return;
                }
                
                setVenue(venueData[0]);
                setUser(userData);
                
                // Set minimum date to today
                const today = new Date().toISOString().split('T')[0];
                setBookingData(prev => ({ ...prev, date: today }));
                
            } catch (error) {
                console.error('Failed to load booking data:', error);
                navigate(createPageUrl('VenueSearch'));
            } finally {
                setIsLoading(false);
            }
        };

        if (venueId) {
            loadData();
        } else {
            navigate(createPageUrl('VenueSearch'));
        }
    }, [venueId, navigate]);

    const handleBookingChange = (field, value) => {
        setBookingData(prev => ({ ...prev, [field]: value }));
    };

    const calculatePrice = () => {
        const basePrice = 50;
        const hourlyRate = venue?.price_range === '$$$$' ? 100 : venue?.price_range === '$$$' ? 75 : venue?.price_range === '$$' ? 50 : 35;
        return hourlyRate * parseFloat(bookingData.duration);
    };

    const handleProceedToCheckout = () => {
        const checkoutParams = new URLSearchParams({
            venue_id: venue.id,
            date: bookingData.date,
            time: bookingData.time,
            duration: bookingData.duration
        });
        
        navigate(createPageUrl(`Checkout?${checkoutParams.toString()}`));
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
                <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
            </div>
        );
    }

    if (!venue) {
        return null;
    }

    const timeSlots = Array.from({ length: 14 }, (_, i) => {
        const hour = 6 + i;
        const time24 = `${hour.toString().padStart(2, '0')}:00`;
        const time12 = hour > 12 ? `${hour - 12}:00 PM` : hour === 12 ? '12:00 PM' : `${hour}:00 AM`;
        return { value: time24, label: time12 };
    });

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <Button 
                    variant="ghost" 
                    onClick={() => navigate(createPageUrl(`VenueDetails?id=${venue.id}`))}
                    className="mb-6"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Venue Details
                </Button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Venue Info */}
                    <div className="lg:col-span-1">
                        <Card className="bg-white dark:bg-gray-800">
                            <CardHeader>
                                <div className="aspect-[4/3] rounded-lg overflow-hidden mb-4">
                                    <img 
                                        src={venue.image_url || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop'} 
                                        alt={venue.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <CardTitle className="dark:text-white">{venue.name}</CardTitle>
                                <CardDescription className="dark:text-gray-300">
                                    {formatSportName(venue.sport_type)} • {venue.price_range}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                    <MapPin className="w-4 h-4 mr-2" />
                                    <span>{formatLocationDisplay(venue.address, venue.state)}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Booking Form */}
                    <div className="lg:col-span-2">
                        <Card className="bg-white dark:bg-gray-800">
                            <CardHeader>
                                <CardTitle className="dark:text-white">Book Your Session</CardTitle>
                                <CardDescription className="dark:text-gray-300">
                                    Select your preferred date and time for your {formatSportName(venue.sport_type)} session.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="date" className="dark:text-white">Date</Label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <Input
                                                id="date"
                                                type="date"
                                                value={bookingData.date}
                                                onChange={(e) => handleBookingChange('date', e.target.value)}
                                                min={new Date().toISOString().split('T')[0]}
                                                className="pl-10 dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="time" className="dark:text-white">Time</Label>
                                        <Select value={bookingData.time} onValueChange={(v) => handleBookingChange('time', v)}>
                                            <SelectTrigger className="dark:bg-gray-700 dark:text-white">
                                                <Clock className="w-4 h-4 mr-2" />
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {timeSlots.map(slot => (
                                                    <SelectItem key={slot.value} value={slot.value}>
                                                        {slot.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="duration" className="dark:text-white">Duration</Label>
                                        <Select value={bookingData.duration} onValueChange={(v) => handleBookingChange('duration', v)}>
                                            <SelectTrigger className="dark:bg-gray-700 dark:text-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1">1 Hour</SelectItem>
                                                <SelectItem value="1.5">1.5 Hours</SelectItem>
                                                <SelectItem value="2">2 Hours</SelectItem>
                                                <SelectItem value="3">3 Hours</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="participants" className="dark:text-white">Participants</Label>
                                        <Select value={bookingData.participants.toString()} onValueChange={(v) => handleBookingChange('participants', parseInt(v))}>
                                            <SelectTrigger className="dark:bg-gray-700 dark:text-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1">Just me</SelectItem>
                                                <SelectItem value="2">2 people</SelectItem>
                                                <SelectItem value="3">3 people</SelectItem>
                                                <SelectItem value="4">4 people</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Price Summary */}
                                <div className="border-t dark:border-gray-700 pt-6">
                                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                                        <div className="flex justify-between items-center text-lg font-semibold dark:text-white">
                                            <span>Total Cost</span>
                                            <span>${calculatePrice()}</span>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            ${calculatePrice() / parseFloat(bookingData.duration)}/hour × {bookingData.duration} hour(s)
                                        </p>
                                    </div>
                                </div>

                                <Button 
                                    onClick={handleProceedToCheckout}
                                    className="w-full text-lg py-6 bg-emerald-600 hover:bg-emerald-700"
                                    disabled={!bookingData.date || !bookingData.time}
                                >
                                    <CreditCard className="w-5 h-5 mr-2" />
                                    Proceed to Payment
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}