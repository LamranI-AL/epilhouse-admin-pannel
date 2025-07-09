/** @format */

import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout/Layout";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Calendar from "@/pages/Calendar";
import Bookings from "@/pages/Bookings";
import Orders from "@/pages/Orders";
import Payments from "@/pages/Payments";
import Clients from "@/pages/Clients";
import Services from "@/pages/Services";
import Agents from "@/pages/Agents";
import Locations from "@/pages/Locations";
import Coupons from "@/pages/Coupons";
import AuthProvider from "./providers/auth-provider";
import Login from "./pages/login";
import DashboardAdmin from "./pages/DashboardAdmin";
import BookingActivityJournal from "./pages/Archive";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route
          path="/"
          component={Dashboard}
        />
        <Route
          path="/calendar"
          component={Calendar}
        />
        <Route
          path="/bookings"
          component={Bookings}
        />
        <Route
          path="/orders"
          component={Orders}
        />
        <Route
          path="/payments"
          component={Payments}
        />
        <Route
          path="/clients"
          component={Clients}
        />
        <Route
          path="/services"
          component={Services}
        />
        <Route
          path="/agents"
          component={Agents}
        />
        <Route
          path="/locations"
          component={Locations}
        />
        <Route
          path="/coupons"
          component={Coupons}
        />
        <Route
          path="/settings"
          component={() => (
            <div className="p-8 text-center text-gray-500">
              Page en cours de développement
            </div>
          )}
        />
        <Route
          path="/automation"
          component={() => (
            <div className="p-8 text-center text-gray-500">
              Page en cours de développement
            </div>
          )}
        />
        <Route
          path="/integrations"
          component={() => (
            <div className="p-8 text-center text-gray-500">
              Page en cours de développement
            </div>
          )}
        />
        <Route
          path="/form-fields"
          component={() => (
            <div className="p-8 text-center text-gray-500">
              Page en cours de développement
            </div>
          )}
        />
        <Route
          path="/add-ons"
          component={() => (
            <div className="p-8 text-center text-gray-500">
              Page en cours de développement
            </div>
          )}
        />
        <Route
          path="/login"
          component={Login}
        />
        <Route
          path="/dashboard"
          component={DashboardAdmin}
        />
        <Route
          path="/Archive"
          component={BookingActivityJournal}
        />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
