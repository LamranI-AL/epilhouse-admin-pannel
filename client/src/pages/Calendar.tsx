import { useState } from 'react';
import { WeeklyCalendar } from '@/components/calendar/WeeklyCalendar';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TimeSlot } from '@/types';

// Mock data - in a real app, this would come from your API
const mockTimeSlots: TimeSlot[] = [
  {
    id: '1',
    startTime: new Date('2024-11-26T09:00:00'),
    endTime: new Date('2024-11-26T09:30:00'),
    serviceType: '1 Zone',
    serviceName: 'Épilation 1 Zone',
    agentId: '1',
    agentName: 'Hanna Bent',
    locationId: '1',
    clientName: 'Sophie M.',
    status: 'confirmed',
    color: 'blue',
  },
  {
    id: '2',
    startTime: new Date('2024-11-28T09:00:00'),
    endTime: new Date('2024-11-28T09:45:00'),
    serviceType: '2 Zones',
    serviceName: 'Épilation 2 Zones',
    agentId: '2',
    agentName: 'Agent2',
    locationId: '1',
    clientName: 'Emma D.',
    status: 'confirmed',
    color: 'green',
  },
  {
    id: '3',
    startTime: new Date('2024-11-27T10:00:00'),
    endTime: new Date('2024-11-27T11:00:00'),
    serviceType: '3 Zones',
    serviceName: 'Épilation 3 Zones',
    agentId: '1',
    agentName: 'Hanna Bent',
    locationId: '1',
    clientName: 'Julie L.',
    status: 'confirmed',
    color: 'purple',
  },
  {
    id: '4',
    startTime: new Date('2024-11-29T10:00:00'),
    endTime: new Date('2024-11-29T12:00:00'),
    serviceType: 'Full Body',
    serviceName: 'Épilation Full Body',
    agentId: '3',
    agentName: 'Mehdi',
    locationId: '1',
    clientName: 'Marie P.',
    status: 'confirmed',
    color: 'red',
  },
];

const legendItems = [
  { service: '1 Zone', color: 'bg-blue-100 border-blue-200' },
  { service: '2 Zones', color: 'bg-green-100 border-green-200' },
  { service: '3 Zones', color: 'bg-purple-100 border-purple-200' },
  { service: '4 Zones', color: 'bg-orange-100 border-orange-200' },
  { service: '5 Zones', color: 'bg-yellow-100 border-yellow-200' },
  { service: 'Full Body', color: 'bg-red-100 border-red-200' },
];

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedAgent, setSelectedAgent] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');

  const handleSlotClick = (slot: TimeSlot) => {
    console.log('Slot clicked:', slot);
    // Here you would open a modal or navigate to edit the booking
  };

  return (
    <div className="space-y-8">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Calendrier des Rendez-vous
          </h2>
        </div>
        <div className="mt-4 flex space-x-3 md:ml-4 md:mt-0">
          <Select value={selectedAgent} onValueChange={setSelectedAgent}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Tous les agents" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les agents</SelectItem>
              <SelectItem value="1">Hanna Bent</SelectItem>
              <SelectItem value="2">Agent2</SelectItem>
              <SelectItem value="3">Mehdi</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Toutes les locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les locations</SelectItem>
              <SelectItem value="1">Paris Centre</SelectItem>
              <SelectItem value="2">Lyon Part-Dieu</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Calendar Widget */}
      <WeeklyCalendar
        timeSlots={mockTimeSlots}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onSlotClick={handleSlotClick}
      />

      {/* Legend */}
      <Card className="border border-gray-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Légende des Services
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {legendItems.map((item) => (
              <div key={item.service} className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded border ${item.color}`} />
                <span className="text-sm text-gray-700">{item.service}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
