import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { AppSidebar } from './AppSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { OnboardingTour } from '@/components/onboarding/OnboardingTour';
import { MobileChatView } from '@/components/mobile/MobileChatView';
import { LoadingScreen } from '@/components/layout/LoadingScreen';

export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [docsSidebarOpen, setDocsSidebarOpen] = useState(false);
  const [wasNavOpen, setWasNavOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1280);
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Detect mobile viewport
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1280);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auth is already resolved by parent (AppWithLoading), but keep as safety net
  if (isLoading) {
    return <LoadingScreen show />;
  }

  // auth gate — redirect to login if session expired or user is unauthenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // collapse left nav when right doc sidebar opens so they don't fight for space
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
      {/* Mobile Chat View - Renders its own UI with built-in header */}
      {isMobile && location.pathname === '/chat' ? (
        <>
          {/* Mobile Sidebar Sheet - triggered by MobileChatView header */}
          <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
            <SheetContent side="left" className="p-0 w-[85vw] max-w-[320px]">
              <AppSidebar
                collapsed={false}
                onToggle={() => { }}
                isMobile={true}
                onItemClick={() => setMobileSidebarOpen(false)}
              />
            </SheetContent>
          </Sheet>

          <MobileChatView onOpenSidebar={() => setMobileSidebarOpen(true)} />
        </>
      ) : (
        <>
          {/* Mobile Hamburger Menu - Only visible below xl breakpoint, hidden on mobile /chat (uses MobileChatView) */}
          {!(isMobile && location.pathname === '/chat') && (
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
          )}

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
        </>
      )}

      <OnboardingTour />
    </div>
  );
}

