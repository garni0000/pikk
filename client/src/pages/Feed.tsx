import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { User } from "@shared/schema";
import SwipeCard from "@/components/SwipeCard";
import MatchModal from "@/components/MatchModal";
import { Button } from "@/components/ui/button";
import { Heart, X, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Feed() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matchedUser, setMatchedUser] = useState<User | null>(null);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: feedData, isLoading } = useQuery<{ users: User[] }>({
    queryKey: ['/api/feed'],
    refetchOnMount: true,
  });

  const likeMutation = useMutation({
    mutationFn: async (data: { toUserId: string; action: 'like' | 'skip' }) => {
      const response = await apiRequest('POST', '/api/like', data);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.isMatch && data.match) {
        const currentUser = feedData?.users[currentIndex];
        if (currentUser) {
          setMatchedUser(currentUser);
          setShowMatchModal(true);
        }
      }
      handleNextCard();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to process action. Please try again.",
        variant: "destructive",
      });
    },
  });

  const users = feedData?.users || [];

  const handleNextCard = () => {
    setCurrentIndex(prev => prev + 1);
  };

  const handleLike = () => {
    const currentUser = users[currentIndex];
    if (currentUser) {
      likeMutation.mutate({ toUserId: currentUser.id, action: 'like' });
    }
  };

  const handleSkip = () => {
    const currentUser = users[currentIndex];
    if (currentUser) {
      likeMutation.mutate({ toUserId: currentUser.id, action: 'skip' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!users.length || currentIndex >= users.length) {
    return (
      <div className="min-h-screen p-4 pt-20 pb-24">
        <div className="max-w-md mx-auto text-center py-16">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-muted rounded-full mb-6">
            <Heart className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2" data-testid="text-no-more-users">
            No more users to show
          </h3>
          <p className="text-muted-foreground mb-6">Check back later for new matches!</p>
          <Button 
            onClick={() => {
              setCurrentIndex(0);
              queryClient.invalidateQueries({ queryKey: ['/api/feed'] });
            }}
            className="bg-primary text-primary-foreground font-semibold px-8 py-3"
            data-testid="button-refresh-feed"
          >
            Refresh Feed
          </Button>
        </div>
      </div>
    );
  }

  const currentUser = users[currentIndex];

  return (
    <div className="min-h-screen p-4 pt-20 pb-24">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">Discover</h2>
          <p className="text-muted-foreground">Find your perfect match</p>
        </div>

        <div className="relative" style={{ height: '500px' }}>
          {currentUser && (
            <SwipeCard
              user={currentUser}
              onLike={handleLike}
              onSkip={handleSkip}
              onNext={handleNextCard}
            />
          )}

          {/* Next card preview */}
          {users[currentIndex + 1] && (
            <div 
              className="absolute inset-0 bg-card rounded-3xl shadow-xl overflow-hidden"
              style={{ transform: 'scale(0.95) translateY(10px)', zIndex: -1 }}
            >
              <img 
                src={(users[currentIndex + 1].photos as string[])?.[0] || '/api/placeholder/400/600'} 
                alt="Next profile"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center items-center space-x-6 mt-8">
          <Button
            onClick={handleSkip}
            disabled={likeMutation.isPending}
            className="w-16 h-16 bg-card border-2 border-destructive text-destructive hover:bg-destructive hover:text-white rounded-full shadow-lg hover:shadow-xl transition-all"
            data-testid="button-skip"
          >
            <X className="w-6 h-6" />
          </Button>
          
          <Button
            onClick={handleLike}
            disabled={likeMutation.isPending}
            className="w-20 h-20 bg-primary hover:bg-secondary text-white rounded-full shadow-lg hover:shadow-xl transition-all"
            data-testid="button-like"
          >
            <Heart className="w-8 h-8" />
          </Button>
          
          <Button
            className="w-16 h-16 bg-card border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-full shadow-lg hover:shadow-xl transition-all"
            data-testid="button-super-like"
          >
            <Star className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Match Modal */}
      <MatchModal
        isOpen={showMatchModal}
        matchedUser={matchedUser}
        onClose={() => setShowMatchModal(false)}
        onChat={() => {
          setShowMatchModal(false);
          // Navigate to chat - would need match ID
        }}
      />
    </div>
  );
}
