import { useQuery } from "@tanstack/react-query";
import { Match, User } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MatchWithUsers extends Match {
  user1: User;
  user2: User;
}

export default function Matches() {
  const { user: currentUser } = useAuth();
  const [, setLocation] = useLocation();

  const { data: matchesData, isLoading } = useQuery({
    queryKey: ['/api/matches'],
    enabled: !!currentUser,
  });

  const matches: MatchWithUsers[] = matchesData?.matches || [];

  const getMatchedUser = (match: MatchWithUsers): User => {
    return match.user1.id === currentUser?.id ? match.user2 : match.user1;
  };

  const handleChatClick = (match: MatchWithUsers) => {
    setLocation(`/chat/${match.id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 pt-20 pb-24">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">Your Matches</h2>
          <p className="text-muted-foreground">People who liked you back</p>
        </div>

        {matches.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-muted rounded-full mb-6">
              <Heart className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2" data-testid="text-no-matches">
              No matches yet
            </h3>
            <p className="text-muted-foreground mb-6">Keep swiping to find your perfect match!</p>
            <Button 
              onClick={() => setLocation('/feed')}
              className="bg-primary text-primary-foreground font-semibold px-8 py-3"
              data-testid="button-start-swiping"
            >
              Start Swiping
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {matches.map((match) => {
              const matchedUser = getMatchedUser(match);
              const photoUrl = matchedUser.photos?.[0];

              return (
                <Card
                  key={match.id}
                  className="group cursor-pointer hover:shadow-lg transition-all duration-300"
                  onClick={() => handleChatClick(match)}
                  data-testid={`card-match-${match.id}`}
                >
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden">
                    <img
                      src={photoUrl || '/api/placeholder/600/800'}
                      alt={`${matchedUser.name}'s profile`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div 
                      className="absolute bottom-0 left-0 right-0 p-4"
                      style={{
                        background: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.7) 100%)"
                      }}
                    >
                      <h3 className="text-white font-semibold text-lg" data-testid={`text-match-name-${match.id}`}>
                        {matchedUser.name}
                      </h3>
                      <p className="text-white text-sm opacity-90" data-testid={`text-match-age-${match.id}`}>
                        {matchedUser.age}
                      </p>
                    </div>
                    <div className="absolute top-3 right-3 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
