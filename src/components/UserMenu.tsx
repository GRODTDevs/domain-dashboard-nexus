
import { useAuth } from "@/contexts/AuthContext";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOutIcon, UserIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

export const UserMenu = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Check if sidebar is collapsed by looking for the class
  useEffect(() => {
    const checkSidebarState = () => {
      const sidebarEl = document.querySelector(".sidebar");
      if (sidebarEl) {
        setIsCollapsed(sidebarEl.classList.contains("collapsed") || window.innerWidth < 768);
      }
    };
    
    // Initial check
    checkSidebarState();
    
    // Add a mutation observer to detect changes in the sidebar class
    const observer = new MutationObserver(checkSidebarState);
    const sidebarEl = document.querySelector(".sidebar");
    
    if (sidebarEl) {
      observer.observe(sidebarEl, { attributes: true, attributeFilter: ["class"] });
    }
    
    // Also listen for window resize events
    window.addEventListener("resize", checkSidebarState);
    
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", checkSidebarState);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) return null;

  return (
    <div className="border-t border-sidebar-border pt-4 mt-auto">
      {!isCollapsed && !isMobile ? (
        // Full UserMenu when sidebar is expanded
        <>
          <div className="flex items-center gap-3 px-3 py-2">
            <Avatar className="h-9 w-9 border border-sidebar-border">
              <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <div className="truncate text-sm font-medium text-sidebar-foreground">
                {user.name}
              </div>
              <div className="truncate text-xs text-sidebar-foreground/70">
                {user.email}
              </div>
            </div>
          </div>
          <div className="px-3 pt-2 pb-4">
            <Button 
              variant="outline"
              size="sm"
              className="w-full justify-start bg-sidebar-accent hover:bg-sidebar-accent/80 text-sidebar-foreground border-sidebar-border"
              onClick={handleLogout}
            >
              <LogOutIcon className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </>
      ) : (
        // Simplified UserMenu when sidebar is collapsed
        <div className="flex flex-col items-center justify-center py-4">
          <Avatar className="h-9 w-9 border border-sidebar-border mb-2">
            <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </Avatar>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOutIcon className="h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  );
};
