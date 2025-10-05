import { User } from "@shared/schema";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

interface MatchModalProps {
  isOpen: boolean;
  matchedUser: User | null;
  onClose: () => void;
  onChat: () => void;
}

export default function MatchModal({ isOpen, matchedUser, onClose, onChat }: MatchModalProps) {
  if (!matchedUser) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full p-8 text-center rounded-3xl" data-testid="match-modal">
        <div className="mb-6">
          <Heart className="w-16 h-16 text-primary animate-bounce mx-auto" />
        </div>
        
        <h2 className="text-3xl font-bold text-foreground mb-3">It's a Match!</h2>
        <p className="text-muted-foreground mb-6">
          You and <span className="font-semibold text-foreground" data-testid="text-matched-user-name">
            {matchedUser.name}
          </span> liked each other
        </p>
        
        <div className="flex justify-center items-center space-x-4 mb-8">
          <div className="relative">
            <img
              src="/api/placeholder/200/200"
              alt="Your photo"
              className="w-24 h-24 rounded-full object-cover border-4 border-primary"
            />
          </div>
          <Heart className="w-8 h-8 text-primary" />
          <div className="relative">
            <img
              src={(matchedUser.photos as string[])?.[0] || '/api/placeholder/200/200'}
              alt={`${matchedUser.name}'s photo`}
              className="w-24 h-24 rounded-full object-cover border-4 border-primary"
            />
          </div>
        </div>

        <div className="space-y-3">
          <Button
            onClick={onChat}
            className="w-full bg-primary hover:bg-secondary font-semibold py-4"
            data-testid="button-send-message"
          >
            Send a Message
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full bg-muted hover:bg-border font-semibold py-4"
            data-testid="button-keep-swiping"
          >
            Keep Swiping
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
