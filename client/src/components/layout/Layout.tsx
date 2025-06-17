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
    <div>
      {currentUser ? (
        <div className="min-h-full">
          <Sidebar />
          <div className="lg:pl-72">
            <Header />
            <main className="py-10">
              <div className="px-4 sm:px-6 lg:px-8">{children}</div>
            </main>
          </div>
        </div>
      ) : (
        <div className="min-h-full">
          <div className="px-4 sm:px-6 lg:px-8">{children}</div>
        </div>
      )}
    </div>
  );
}
