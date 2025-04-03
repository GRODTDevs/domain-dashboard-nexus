
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Globe, Home, PlusCircle, Search, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { UserMenu } from "./UserMenu";

export function Sidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  
  const navigationItems = [
    {
      title: "Dashboard",
      icon: Home,
      href: "/dashboard",
    },
    {
      title: "Domains",
      icon: Globe,
      href: "/domains",
    },
    {
      title: "Settings",
      icon: Settings,
      href: "/settings",
    },
  ];

  return (
    <div 
      className={cn(
        "sidebar flex flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out",
        collapsed ? "collapsed w-[70px]" : "w-[250px]"
      )}
    >
      <div className="flex items-center justify-between p-4">
        {!collapsed ? (
          <div className="text-lg font-semibold">
            <img 
              src={localStorage.getItem("logoImage") || ""} 
              alt="Logo" 
              className="h-8 max-w-[180px] object-contain"
            />
          </div>
        ) : null}
        <Button 
          variant="ghost" 
          size="sm" 
          className="ml-auto"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? "→" : "←"}
        </Button>
      </div>
      
      <Separator className="bg-sidebar-border" />
      
      <ScrollArea className="flex-1">
        <div className="p-2">
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "w-full justify-start mb-4 bg-sidebar-accent text-sidebar-accent-foreground",
              collapsed && "justify-center p-2"
            )}
            asChild
          >
            <Link to="/domains/new">
              <PlusCircle className={cn("h-4 w-4", collapsed ? "mr-0" : "mr-2")} />
              {!collapsed && "Add New Domain"}
            </Link>
          </Button>
          
          <nav className="grid gap-1">
            {navigationItems.map((item, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                asChild
                className={cn(
                  "justify-start",
                  collapsed && "justify-center p-2",
                  location.pathname === item.href && "bg-sidebar-accent text-sidebar-accent-foreground"
                )}
              >
                <Link to={item.href}>
                  <item.icon className={cn("h-4 w-4", collapsed ? "mr-0" : "mr-2")} />
                  {!collapsed && item.title}
                </Link>
              </Button>
            ))}
          </nav>
        </div>
      </ScrollArea>
      
      <Separator className="bg-sidebar-border" />
      
      {/* Always show UserMenu, but adapt to collapsed state */}
      <UserMenu />
      
      <div className="p-4">
        {!collapsed && (
          <div className="text-xs text-sidebar-foreground/60">
            Domain Dashboard v1.0
          </div>
        )}
      </div>
    </div>
  );
}
