import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Home,
  Map,
  Bell,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Leaf,
  Menu,
  BookOpen,
  Activity,
  MessageSquare,
  X
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const navigationItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },

  { title: "Analysis", url: "/analysis", icon: BarChart3 },
  { title: "Map", url: "/map", icon: Map },
  { title: "K-Index", url: "/k-index", icon: Activity },
  { title: "AI Assistant", url: "/ai-chat", icon: MessageSquare },
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Guides", url: "/guides", icon: BookOpen },
  { title: "Profile", url: "/profile", icon: Settings },
];

export function AppSidebar() {
  const { state, open, setOpen, openMobile, setOpenMobile } = useSidebar();
  const location = useLocation();
  const isMobile = useIsMobile();

  const isActive = (path: string) => location.pathname === path;

  // Debug info
  console.log('AppSidebar - state:', state, 'open:', open, 'openMobile:', openMobile, 'isMobile:', isMobile);

  // Handle navigation click to close mobile sidebar
  const handleNavClick = () => {
    if (isMobile) {
      console.log('Navigation clicked, closing mobile sidebar');
      setOpenMobile(false);
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <Sidebar variant="inset" className="hidden md:flex" collapsible="icon">
        <SidebarContent>
          {/* Logo Section */}
          <div className="flex items-center gap-3 p-6 border-b border-sidebar-border">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex-shrink-0">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            {(state === "expanded" || isMobile) && (
              <div className="flex items-center gap-3 flex-1">
                <div>
                  <h1 className="font-bold text-lg text-sidebar-primary-foreground">FarmPlanet</h1>
                  <p className="text-xs text-muted-foreground">Vegetation Monitoring</p>
                </div>
                {!isMobile && (
                  <div className="ml-auto">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-accent/10"
                      onClick={() => setOpen(false)}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}
            {state === "collapsed" && !isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-accent/10 border border-border bg-background"
                onClick={() => setOpen(true)}
              >
                <ChevronRight className="w-4 h-4 text-foreground" />
              </Button>
            )}
          </div>

          <SidebarGroup>
            <SidebarGroupLabel className="text-muted-foreground px-4 py-2">
              {(state === "expanded" || isMobile) && "Navigation"}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        onClick={handleNavClick}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                            ? "bg-primary/10 text-primary border-r-2 border-primary"
                            : "text-muted-foreground hover:bg-accent/10 hover:text-accent"
                          }`
                        }
                      >
                        <item.icon className="w-5 h-5" />
                        {(state === "expanded" || isMobile) && <span className="font-medium">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Spacer */}
          <div className="flex-1"></div>

          {/* Status Indicator */}
          {(state === "expanded" || isMobile) && (
            <div className="p-4 border-t border-sidebar-border">
              <div className="glass-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-foreground">System Status</span>
                </div>
                <p className="text-xs text-muted-foreground">All systems operational</p>
              </div>
            </div>
          )}

          {/* Toggle Button - Always visible at bottom (Desktop only) */}
          {!isMobile && (
            <div className="p-4 border-t border-sidebar-border">
              {state === "expanded" ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-accent/10 border border-border bg-background"
                  onClick={() => setOpen(false)}
                >
                  <ChevronLeft className="w-4 h-4 text-foreground" />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-accent/10 border border-border bg-background"
                  onClick={() => setOpen(true)}
                >
                  <ChevronRight className="w-4 h-4 text-foreground" />
                </Button>
              )}
            </div>
          )}
        </SidebarContent>
      </Sidebar>

      {/* Mobile Sidebar */}
      {isMobile && (
        <div className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ${openMobile ? 'opacity-100 visible' : 'opacity-0 invisible'
          }`}>
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpenMobile(false)}
          />

          {/* Sidebar */}
          <div className={`absolute left-0 top-0 h-full w-80 bg-background border-r border-border transform transition-transform duration-300 ${openMobile ? 'translate-x-0' : '-translate-x-full'
            }`}>
            <SidebarContent>
              {/* Logo Section */}
              <div className="flex items-center gap-3 p-6 border-b border-sidebar-border">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex-shrink-0">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-3 flex-1">
                  <div>
                    <h1 className="font-bold text-lg text-sidebar-primary-foreground">FarmPlanet</h1>
                    <p className="text-xs text-muted-foreground">Vegetation Monitoring</p>
                  </div>
                  <div className="ml-auto">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-accent/10"
                      onClick={() => setOpenMobile(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <SidebarGroup>
                <SidebarGroupLabel className="text-muted-foreground px-4 py-2">
                  Navigation
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {navigationItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <NavLink
                            to={item.url}
                            onClick={handleNavClick}
                            className={({ isActive }) =>
                              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                                ? "bg-primary/10 text-primary border-r-2 border-primary"
                                : "text-muted-foreground hover:bg-accent/10 hover:text-accent"
                              }`
                            }
                          >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.title}</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              {/* Spacer */}
              <div className="flex-1"></div>

              {/* Status Indicator */}
              <div className="p-4 border-t border-sidebar-border">
                <div className="glass-card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-foreground">System Status</span>
                  </div>
                  <p className="text-xs text-muted-foreground">All systems operational</p>
                </div>
              </div>
            </SidebarContent>
          </div>
        </div>
      )}
    </>
  );
}