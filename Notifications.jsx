import React, { useState, useEffect, useCallback } from 'react';
import { Notification } from '@/api/entities';
import { User } from '@/api/entities';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    const { toast } = useToast();

    const loadNotifications = useCallback(async (currentUser) => {
        setIsLoading(true);
        try {
            const data = await Notification.filter({ user_email: currentUser.email }, "-created_date");
            setNotifications(data);
        } catch (error) {
            console.error("Failed to load notifications:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);
    
    useEffect(() => {
        User.me().then(userData => {
            setUser(userData);
            loadNotifications(userData);
        }).catch(() => {});
    }, [loadNotifications]);
    
    const handleMarkAsRead = async (id) => {
        try {
            await Notification.update(id, { is_read: true });
            loadNotifications(user);
        } catch (error) {
            toast({ title: "Failed to mark as read", variant: "destructive" });
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
            await Promise.all(unreadIds.map(id => Notification.update(id, { is_read: true })));
            loadNotifications(user);
            toast({ title: "All notifications marked as read" });
        } catch (error) {
            toast({ title: "Failed to mark all as read", variant: "destructive" });
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
                <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 pb-24 lg:pb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl flex items-center justify-center">
                        <Bell className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
                        <p className="text-gray-600 dark:text-gray-400">Stay up to date with your activities.</p>
                    </div>
                </div>
                {notifications.some(n => !n.is_read) && (
                    <Button onClick={handleMarkAllAsRead} variant="outline">
                        <CheckCheck className="mr-2 h-4 w-4" /> Mark All as Read
                    </Button>
                )}
            </div>
            
            <div className="space-y-4">
                {notifications.length === 0 ? (
                    <Card className="text-center p-12">
                        <Bell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">No Notifications</h3>
                        <p className="text-gray-500 dark:text-gray-400">You're all caught up! New notifications will appear here.</p>
                    </Card>
                ) : (
                    notifications.map(notif => (
                        <Card key={notif.id} className={`transition-colors ${notif.is_read ? 'bg-gray-50 dark:bg-gray-800/50' : 'bg-white dark:bg-gray-800'}`}>
                            <CardContent className="p-4 flex items-center justify-between gap-4">
                                <div className="flex items-center space-x-4">
                                    {!notif.is_read && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full flex-shrink-0"></div>}
                                    <div className={notif.is_read ? 'opacity-70' : ''}>
                                        <p className="font-semibold">{notif.title}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">{notif.message}</p>
                                        <p className="text-xs text-gray-400 mt-1">{formatDistanceToNow(new Date(notif.created_date))} ago</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    {notif.link_url && (
                                        <Button asChild variant="secondary" size="sm">
                                            <Link to={notif.link_url}>View</Link>
                                        </Button>
                                    )}
                                    {!notif.is_read && (
                                        <Button onClick={() => handleMarkAsRead(notif.id)} variant="ghost" size="sm">Mark as read</Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}