import { StatsCard } from '@/components/dashboard/StatsCard';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { UpcomingBookings } from '@/components/dashboard/UpcomingBookings';
import { Button } from '@/components/ui/button';
import { CalendarCheck, Euro, Clock, UserPlus, Plus } from 'lucide-react';
import { DashboardMetrics } from '@/types';

// Mock data - in a real app, this would come from your API
const mockMetrics: DashboardMetrics = {
  totalBookings: 47,
  revenue: 2847,
  workingHours: 142,
  newCustomers: 23,
  bookingTrend: [
    { date: '2024-11-25', count: 12 },
    { date: '2024-11-26', count: 18 },
    { date: '2024-11-27', count: 15 },
    { date: '2024-11-28', count: 22 },
    { date: '2024-11-29', count: 19 },
    { date: '2024-11-30', count: 25 },
    { date: '2024-12-01', count: 20 },
  ],
  revenueTrend: [
    { date: 'Lun', revenue: 1200 },
    { date: 'Mar', revenue: 1800 },
    { date: 'Mer', revenue: 2200 },
    { date: 'Jeu', revenue: 1900 },
    { date: 'Ven', revenue: 2400 },
    { date: 'Sam', revenue: 2800 },
    { date: 'Dim', revenue: 2000 },
  ],
};

const mockUpcomingBookings = [
  {
    id: 1,
    clientName: 'Sophie Martin',
    serviceName: 'Épilation 3 Zones',
    startTime: '2024-11-26T14:30:00Z',
  },
  {
    id: 2,
    clientName: 'Emma Dubois',
    serviceName: 'Épilation 1 Zone',
    startTime: '2024-11-26T15:00:00Z',
  },
  {
    id: 3,
    clientName: 'Julie Leroy',
    serviceName: 'Épilation Full Body',
    startTime: '2024-11-26T16:30:00Z',
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Tableau de bord
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Vue d'ensemble des performances aujourd'hui
          </p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Rendez-vous
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Rendez-vous Aujourd'hui"
          value={mockMetrics.totalBookings}
          change="+12%"
          changeType="positive"
          icon={CalendarCheck}
          iconColor="bg-blue-100 text-blue-600"
        />
        <StatsCard
          title="Revenus du Jour"
          value={`${mockMetrics.revenue}€`}
          change="+8%"
          changeType="positive"
          icon={Euro}
          iconColor="bg-green-100 text-green-600"
        />
        <StatsCard
          title="Heures Travaillées"
          value={`${mockMetrics.workingHours}h`}
          change="-3%"
          changeType="negative"
          icon={Clock}
          iconColor="bg-purple-100 text-purple-600"
        />
        <StatsCard
          title="Nouveaux Clients"
          value={mockMetrics.newCustomers}
          change="+15%"
          changeType="positive"
          icon={UserPlus}
          iconColor="bg-yellow-100 text-yellow-600"
        />
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RevenueChart data={mockMetrics.revenueTrend} />
        <UpcomingBookings bookings={mockUpcomingBookings} />
      </div>
    </div>
  );
}
