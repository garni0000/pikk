import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Edit, Camera, Plus, Shield, Bell, HelpCircle, LogOut } from "lucide-react";

export default function Profile() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const { data: profileData, isLoading } = useQuery<{ user: typeof user }>({
    queryKey: ['/api/profile'],
    enabled: !!user,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/profile', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile updated!",
        description: "Your profile has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      setIsEditing(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSignOut = async () => {
    await signOut();
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentUser = profileData?.user || user;

  return (
    <div className="min-h-screen p-4 pt-20 pb-24">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-1">My Profile</h2>
            <p className="text-muted-foreground">Manage your profile information</p>
          </div>
          <Button
            onClick={toggleEditMode}
            variant="outline"
            className="text-primary border-primary hover:bg-primary hover:text-white"
            data-testid="button-edit-profile"
          >
            <Edit className="w-4 h-4 mr-2" />
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Photo Gallery */}
          <div className="md:col-span-1">
            <h3 className="text-sm font-semibold text-foreground mb-4">Your Photos</h3>
            <div className="space-y-3">
              <div className="relative aspect-square rounded-2xl overflow-hidden group">
                <img
                  src={(currentUser?.photos as string[])?.[0] || '/api/placeholder/600/600'}
                  alt="Profile photo 1"
                  className="w-full h-full object-cover"
                />
                {isEditing && (
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity flex items-center justify-center">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Change Photo
                    </Button>
                  </div>
                )}
                <div className="absolute top-3 left-3 bg-primary text-white text-xs font-semibold px-2 py-1 rounded-full">
                  Main
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="relative aspect-square rounded-xl overflow-hidden group">
                  <img
                    src={(currentUser?.photos as string[])?.[1] || '/api/placeholder/400/400'}
                    alt="Profile photo 2"
                    className="w-full h-full object-cover"
                  />
                  {isEditing && (
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity flex items-center justify-center">
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Edit className="w-5 h-5 text-white" />
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="relative aspect-square rounded-xl overflow-hidden border-2 border-dashed border-border hover:border-primary transition-colors cursor-pointer group">
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                    <Plus className="w-6 h-6 mb-1" />
                    <span className="text-xs">Add Photo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="md:col-span-2 space-y-6">
            {/* Basic Info Card */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Basic Information</h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground mb-2">Name</Label>
                    <Input
                      value={currentUser?.name || ''}
                      disabled={!isEditing}
                      data-testid="input-profile-name"
                      className={!isEditing ? 'bg-muted' : ''}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground mb-2">Age</Label>
                      <Input
                        type="number"
                        value={currentUser?.age || ''}
                        disabled={!isEditing}
                        data-testid="input-profile-age"
                        className={!isEditing ? 'bg-muted' : ''}
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground mb-2">Gender</Label>
                      <Select disabled={!isEditing} value={currentUser?.gender}>
                        <SelectTrigger className={!isEditing ? 'bg-muted' : ''}>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preferences Card */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Preferences</h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground mb-3">Show me</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {['male', 'female', 'other'].map((pref) => (
                        <div
                          key={pref}
                          className={`p-3 bg-background border-2 rounded-xl text-center transition-all ${
                            currentUser?.preference === pref
                              ? 'border-primary bg-accent text-primary'
                              : 'border-input text-muted-foreground'
                          }`}
                        >
                          <div className="text-lg mb-1">
                            {pref === 'male' ? '♂' : pref === 'female' ? '♀' : '⚧'}
                          </div>
                          <p className="text-xs font-medium capitalize">{pref === 'other' ? 'Everyone' : pref}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground mb-3">Distance Range</Label>
                    <div className="px-2">
                      <Slider
                        value={[50]}
                        max={100}
                        step={1}
                        disabled={!isEditing}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-2">
                        <span>1 km</span>
                        <span className="font-semibold text-primary">50 km</span>
                        <span>100 km</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground mb-3">Age Range</Label>
                    <div className="flex items-center space-x-4">
                      <Input
                        type="number"
                        value="22"
                        disabled={!isEditing}
                        className={`text-center ${!isEditing ? 'bg-muted' : ''}`}
                      />
                      <span className="text-muted-foreground">to</span>
                      <Input
                        type="number"
                        value="35"
                        disabled={!isEditing}
                        className={`text-center ${!isEditing ? 'bg-muted' : ''}`}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Account</h3>
                <div className="space-y-3">
                  <Button
                    variant="ghost"
                    className="w-full justify-between h-auto p-4 hover:bg-muted"
                  >
                    <div className="flex items-center space-x-3">
                      <Shield className="w-5 h-5 text-muted-foreground" />
                      <span className="text-foreground">Privacy & Safety</span>
                    </div>
                    <span className="text-muted-foreground">→</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    className="w-full justify-between h-auto p-4 hover:bg-muted"
                  >
                    <div className="flex items-center space-x-3">
                      <Bell className="w-5 h-5 text-muted-foreground" />
                      <span className="text-foreground">Notifications</span>
                    </div>
                    <span className="text-muted-foreground">→</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    className="w-full justify-between h-auto p-4 hover:bg-muted"
                  >
                    <div className="flex items-center space-x-3">
                      <HelpCircle className="w-5 h-5 text-muted-foreground" />
                      <span className="text-foreground">Help & Support</span>
                    </div>
                    <span className="text-muted-foreground">→</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    onClick={handleSignOut}
                    className="w-full justify-start h-auto p-4 hover:bg-destructive hover:bg-opacity-10 text-destructive"
                    data-testid="button-sign-out"
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    <span className="font-medium">Sign Out</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
