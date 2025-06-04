/** @format */

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, Trash2, Download } from "lucide-react";
import { BookingWithDetails } from "@/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface BookingsTableProps {
  bookings: BookingWithDetails[];
  onEdit: (booking: BookingWithDetails) => void;
  onDelete: (id: number) => void;
  onExport: () => void;
}

const getStatusColor = (status: string) => {
  const statusMap: Record<string, string> = {
    confirmed: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    completed: "bg-blue-100 text-blue-800",
    cancelled: "bg-red-100 text-red-800",
  };
  return statusMap[status] || "bg-gray-100 text-gray-800";
};

const getStatusLabel = (status: string) => {
  const statusMap: Record<string, string> = {
    confirmed: "Confirmé",
    pending: "En attente",
    completed: "Terminé",
    cancelled: "Annulé",
  };
  return statusMap[status] || status;
};

const getServiceColor = (serviceName: string) => {
  if (serviceName.includes("1 Zone")) return "bg-blue-100 text-blue-800";
  if (serviceName.includes("2 Zones")) return "bg-green-100 text-green-800";
  if (serviceName.includes("3 Zones")) return "bg-purple-100 text-purple-800";
  if (serviceName.includes("Full Body")) return "bg-red-100 text-red-800";
  return "bg-gray-100 text-gray-800";
};

const calculateTimeLeft = (startTime: string) => {
  const now = new Date();
  const appointmentTime = new Date(startTime);
  const diffMs = appointmentTime.getTime() - now.getTime();

  if (diffMs < 0) return "Passé";

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days} jour${days > 1 ? "s" : ""}`;
  if (hours > 0) return `${hours}h ${minutes}min`;
  return `${minutes}min`;
};

export function BookingsTable({
  bookings,
  onEdit,
  onDelete,
  onExport,
}: BookingsTableProps) {
  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">Aucun rendez-vous trouvé.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-gray-200">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>IDENTIFIANT</TableHead>
                <TableHead>SERVICE</TableHead>
                <TableHead>DATE/HEURE</TableHead>
                <TableHead>TIME LEFT</TableHead>
                {/* <TableHead>AGENT</TableHead> */}
                <TableHead>CLIENT</TableHead>
                {/* <TableHead>LOCATION</TableHead> */}
                <TableHead>STATUT</TableHead>
                {/* <TableHead>ACTIONS</TableHead> */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">
                    #BK{booking.id.toString().padStart(3, "0")}
                  </TableCell>
                  <TableCell>
                    <Badge className={getServiceColor(booking.service.name)}>
                      {booking.service.name}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      {format(new Date(booking.startTime), "dd MMM yyyy", {
                        locale: fr,
                      })}
                    </div>
                    <div className="text-sm text-gray-500">
                      {format(new Date(booking.startTime), "HH:mm", {
                        locale: fr,
                      })}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-green-600">
                    {calculateTimeLeft(booking.startTime)}
                  </TableCell>
                  {/* <TableCell>
                    {booking.agent.displayName ||
                      `${booking.agent.firstName} ${booking.agent.lastName}`}
                  </TableCell> */}
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {booking.client.firstName} {booking.client.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.client.email}
                      </div>
                    </div>
                  </TableCell>
                  {/* <TableCell>{booking.}</TableCell> */}
                  <TableCell>
                    <Badge className={getStatusColor(booking.status)}>
                      {getStatusLabel(booking.status)}
                    </Badge>
                  </TableCell>
                  {/* <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(booking)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(booking.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell> */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
