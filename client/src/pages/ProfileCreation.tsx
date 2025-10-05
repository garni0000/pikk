import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileCreationSchema, type ProfileCreation } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Camera, Plus, X, User } from "lucide-react";
import { useLocation } from "wouter";

export default function ProfileCreation() {
  const [photos, setPhotos] = useState<string[]>([]);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ProfileCreation>({
    resolver: zodResolver(profileCreationSchema),
    defaultValues: {
      name: "",
      age: 18,
      gender: "female",
      preference: "male",
      photos: [],
      bio: "",
    },
  });

  const createProfileMutation = useMutation({
    mutationFn: async (data: ProfileCreation) => {
      const response = await apiRequest('POST', '/api/profile', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile created!",
        description: "Your profile has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      setLocation('/feed');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && photos.length < 3) {
      // In a real app, upload to Firebase Storage and get URL
      const url = URL.createObjectURL(file);
      const newPhotos = [...photos, url];
      setPhotos(newPhotos);
      form.setValue('photos', newPhotos);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    form.setValue('photos', newPhotos);
  };

  const onSubmit = (data: ProfileCreation) => {
    createProfileMutation.mutate({ ...data, photos });
  };

  return (
    <div className="min-h-screen p-4 pt-20 pb-24">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Create Your Profile</h2>
          <p className="text-muted-foreground">Tell us about yourself to get started</p>
        </div>

        <Card className="shadow-lg">
          <CardContent className="p-6 md:p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Photo Upload Section */}
                <div>
                  <Label className="block text-sm font-semibold text-foreground mb-4">
                    Your Photos (Max 3)
                  </Label>
                  <div className="grid grid-cols-3 gap-4">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative aspect-square bg-muted rounded-xl overflow-hidden group">
                        <img 
                          src={photo} 
                          alt={`Profile photo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity flex items-center justify-center">
                          <Camera className="text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute top-2 right-2 w-8 h-8 bg-destructive rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    ))}
                    
                    {photos.length < 3 && (
                      <label className="relative aspect-square bg-muted rounded-xl overflow-hidden border-2 border-dashed border-border hover:border-primary transition-colors cursor-pointer group">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                          data-testid="input-photo-upload"
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                          <Plus className="w-8 h-8 mb-2" />
                          <span className="text-xs">Add Photo</span>
                        </div>
                      </label>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">Upload at least one photo to continue</p>
                </div>

                {/* Name Input */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-foreground">Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your name"
                          data-testid="input-name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Age Input */}
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-foreground">Age</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="18"
                          max="100"
                          placeholder="Enter your age"
                          data-testid="input-age"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Gender Selection */}
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-foreground mb-3">Gender</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-3 gap-3"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="male" id="gender-male" className="peer sr-only" />
                            <Label
                              htmlFor="gender-male"
                              className="p-4 bg-background border-2 border-input rounded-xl text-center peer-checked:border-primary peer-checked:bg-accent transition-all cursor-pointer flex flex-col items-center"
                            >
                              <User className="w-6 h-6 mb-2 text-muted-foreground peer-checked:text-primary" />
                              <span className="text-sm font-medium">Male</span>
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="female" id="gender-female" className="peer sr-only" />
                            <Label
                              htmlFor="gender-female"
                              className="p-4 bg-background border-2 border-input rounded-xl text-center peer-checked:border-primary peer-checked:bg-accent transition-all cursor-pointer flex flex-col items-center"
                            >
                              <User className="w-6 h-6 mb-2 text-muted-foreground peer-checked:text-primary" />
                              <span className="text-sm font-medium">Female</span>
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="other" id="gender-other" className="peer sr-only" />
                            <Label
                              htmlFor="gender-other"
                              className="p-4 bg-background border-2 border-input rounded-xl text-center peer-checked:border-primary peer-checked:bg-accent transition-all cursor-pointer flex flex-col items-center"
                            >
                              <div className="w-6 h-6 mb-2 rounded-full bg-muted-foreground peer-checked:bg-primary"></div>
                              <span className="text-sm font-medium">Other</span>
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Preference Selection */}
                <FormField
                  control={form.control}
                  name="preference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-foreground mb-3">Show me</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-3 gap-3"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="male" id="pref-male" className="peer sr-only" />
                            <Label
                              htmlFor="pref-male"
                              className="p-4 bg-background border-2 border-input rounded-xl text-center peer-checked:border-primary peer-checked:bg-accent transition-all cursor-pointer flex flex-col items-center"
                            >
                              <User className="w-6 h-6 mb-2 text-muted-foreground peer-checked:text-primary" />
                              <span className="text-sm font-medium">Men</span>
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="female" id="pref-female" className="peer sr-only" />
                            <Label
                              htmlFor="pref-female"
                              className="p-4 bg-background border-2 border-input rounded-xl text-center peer-checked:border-primary peer-checked:bg-accent transition-all cursor-pointer flex flex-col items-center"
                            >
                              <User className="w-6 h-6 mb-2 text-muted-foreground peer-checked:text-primary" />
                              <span className="text-sm font-medium">Women</span>
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="other" id="pref-other" className="peer sr-only" />
                            <Label
                              htmlFor="pref-other"
                              className="p-4 bg-background border-2 border-input rounded-xl text-center peer-checked:border-primary peer-checked:bg-accent transition-all cursor-pointer flex flex-col items-center"
                            >
                              <div className="w-6 h-6 mb-2 rounded-full bg-muted-foreground peer-checked:bg-primary"></div>
                              <span className="text-sm font-medium">Everyone</span>
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-secondary font-semibold py-4"
                  disabled={createProfileMutation.isPending}
                  data-testid="button-create-profile"
                >
                  {createProfileMutation.isPending ? "Creating..." : "Continue"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
