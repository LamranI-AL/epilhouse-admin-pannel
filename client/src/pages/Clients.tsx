/** @format */

import { Card, CardContent } from "@/components/ui/card";
import UserList from "@/components/users/UserList";

export default function Clients() {
  return (
    <div className="space-y-8">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Gestion des Clients
          </h2>
        </div>
      </div>

      <Card>
        <UserList />
      </Card>
    </div>
  );
}
