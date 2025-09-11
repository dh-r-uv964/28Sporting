import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Group } from '@/api/entities';
import { User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Users2, Search, ArrowRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const allSports = ["golf", "tennis", "paddle", "pickleball", "boxing", "basketball", "swimming", "hiking", "fitness", "general"];

export default function Groups() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [publicGroups, setPublicGroups] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const userData = await User.me();
        setUser(userData);
        const allGroups = await Group.list('-created_date');
        setGroups(allGroups);
        
        const userGroups = allGroups.filter(g => g.members.includes(userData.email));
        const otherPublicGroups = allGroups.filter(g => !g.members.includes(userData.email) && g.is_public);
        setMyGroups(userGroups);
        setPublicGroups(otherPublicGroups);

      } catch (e) {
        navigate(createPageUrl('Onboarding'));
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [navigate]);

  const filteredPublicGroups = publicGroups.filter(g => 
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 pb-24 lg:pb-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8"
        >
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-green-600 rounded-xl flex items-center justify-center">
              <Users2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Community Groups</h1>
              <p className="text-gray-600 dark:text-gray-300">Find or create groups with players who share your passion.</p>
            </div>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Group
                </Button>
            </DialogTrigger>
            <CreateGroupDialog user={user} onClose={() => setIsCreateDialogOpen(false)} />
          </Dialog>
        </motion.div>

        {/* My Groups Section */}
        {myGroups.length > 0 && (
            <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Your Groups</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myGroups.map(group => <GroupCard key={group.id} group={group} />)}
                </div>
            </section>
        )}

        {/* Discover Groups Section */}
        <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Discover Public Groups</h2>
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                    placeholder="Search for groups..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12"
                />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPublicGroups.length > 0 ? (
                    filteredPublicGroups.map(group => <GroupCard key={group.id} group={group} />)
                ) : (
                    <p className="text-gray-500 md:col-span-3 text-center">No public groups match your search. Why not create one?</p>
                )}
            </div>
        </section>

      </div>
    </div>
  );
}

const GroupCard = ({ group }) => (
    <motion.div whileHover={{y: -5}}>
        <Link to={createPageUrl(`GroupDetails?id=${group.id}`)}>
            <Card className="h-full overflow-hidden hover:shadow-xl transition-shadow">
                <div className="h-32 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    {group.group_image ? (
                        <img src={group.group_image} alt={group.name} className="w-full h-full object-cover"/>
                    ) : (
                        <Users2 className="w-12 h-12 text-gray-400"/>
                    )}
                </div>
                <CardContent className="p-4">
                    <Badge variant="secondary" className="capitalize mb-2">{group.sport}</Badge>
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white truncate">{group.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{group.description}</p>
                    <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center">
                           <Users2 className="w-4 h-4 mr-1"/> {group.members.length} Members
                        </div>
                        <div className="flex items-center text-emerald-600">
                            View <ArrowRight className="w-4 h-4 ml-1"/>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    </motion.div>
);

const CreateGroupDialog = ({ user, onClose }) => {
    const [formData, setFormData] = useState({
        name: '', description: '', sport: '', is_public: true
    });
    const [isCreating, setIsCreating] = useState(false);
    const navigate = useNavigate();

    const handleCreate = async () => {
        if(!formData.name || !formData.sport) return;
        setIsCreating(true);
        try {
            const newGroup = await Group.create({
                ...formData,
                members: [user.email]
            });
            onClose();
            navigate(createPageUrl(`GroupDetails?id=${newGroup.id}`));
        } catch (e) {
            console.error("Failed to create group", e);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Create a New Group</DialogTitle>
                <DialogDescription>
                    Bring players together. Create a group for your team, friends, or local community.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Group Name</Label>
                    <Input id="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="sport">Primary Sport</Label>
                     <Select value={formData.sport} onValueChange={(value) => setFormData({...formData, sport: value})}>
                        <SelectTrigger id="sport"><SelectValue placeholder="Select a sport" /></SelectTrigger>
                        <SelectContent>
                            {allSports.map(sport => <SelectItem key={sport} value={sport} className="capitalize">{sport}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button onClick={handleCreate} disabled={isCreating}>
                    {isCreating ? "Creating..." : "Create Group"}
                </Button>
            </DialogFooter>
        </DialogContent>
    )
}