/** @format */

import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useAuth } from "@/providers/auth-provider";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { currentUser } = useAuth();
  return (
    <div className="min-h-full">
      {currentUser && <Sidebar />}
      <div className="lg:pl-72">
        {currentUser && <Header />}
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
