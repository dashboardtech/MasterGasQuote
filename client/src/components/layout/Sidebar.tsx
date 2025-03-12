import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Plus,
  FileText,
  Settings,
  Layers,
  BarChart2,
  Building
} from "lucide-react";
import type { ComponentType } from "react";

interface SidebarProps {
  isMobile?: boolean;
}

export default function Sidebar({ isMobile }: SidebarProps) {
  const [location] = useLocation();
  
  // Mock data for recent quotes - these will come from backend in a real app
  const recentQuotes = [
    { id: 1, name: "San Diego Highway #42", date: "Today" },
    { id: 2, name: "Madison Avenue Station", date: "Yesterday" },
    { id: 3, name: "Route 66 Express", date: "3 days ago" }
  ];

  const navItems = [
    { 
      icon: FileText, 
      label: "All Quotes", 
      href: "/quotes" 
    },
    { 
      icon: Layers, 
      label: "Component Library", 
      href: "/components" 
    },
    { 
      icon: Building, 
      label: "Construction Divisions", 
      href: "/construction" 
    },
    { 
      icon: BarChart2, 
      label: "Reports", 
      href: "/reports" 
    },
    { 
      icon: Settings, 
      label: "Settings", 
      href: "/settings" 
    }
  ];

  return (
    <aside className={cn(
      "bg-white shadow-md w-64 flex-shrink-0 overflow-y-auto",
      isMobile ? "" : "hidden lg:block"
    )}>
      <div className="p-6">
        <div className="mb-6">
          <h3 className="font-ibm font-medium text-lg text-primary mb-3">Quotes</h3>
          <Link href="/quotes/new">
            <Button className="w-full bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
              <Plus className="h-4 w-4 mr-2" /> New Quote
            </Button>
          </Link>
        </div>
        
        <div className="space-y-1 mb-6">
          <h4 className="font-ibm text-sm uppercase text-[#718096] mb-2">Recent Quotes</h4>
          {recentQuotes.map((quote) => (
            <Link key={quote.id} href={`/quotes/${quote.id}`}>
              <div 
                className={cn(
                  "px-3 py-2 rounded flex items-center justify-between cursor-pointer",
                  location === `/quotes/${quote.id}` 
                    ? "bg-[#003366]/10 border-l-4 border-primary"
                    : "hover:bg-[#F5F7FA]"
                )}
              >
                <span>{quote.name}</span>
                <span className="text-xs text-[#718096]">{quote.date}</span>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="border-t border-[#E2E8F0] pt-4">
          <h4 className="font-ibm text-sm uppercase text-[#718096] mb-2">Navigation</h4>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavItem 
                key={item.href}
                icon={item.icon}
                href={item.href}
                active={location === item.href}
              >
                {item.label}
              </NavItem>
            ))}
          </nav>
        </div>
      </div>
    </aside>
  );
}

interface NavItemProps {
  icon: ComponentType<{ className?: string }>;
  href: string;
  active?: boolean;
  children: React.ReactNode;
}

function NavItem({ icon: Icon, href, active, children }: NavItemProps) {
  return (
    <Link href={href}>
      <div 
        className={cn(
          "block px-3 py-2 rounded flex items-center cursor-pointer",
          active ? "bg-[#F5F7FA]" : "hover:bg-[#F5F7FA]"
        )}
      >
        <Icon className="w-5 h-5 text-primary mr-2" />
        <span>{children}</span>
      </div>
    </Link>
  );
}
