import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { ScrollToTop } from "@/components/ScrollToTop";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import KIndex from "./pages/KIndex";
import MapPage from "./pages/MapPage";
import AIChat from "./pages/AIChat";
import Analytics from "./pages/Analytics";
import Alerts from "./pages/Alerts";
import Guides from "./pages/Guides";
import DataLayers from "./pages/DataLayers";
import PlantsDatabase from "./pages/PlantsDatabase";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "@/hooks/useAuth";

const queryClient = new QueryClient();

const DashboardLayout = ({ children }: { children: React.ReactNode }) => (
  <SidebarProvider>
    <div className="min-h-screen flex w-full bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <DashboardHeader />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  </SidebarProvider>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/dashboard" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
            <Route path="/k-index" element={<DashboardLayout><KIndex /></DashboardLayout>} />
            <Route path="/map" element={<DashboardLayout><MapPage /></DashboardLayout>} />
            <Route path="/ai-chat" element={<DashboardLayout><AIChat /></DashboardLayout>} />
            <Route path="/notifications" element={<DashboardLayout><Alerts /></DashboardLayout>} />
            <Route path="/analysis" element={<DashboardLayout><Analytics /></DashboardLayout>} />
            <Route path="/guides" element={<DashboardLayout><Guides /></DashboardLayout>} />
            <Route path="/settings" element={<DashboardLayout><Profile /></DashboardLayout>} />
            <Route path="/profile" element={<DashboardLayout><Profile /></DashboardLayout>} />
            <Route path="/data-layers" element={<DashboardLayout><DataLayers /></DashboardLayout>} />
            <Route path="/plants" element={<DashboardLayout><PlantsDatabase /></DashboardLayout>} />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
