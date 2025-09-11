
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Group } from '@/api/entities';
import { User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users2, Mail, Plus, LogOut, ArrowLeft } from 'lucide-react';

export default function GroupDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const groupId = new URLSearchParams(location.search).get('id');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    if (!groupId) {
      navigate(createPageUrl('Groups'));
      return;
    }
    try {
      const userData = await User.me();
      setUser(userData);

      const groupData = await Group.get(groupId);
      setGroup(groupData);

      if (groupData.members && groupData.members.length > 0) {
        const memberData = await User.filter({ email: { $in: groupData.members } });
        setMembers(memberData);
      }
    } catch (e) {
      console.error("Failed to load group data", e);
      navigate(createPageUrl('Groups'));
    } finally {
      setIsLoading(false);
    }
  }, [groupId, navigate, setUser, setGroup, setMembers]); // Added setUser, setGroup, setMembers to dependencies for completeness, though React guarantees setters stability.

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleJoinLeave = async () => {
    const isMember = group.members.includes(user.email);
    const newMembers = isMember
        ? group.members.filter(email => email !== user.email)
        : [...group.members, user.email];

    try {
        await Group.update(group.id, { members: newMembers });
        await loadData(); // Reload all data to ensure consistency
    } catch(e) {
        console.error("Failed to update membership", e);
    }
  };

  if (isLoading || !group) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  const isUserMember = group.members.includes(user.email);

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 pb-24 lg:pb-8">
        <div className="max-w-7xl mx-auto">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Button variant="ghost" onClick={() => navigate(createPageUrl('Groups'))} className="mb-4">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to All Groups
                </Button>
            </motion.div>

            <div className="relative h-48 md:h-64 rounded-2xl overflow-hidden mb-[-4rem]">
                 {group.group_image ? (
                    <img src={group.group_image} alt={group.name} className="w-full h-full object-cover"/>
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-emerald-500 to-green-500"></div>
                )}
                 <div className="absolute inset-0 bg-black/30"></div>
            </div>

            <div className="relative px-4 md:px-8">
                <Card>
                    <CardHeader className="pb-4">
                        <div className="flex flex-col md:flex-row justify-between items-start">
                             <div>
                                <Badge className="capitalize mb-2">{group.sport}</Badge>
                                <CardTitle className="text-3xl font-bold">{group.name}</CardTitle>
                                <CardDescription>{group.description}</CardDescription>
                            </div>
                             <Button onClick={handleJoinLeave}>
                                {isUserMember ? <><LogOut className="w-4 h-4 mr-2"/>Leave Group</> : <><Plus className="w-4 h-4 mr-2"/>Join Group</>}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <h3 className="font-bold text-lg mb-4 flex items-center">
                            <Users2 className="w-5 h-5 mr-2" /> Members ({members.length})
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {members.map(member => (
                                <div key={member.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <Avatar>
                                        <AvatarImage src={member.profile_image} />
                                        <AvatarFallback>{member.full_name?.charAt(0) || 'U'}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold text-sm truncate">{member.full_name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{member.email}</p>
                                    </div>
                                </div>
                            ))}
                             {!isUserMember && (
                                <div className="flex flex-col items-center justify-center p-3 border-2 border-dashed rounded-lg text-center">
                                    <p className="text-sm font-medium">You are not a member yet.</p>
                                    <Button size="sm" className="mt-2" onClick={handleJoinLeave}>Join Group</Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
