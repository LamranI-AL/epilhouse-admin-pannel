import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TimeSlot } from '@/types';
import { format, addDays, startOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';

interface WeeklyCalendarProps {
  timeSlots: TimeSlot[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onSlotClick: (slot: TimeSlot) => void;
}

const timeSlots = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
];

const getServiceColor = (serviceType: string) => {
  const colorMap: Record<string, string> = {
    '1 Zone': 'bg-blue-100 text-blue-800 border-blue-200',
    '2 Zones': 'bg-green-100 text-green-800 border-green-200',
    '3 Zones': 'bg-purple-100 text-purple-800 border-purple-200',
    '4 Zones': 'bg-orange-100 text-orange-800 border-orange-200',
    '5 Zones': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Full Body': 'bg-red-100 text-red-800 border-red-200',
  };
  return colorMap[serviceType] || 'bg-gray-100 text-gray-800 border-gray-200';
};

export function WeeklyCalendar({ 
  timeSlots: slots, 
  selectedDate, 
  onDateChange, 
  onSlotClick 
}: WeeklyCalendarProps) {
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const previousWeek = () => {
    onDateChange(addDays(selectedDate, -7));
  };

  const nextWeek = () => {
    onDateChange(addDays(selectedDate, 7));
  };

  const getSlotForTimeAndDay = (time: string, day: Date) => {
    return slots.find(slot => {
      const slotDate = new Date(slot.startTime);
      const slotTime = format(slotDate, 'HH:mm');
      const slotDay = format(slotDate, 'yyyy-MM-dd');
      const currentDay = format(day, 'yyyy-MM-dd');
      
      return slotTime === time && slotDay === currentDay;
    });
  };

  return (
    <Card className="border border-gray-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={previousWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <CardTitle className="text-lg font-semibold">
            {format(selectedDate, 'MMMM yyyy', { locale: fr })}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={nextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex space-x-2">
          <Button size="sm" variant="default">
            Semaine
          </Button>
          <Button size="sm" variant="ghost">
            Mois
          </Button>
          <Button size="sm" variant="ghost">
            Jour
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="grid grid-cols-8 gap-px bg-gray-200 rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-white p-2 text-xs font-medium text-gray-500 text-center">
            Heure
          </div>
          {weekDays.map((day) => (
            <div key={day.toISOString()} className="bg-white p-2 text-sm font-medium text-gray-900 text-center">
              <div>{format(day, 'EEE', { locale: fr })}</div>
              <div className="text-xs text-gray-500">
                {format(day, 'dd MMM', { locale: fr })}
              </div>
            </div>
          ))}

          {/* Time slots */}
          {timeSlots.map((time) => (
            <>
              <div key={`time-${time}`} className="bg-white p-2 text-xs text-gray-500 text-center border-r border-gray-200">
                {time}
              </div>
              {weekDays.map((day) => {
                const slot = getSlotForTimeAndDay(time, day);
                
                return (
                  <div key={`${time}-${day.toISOString()}`} className="bg-white p-1">
                    {slot ? (
                      <button
                        onClick={() => onSlotClick(slot)}
                        className={`w-full text-xs p-1 rounded text-center border ${getServiceColor(slot.serviceType)} hover:opacity-80 transition-opacity`}
                      >
                        <div className="font-medium truncate">
                          {slot.serviceType}
                        </div>
                        <div className="truncate">
                          {slot.clientName}
                        </div>
                      </button>
                    ) : (
                      <div className="w-full h-12" />
                    )}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
