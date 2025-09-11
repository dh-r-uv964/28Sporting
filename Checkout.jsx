import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, CheckCircle, AlertTriangle, ArrowLeft, CreditCard } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { stripeCheckout } from '@/api/functions';

export default function Checkout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');

    const urlParams = new URLSearchParams(location.search);
    const bookingData = {
        venue_id: urlParams.get('venue_id'),
        booking_date: urlParams.get('date'),
        booking_time: urlParams.get('time'),
        duration: urlParams.get('duration') || '1'
    };
    
    const isVenueBooking = bookingData.venue_id;
    const isSubscription = !isVenueBooking;

    useEffect(() => {
        User.me().then(setUser).catch(() => navigate(createPageUrl('Welcome')));
    }, [navigate]);

    const handleProceedToPayment = async () => {
        setIsProcessing(true);
        setError('');
        
        try {
            const checkoutData = isVenueBooking 
                ? { 
                    type: 'venue_booking',
                    ...bookingData
                  }
                : { type: 'ai_pro_subscription' };
            
            const { data } = await stripeCheckout(checkoutData);
            
            if (data.url) {
                // Redirect to Stripe Checkout
                window.location.href = data.url;
            } else {
                throw new Error('No checkout URL received');
            }
            
        } catch (e) {
            console.error("Checkout failed:", e);
            setError("There was an issue processing your payment. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    if (!user) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
                <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <Card className="w-full max-w-md shadow-lg bg-white dark:bg-gray-800">
                <CardHeader>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="absolute top-4 left-4" 
                        onClick={() => navigate(isVenueBooking ? createPageUrl('VenueDetails') : createPageUrl('Subscriptions'))}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <CardTitle className="text-center pt-8 dark:text-white">
                        {isVenueBooking ? 'Confirm Booking' : 'Confirm Subscription'}
                    </CardTitle>
                    <CardDescription className="text-center dark:text-gray-300">
                        {isVenueBooking 
                            ? 'You are booking a venue reservation.'
                            : 'You are upgrading to AI Concierge Pro.'
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-700">
                        {isVenueBooking ? (
                            <>
                                <div className="text-lg font-semibold dark:text-white mb-2">Venue Booking</div>
                                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                                    <p><strong>Date:</strong> {bookingData.booking_date}</p>
                                    <p><strong>Time:</strong> {bookingData.booking_time}</p>
                                    <p><strong>Duration:</strong> {bookingData.duration} hour(s)</p>
                                </div>
                                <div className="text-lg font-semibold mt-3 dark:text-white">
                                    Total: ${50 + Math.floor(Math.random() * 100)}
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex justify-between items-center text-lg font-semibold dark:text-white">
                                    <span>AI Concierge Pro (Monthly)</span>
                                    <span>$10</span>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Unlimited AI access. Cancel anytime.
                                </p>
                            </>
                        )}
                    </div>

                    <div className="text-center text-sm text-gray-500 dark:text-gray-400 border-t border-b dark:border-gray-600 py-4">
                        <CreditCard className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        Secure payment powered by Stripe
                    </div>
                    
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
                            <AlertTriangle className="w-4 h-4" />
                            <p>{error}</p>
                        </div>
                    )}

                    <Button 
                        onClick={handleProceedToPayment} 
                        disabled={isProcessing} 
                        className="w-full text-lg py-6 bg-emerald-600 hover:bg-emerald-700"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <CreditCard className="w-5 h-5 mr-2" />
                                Proceed to Payment
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}