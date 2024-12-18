import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Settings,
  Shield,
  Bell,
  Camera,
  Save,
  Zap,
  Star,
  Award,
  Activity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const Profile = () => {
  const { user, isGuest } = useAuth();
  const [profileData, setProfileData] = useState({
    name: isGuest ? '' : (user?.name || ''),
    email: isGuest ? '' : (user?.email || ''),
    location: isGuest ? '' : (user?.country || ''),
    role: isGuest ? '' : (user?.userType || ''),
    joinDate: '2023-01-15'
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    security: true,
    updates: false
  });

  const { toast } = useToast();

  const handleSaveProfile = () => {
    toast({
      title: "Profile updated",
      description: "Your details have been saved",
    });
  };

  const handleSaveSettings = () => {
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-space bg-stars p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="glass-card border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="relative">
                <Avatar className="h-32 w-32 ring-4 ring-primary/20 overflow-hidden">
                  <AvatarImage id="avatar-img" src="/api/placeholder/128/128" alt="Profile" />
                  <AvatarFallback className="text-2xl font-bold bg-gradient-primary text-primary-foreground">
                    AC
                  </AvatarFallback>
                </Avatar>
                <input
                  id="avatar-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      const img = document.getElementById('avatar-img') as HTMLImageElement | null;
                      if (img && typeof reader.result === 'string') {
                        img.src = reader.result;
                      }
                    };
                    reader.readAsDataURL(file);
                  }}
                />
                <Button
                  size="sm"
                  className="absolute -bottom-2 -right-2 rounded-full h-10 w-10 p-0 glow-button"
                  onClick={() => document.getElementById('avatar-input')?.click()}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold gradient-text">
                    {profileData.name}
                  </h1>
                  {isGuest && (
                    <Badge variant="secondary" className="bg-accent/20 text-accent border-accent/30">
                      Guest Mode
                    </Badge>
                  )}
                </div>
                {profileData.role && (
                  <Badge variant="outline" className="mb-4">
                    {profileData.role === 'farmer' && '🌱 Farmer'}
                    {profileData.role === 'company' && '🏢 Agricultural Company'}
                    {profileData.role === 'individual' && '👤 Individual User'}
                  </Badge>
                )}

                {/* Badges and header stats removed per requirements */}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 glass-card">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="glass-card border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Personal information
                </CardTitle>
                <CardDescription>
                  Manage your personal data and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      <User className="w-4 h-4 inline mr-2" />
                      Full name
                    </Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="glass-input"
                      disabled={isGuest}
                      placeholder={isGuest ? "Sign in to edit" : "Enter your name"}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">
                      <Mail className="w-4 h-4 inline mr-2" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="glass-input"
                      disabled={isGuest}
                      placeholder={isGuest ? "Sign in to edit" : "Enter your email"}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">
                      <Shield className="w-4 h-4 inline mr-2" />
                      Role
                    </Label>
                    <Input
                      id="role"
                      value={profileData.role}
                      className="glass-input"
                      disabled={true}
                      placeholder="User role"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">
                      <MapPin className="w-4 h-4 inline mr-2" />
                      Country
                    </Label>
                    <Input
                      id="location"
                      value={profileData.location}
                      className="glass-input"
                      disabled={true}
                      placeholder="Country"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  Member since: {new Date(profileData.joinDate).toLocaleDateString('en-US')}
                </div>

                <Button
                  onClick={handleSaveProfile}
                  className="glow-button"
                  disabled={isGuest}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isGuest ? 'Sign in to save changes' : 'Save changes'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card className="glass-card border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  Notifications
                </CardTitle>
                <CardDescription>
                  Choose how you want to receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Email notifications</div>
                      <div className="text-sm text-muted-foreground">
                        Receive notifications via email
                      </div>
                    </div>
                    <Switch
                      checked={notifications.email}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, email: checked })
                      }
                    />
                  </div>
                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Push notifications</div>
                      <div className="text-sm text-muted-foreground">
                        Receive notifications in the browser
                      </div>
                    </div>
                    <Switch
                      checked={notifications.push}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, push: checked })
                      }
                    />
                  </div>
                </div>

                <Button onClick={handleSaveSettings} className="glow-button">
                  <Save className="w-4 h-4 mr-2" />
                  Save settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security tab removed per requirements */}
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;