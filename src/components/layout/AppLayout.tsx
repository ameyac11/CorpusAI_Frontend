import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { AppSidebar } from './AppSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { OnboardingTour } from '@/components/onboarding/OnboardingTour';

export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [docsSidebarOpen, setDocsSidebarOpen] = useState(false);
  const [wasNavOpen, setWasNavOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Handle the interaction between left nav sidebar and right doc sidebar
  const handleDocsSidebarChange = (open: boolean) => {
    if (open) {
      if (!sidebarCollapsed) {
        setWasNavOpen(true);
        setSidebarCollapsed(true);
      }
    } else {
      if (wasNavOpen) {
        setSidebarCollapsed(false);
        setWasNavOpen(false);
      }
    }
    setDocsSidebarOpen(open);
  };

  const handleNavToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Mobile Hamburger Menu - Only visible below xl breakpoint */}
      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed top-4 left-4 z-50 xl:hidden rounded-full bg-background/80 backdrop-blur-sm border border-border shadow-md"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64 xl:hidden">
          <AppSidebar
            collapsed={false}
            onToggle={() => { }}
            isMobile={true}
            onItemClick={() => setMobileSidebarOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar - Only visible at xl breakpoint and above */}
      <div className="hidden xl:block relative">
        <AppSidebar
          collapsed={sidebarCollapsed}
          onToggle={handleNavToggle}
          isMobile={false}
        />
      </div>

      <main className="flex-1 flex flex-col overflow-hidden">
        {location.pathname === '/chat' ? (
          <Outlet context={{ docsSidebarOpen, setDocsSidebarOpen: handleDocsSidebarChange }} />
        ) : (
          <Outlet />
        )}
      </main>

      <OnboardingTour />
    </div>
  );
}
