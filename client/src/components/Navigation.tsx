import { useLocation } from "wouter";
import { Heart, Flame, MessageCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { path: '/feed', icon: Flame, label: 'Discover' },
  { path: '/matches', icon: Heart, label: 'Matches' },
  { path: '/chat', icon: MessageCircle, label: 'Chat' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export default function Navigation() {
  const [location, setLocation] = useLocation();

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-card border-b border-border z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Heart className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold text-primary">PicknMat</h1>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path || location.startsWith(item.path);
                
                return (
                  <Button
                    key={item.path}
                    variant="ghost"
                    onClick={() => setLocation(item.path)}
                    className={cn(
                      "flex items-center space-x-2 text-sm font-medium transition-colors",
                      isActive 
                        ? "text-primary" 
                        : "text-muted-foreground hover:text-primary"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border md:hidden z-40">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path || location.startsWith(item.path);
            
            return (
              <Button
                key={item.path}
                variant="ghost"
                onClick={() => setLocation(item.path)}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-colors",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground"
                )}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
                {item.path === '/chat' && (
                  <span className="absolute top-2 right-8 w-5 h-5 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
                    3
                  </span>
                )}
              </Button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
