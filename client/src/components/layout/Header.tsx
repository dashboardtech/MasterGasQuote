import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  HelpCircle, 
  User, 
  Menu as MenuIcon
} from "lucide-react";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from "@/components/ui/sheet";
import Sidebar from "./Sidebar";

export default function Header() {
  return (
    <header className="bg-primary text-white shadow-md">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6 text-[#FF6B00] mr-3" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M7 16a3 3 0 0 1-.5-6L9 3h6l2.5 7a3 3 0 0 1-.5 6v2a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2z"></path>
            <path d="M12 5v14"></path>
          </svg>
          <h1 className="font-ibm font-bold text-xl">Gas Station Quoting System</h1>
        </div>
        <div className="hidden md:flex items-center space-x-4">
          <Button variant="ghost" className="text-white hover:bg-white/10">
            <HelpCircle className="h-4 w-4 mr-2" />
            Help
          </Button>
          <Button variant="ghost" className="text-white hover:bg-white/10">
            <User className="h-4 w-4 mr-2" />
            Account
          </Button>
        </div>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" className="md:hidden p-2 text-white">
              <MenuIcon className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 bg-white w-[270px]">
            <Sidebar isMobile />
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
