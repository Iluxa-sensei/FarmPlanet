import { Search, Bell, User, LogOut, Settings as SettingsIcon, MessageSquare, Menu, X } from "lucide-react";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

import { Home, Map as MapIcon, BarChart3, BookOpen, Leaf, Activity, MessageSquare as MessageSquareIcon } from "lucide-react";

const navigationItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "K-Index", url: "/k-index", icon: Activity },
  { title: "Map", url: "/map", icon: MapIcon },
  { title: "AI Assistant", url: "/ai-chat", icon: MessageSquareIcon },
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Analysis", url: "/analysis", icon: BarChart3 },
  { title: "Guides", url: "/guides", icon: BookOpen },
  { title: "Profile", url: "/profile", icon: SettingsIcon },
];

export function DashboardHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, isGuest, signOut } = useAuth();
  const { toggleSidebar, openMobile, setOpenMobile } = useSidebar();
  const [supportDialogOpen, setSupportDialogOpen] = useState(false);
  const [supportMessage, setSupportMessage] = useState("");
  const [supportSubject, setSupportSubject] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [territories, setTerritories] = useState<any[]>([]);

  // Load territories for search
  useEffect(() => {
    const loadTerritories = () => {
      try {
        const saved = localStorage.getItem('territories');
        if (saved) {
          const parsed = JSON.parse(saved);
          setTerritories(parsed);
        }
      } catch (error) {
        console.error('Error loading territories:', error);
      }
    };

    loadTerritories();

    // Listen for storage changes (when territories are updated)
    const handleStorageChange = () => {
      loadTerritories();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);



  const handleSearchEnter = (query: string) => {
    const lowerQuery = query.toLowerCase();

    // Search in territories
    const matchingTerritory = territories.find(territory =>
      territory.name.toLowerCase().includes(lowerQuery) ||
      territory.crop.toLowerCase().includes(lowerQuery)
    );

    if (matchingTerritory) {
      navigate('/map');
      toast({
        title: "Farm Found",
        description: `Navigating to ${matchingTerritory.name}`,
      });
      return;
    }

    // Search in navigation
    const matchingNav = navigationItems.find(item =>
      item.title.toLowerCase().includes(lowerQuery)
    );

    if (matchingNav) {
      navigate(matchingNav.url);
      toast({
        title: "Navigation",
        description: `Going to ${matchingNav.title}`,
      });
      return;
    }

    // Default searches
    if (lowerQuery.includes('weather') || lowerQuery.includes('погода')) {
      navigate('/analysis');
      toast({
        title: "Weather Data",
        description: "Opening weather analytics",
      });
    } else if (lowerQuery.includes('map') || lowerQuery.includes('карта')) {
      navigate('/map');
      toast({
        title: "Map",
        description: "Opening interactive map",
      });
    } else if (lowerQuery.includes('ai') || lowerQuery.includes('chat')) {
      navigate('/ai-chat');
      toast({
        title: "AI Assistant",
        description: "Opening AI chat",
      });
    } else if (lowerQuery.includes('alert') || lowerQuery.includes('уведомления')) {
      navigate('/notifications');
      toast({
        title: "Alerts",
        description: "Opening notifications",
      });
    } else {
      toast({
        title: "Search",
        description: `Searching for "${query}"`,
        variant: "destructive"
      });
    }

    setSearchValue("");
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message sent!",
      description: "We'll get back to you as soon as possible.",
    });
    setSupportMessage("");
    setSupportSubject("");
    setSupportDialogOpen(false);
  };

  return (
    <header className="sticky top-0 z-[9999] w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Mobile Menu Button + Logo */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-8 w-8"
            onClick={() => {
              console.log('Mobile toggle clicked, current openMobile:', openMobile);
              // Direct toggle of mobile sidebar state
              setOpenMobile(!openMobile);
              console.log('Set openMobile to:', !openMobile);
            }}
          >
            <Menu className="w-5 h-5" />
          </Button>

          {/* Logo for mobile */}
          <div className="flex md:hidden items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg">FarmPlanet</span>
          </div>
        </div>

        {/* Search Section - Hidden on mobile */}
        <div className="hidden md:flex items-center gap-4 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search weather events, farms..."
              className="pl-10 bg-muted/50 border-0 focus:bg-muted/80"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchValue) {
                  handleSearchEnter(searchValue);
                }
              }}
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 z-[10000]">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="p-8 text-center text-muted-foreground">
                <p className="text-sm">No new notifications</p>
                <p className="text-xs mt-2">Check the Alerts page for space weather updates</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/notifications')} className="justify-center">
                <span className="text-sm font-medium text-primary">View All Alerts</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>


          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={isGuest ? undefined : "/avatars/user.jpg"} alt={isGuest ? "Guest" : "User"} />
                  <AvatarFallback className={isGuest ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground"}>
                    {isGuest ? "G" : (user?.name ? user.name.charAt(0).toUpperCase() : "U")}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 z-[10000]" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  {isGuest ? (
                    <>
                      <p className="text-sm font-medium leading-none">Guest User</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        Limited access mode
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium leading-none">
                        {user?.name || 'User'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                      {user?.userType && (
                        <Badge variant="outline" className="w-fit text-xs">
                          {user.userType === 'farmer' && '🌱 Farmer'}
                          {user.userType === 'company' && '🏢 Company'}
                          {user.userType === 'individual' && '👤 Individual'}
                        </Badge>
                      )}
                    </>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <SettingsIcon className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSupportDialogOpen(true)}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Support
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Support Dialog */}
      <Dialog open={supportDialogOpen} onOpenChange={setSupportDialogOpen}>
        <DialogContent className="sm:max-w-[525px] glass-card">
          <form onSubmit={handleSupportSubmit}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Contact Support
              </DialogTitle>
              <DialogDescription>
                Have a question or need help? Send us a message and we'll get back to you as soon as possible.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="What do you need help with?"
                  value={supportSubject}
                  onChange={(e) => setSupportSubject(e.target.value)}
                  className="glass-input"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Describe your issue or question in detail..."
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  className="glass-input min-h-[150px]"
                  required
                />
              </div>
              <div className="text-sm text-muted-foreground">
                <p>💡 Response time: Usually within 24 hours</p>
                <p>📧 Email: support@farmplanet.com</p>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setSupportDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="glow-button">
                <MessageSquare className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </header>
  );
}