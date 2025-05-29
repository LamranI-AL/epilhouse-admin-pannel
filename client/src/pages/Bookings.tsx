import { useState } from 'react';
import { BookingsTable } from '@/components/bookings/BookingsTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download } from 'lucide-react';
import { BookingWithDetails } from '@/types';
import { useToast } from '@/hooks/use-toast';

// Mock data - in a real app, this would come from your API
const mockBookings: BookingWithDetails[] = [
  {
    id: 1,
    startTime: '2024-11-26T14:30:00Z',
    endTime: '2024-11-26T15:00:00Z',
    status: 'confirmed',
    notes: null,
    totalAmount: '45.00',
    service: {
      id: 1,
      name: 'Épilation 1 Zone',
      color: 'blue',
      duration: 30,
    },
    agent: {
      id: 1,
      firstName: 'Hanna',
      lastName: 'Bent',
      displayName: 'Hanna Bent',
    },
    client: {
      id: 1,
      firstName: 'Sophie',
      lastName: 'Martin',
      email: 'sophie.martin@email.com',
      phone: '+33123456789',
    },
    location: {
      id: 1,
      name: 'Paris Centre',
    },
  },
  {
    id: 2,
    startTime: '2024-11-26T15:00:00Z',
    endTime: '2024-11-26T15:45:00Z',
    status: 'confirmed',
    notes: null,
    totalAmount: '75.00',
    service: {
      id: 2,
      name: 'Épilation 2 Zones',
      color: 'green',
      duration: 45,
    },
    agent: {
      id: 2,
      firstName: 'Agent',
      lastName: '2',
      displayName: 'Agent2',
    },
    client: {
      id: 2,
      firstName: 'Emma',
      lastName: 'Dubois',
      email: 'emma.dubois@email.com',
      phone: '+33987654321',
    },
    location: {
      id: 2,
      name: 'Lyon Part-Dieu',
    },
  },
  {
    id: 3,
    startTime: '2024-11-27T10:00:00Z',
    endTime: '2024-11-27T12:00:00Z',
    status: 'confirmed',
    notes: null,
    totalAmount: '200.00',
    service: {
      id: 4,
      name: 'Épilation Full Body',
      color: 'red',
      duration: 120,
    },
    agent: {
      id: 3,
      firstName: 'Mehdi',
      lastName: '',
      displayName: 'mehdi',
    },
    client: {
      id: 3,
      firstName: 'Julie',
      lastName: 'Leroy',
      email: 'julie.leroy@email.com',
      phone: '+33555666777',
    },
    location: {
      id: 1,
      name: 'Paris Centre',
    },
  },
];

export default function Bookings() {
  const [bookings, setBookings] = useState<BookingWithDetails[]>(mockBookings);
  const [filteredBookings, setFilteredBookings] = useState<BookingWithDetails[]>(mockBookings);
  const [filters, setFilters] = useState({
    service: 'all',
    agent: 'all',
    status: 'all',
    date: '',
  });
  const { toast } = useToast();

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Apply filters
    let filtered = bookings;
    
    if (newFilters.service !== 'all') {
      filtered = filtered.filter(b => b.service.id.toString() === newFilters.service);
    }
    
    if (newFilters.agent !== 'all') {
      filtered = filtered.filter(b => b.agent.id.toString() === newFilters.agent);
    }
    
    if (newFilters.status !== 'all') {
      filtered = filtered.filter(b => b.status === newFilters.status);
    }
    
    if (newFilters.date) {
      filtered = filtered.filter(b => 
        new Date(b.startTime).toISOString().split('T')[0] === newFilters.date
      );
    }
    
    setFilteredBookings(filtered);
  };

  const handleEdit = (booking: BookingWithDetails) => {
    console.log('Edit booking:', booking);
    // Here you would open a modal or navigate to edit form
    toast({
      title: "Modifier le rendez-vous",
      description: "Fonctionnalité à implémenter",
    });
  };

  const handleDelete = (id: number) => {
    setBookings(bookings.filter(b => b.id !== id));
    setFilteredBookings(filteredBookings.filter(b => b.id !== id));
    toast({
      title: "Rendez-vous supprimé",
      description: "Le rendez-vous a été supprimé avec succès.",
    });
  };

  const handleExport = () => {
    toast({
      title: "Export en cours",
      description: "Le fichier CSV sera téléchargé dans quelques instants.",
    });
    // Here you would implement CSV export functionality
  };

  return (
    <div className="space-y-8">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Gestion des Rendez-vous
          </h2>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exporter CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="border border-gray-200">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div>
              <Label htmlFor="service-filter">Service</Label>
              <Select 
                value={filters.service} 
                onValueChange={(value) => handleFilterChange('service', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous les services" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les services</SelectItem>
                  <SelectItem value="1">1 Zone</SelectItem>
                  <SelectItem value="2">2 Zones</SelectItem>
                  <SelectItem value="3">3 Zones</SelectItem>
                  <SelectItem value="4">Full Body</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="agent-filter">Agent</Label>
              <Select 
                value={filters.agent} 
                onValueChange={(value) => handleFilterChange('agent', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous les agents" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les agents</SelectItem>
                  <SelectItem value="1">Hanna Bent</SelectItem>
                  <SelectItem value="2">Agent2</SelectItem>
                  <SelectItem value="3">Mehdi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="status-filter">Statut</Label>
              <Select 
                value={filters.status} 
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="confirmed">Confirmé</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="completed">Terminé</SelectItem>
                  <SelectItem value="cancelled">Annulé</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="date-filter">Date</Label>
              <Input
                id="date-filter"
                type="date"
                value={filters.date}
                onChange={(e) => handleFilterChange('date', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <BookingsTable
        bookings={filteredBookings}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onExport={handleExport}
      />
    </div>
  );
}
