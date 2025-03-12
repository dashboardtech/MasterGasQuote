import { ReactNode } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex flex-col min-h-screen bg-[#F5F7FA]">
      <Header />
      
      <div className="flex flex-grow overflow-hidden">
        {!isMobile && <Sidebar />}
        <main className="flex-grow overflow-y-auto bg-[#F5F7FA]">
          {children}
        </main>
      </div>
    </div>
  );
}
