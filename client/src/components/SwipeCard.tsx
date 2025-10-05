import { useState, useRef } from "react";
import { User } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { MapPin, Briefcase } from "lucide-react";

interface SwipeCardProps {
  user: User;
  onLike: () => void;
  onSkip: () => void;
  onNext: () => void;
}

export default function SwipeCard({ user, onLike, onSkip, onNext }: SwipeCardProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const photos = user.photos || [];
  const currentPhoto = photos[currentPhotoIndex] || '/api/placeholder/400/600';

  const handlePhotoClick = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const cardWidth = rect.width;
    
    if (clickX < cardWidth / 2 && currentPhotoIndex > 0) {
      setCurrentPhotoIndex(prev => prev - 1);
    } else if (clickX >= cardWidth / 2 && currentPhotoIndex < photos.length - 1) {
      setCurrentPhotoIndex(prev => prev + 1);
    }
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    setIsDragging(true);
    const startX = event.clientX;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDragging) return;
      const currentX = moveEvent.clientX;
      const offset = currentX - startX;
      setDragOffset(offset);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      if (Math.abs(dragOffset) > 100) {
        if (dragOffset > 0) {
          onLike();
        } else {
          onSkip();
        }
      }
      
      setDragOffset(0);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const cardStyle = {
    transform: `translateX(${dragOffset}px) rotate(${dragOffset * 0.1}deg)`,
    opacity: 1 - Math.abs(dragOffset) / 300,
  };

  return (
    <Card
      ref={cardRef}
      className="absolute inset-0 rounded-3xl shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing transition-transform duration-300 hover:scale-[1.02]"
      style={cardStyle}
      onMouseDown={handleMouseDown}
      data-testid={`swipe-card-${user.id}`}
    >
      <div
        className="w-full h-full relative"
        onClick={handlePhotoClick}
      >
        <img
          src={currentPhoto}
          alt={`${user.name}'s photo`}
          className="w-full h-full object-cover"
          draggable={false}
        />
        
        {/* Photo Indicators */}
        {photos.length > 1 && (
          <div className="absolute top-4 left-0 right-0 flex justify-center space-x-2 px-4">
            {photos.map((_, index) => (
              <div
                key={index}
                className={`flex-1 h-1 rounded-full transition-opacity ${
                  index === currentPhotoIndex
                    ? 'bg-white opacity-100'
                    : 'bg-white opacity-40'
                }`}
              />
            ))}
          </div>
        )}

        {/* Swipe Indicators */}
        {dragOffset !== 0 && (
          <div
            className={`absolute inset-0 flex items-center justify-center text-6xl font-bold ${
              dragOffset > 0
                ? 'text-green-500 bg-green-500 bg-opacity-20'
                : 'text-red-500 bg-red-500 bg-opacity-20'
            }`}
          >
            {dragOffset > 0 ? 'LIKE' : 'PASS'}
          </div>
        )}

        {/* Profile Info Overlay */}
        <div 
          className="absolute bottom-0 left-0 right-0 p-6 text-white"
          style={{
            background: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.8) 100%)"
          }}
        >
          <div className="flex items-end justify-between mb-3">
            <div>
              <h3 className="text-3xl font-bold" data-testid={`text-user-name-${user.id}`}>
                {user.name}
              </h3>
              <p className="text-lg opacity-90" data-testid={`text-user-age-${user.id}`}>
                {user.age}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-sm opacity-90">
            <div className="flex items-center space-x-1">
              <MapPin className="w-4 h-4" />
              <span>2 km away</span>
            </div>
            <div className="flex items-center space-x-1">
              <Briefcase className="w-4 h-4" />
              <span>Designer</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
