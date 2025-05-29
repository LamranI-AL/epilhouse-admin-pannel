import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface UpcomingBooking {
  id: number;
  clientName: string;
  serviceName: string;
  startTime: string;
  clientImage?: string;
}

interface UpcomingBookingsProps {
  bookings: UpcomingBooking[];
}

export function UpcomingBookings({ bookings }: UpcomingBookingsProps) {
  return (
    <Card className="border border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-gray-900">
          Prochains Rendez-vous
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flow-root">
          <ul role="list" className="-my-5 divide-y divide-gray-200">
            {bookings.map((booking) => (
              <li key={booking.id} className="py-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={booking.clientImage} alt={booking.clientName} />
                      <AvatarFallback>
                        {booking.clientName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {booking.clientName}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {booking.serviceName}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {format(new Date(booking.startTime), 'HH:mm', { locale: fr })}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
