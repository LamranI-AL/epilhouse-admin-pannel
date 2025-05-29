import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Plus, MapPin, Phone, Mail, Edit, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { locationSchema, LocationFormData } from '@/lib/validations/schemas';
import { LocationWithAgents } from '@/types';
import { useToast } from '@/hooks/use-toast';

// Mock data - in a real app, this would come from your API
const mockLocations: LocationWithAgents[] = [
  {
    id: 1,
    name: 'Paris Centre',
    address: '123 Rue de Rivoli',
    city: 'Paris',
    postalCode: '75001',
    country: 'France',
    phone: '+33 1 42 60 30 30',
    email: 'paris.centre@beautybook.fr',
    coordinates: { lat: 48.8566, lng: 2.3522 },
    workingHours: {
      monday: { start: '09:00', end: '19:00' },
      tuesday: { start: '09:00', end: '19:00' },
      wednesday: { start: '09:00', end: '19:00' },
      thursday: { start: '09:00', end: '19:00' },
      friday: { start: '09:00', end: '19:00' },
      saturday: { start: '10:00', end: '18:00' },
      sunday: { start: '10:00', end: '17:00' },
    },
    isActive: true,
    assignedAgents: [
      { id: 1, firstName: 'Hanna', lastName: 'Bent', displayName: 'Hanna Bent' },
      { id: 3, firstName: 'Mehdi', lastName: '', displayName: 'mehdi' },
    ],
  },
  {
    id: 2,
    name: 'Lyon Part-Dieu',
    address: '17 Rue de la République',
    city: 'Lyon',
    postalCode: '69003',
    country: 'France',
    phone: '+33 4 72 61 40 40',
    email: 'lyon.partdieu@beautybook.fr',
    coordinates: { lat: 45.7640, lng: 4.8357 },
    workingHours: {
      monday: { start: '09:00', end: '19:00' },
      tuesday: { start: '09:00', end: '19:00' },
      wednesday: { start: '09:00', end: '19:00' },
      thursday: { start: '09:00', end: '19:00' },
      friday: { start: '09:00', end: '19:00' },
      saturday: { start: '10:00', end: '18:00' },
    },
    isActive: true,
    assignedAgents: [
      { id: 2, firstName: 'Agent', lastName: '2', displayName: 'Agent2' },
    ],
  },
];

export default function Locations() {
  const [locations, setLocations] = useState<LocationWithAgents[]>(mockLocations);
  const [selectedLocation, setSelectedLocation] = useState<LocationWithAgents | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: '',
      address: '',
      city: '',
      postalCode: '',
      country: 'France',
      phone: '',
      email: '',
      isActive: true,
    },
  });

  const handleCreateLocation = () => {
    setSelectedLocation(null);
    form.reset();
    setIsFormOpen(true);
  };

  const handleEditLocation = (location: LocationWithAgents) => {
    setSelectedLocation(location);
    form.reset({
      name: location.name,
      address: location.address,
      city: location.city,
      postalCode: location.postalCode,
      country: location.country,
      phone: location.phone || '',
      email: location.email || '',
      isActive: location.isActive,
    });
    setIsFormOpen(true);
  };

  const handleDeleteLocation = (id: number) => {
    setLocations(locations.filter(l => l.id !== id));
    toast({
      title: "Centre supprimé",
      description: "Le centre a été supprimé avec succès.",
    });
  };

  const handleFormSubmit = (data: LocationFormData) => {
    if (selectedLocation) {
      // Update existing location
      setLocations(locations.map(l => 
        l.id === selectedLocation.id 
          ? { ...l, ...data, assignedAgents: l.assignedAgents }
          : l
      ));
      toast({
        title: "Centre modifié",
        description: "Le centre a été modifié avec succès.",
      });
    } else {
      // Create new location
      const newLocation: LocationWithAgents = {
        id: Math.max(...locations.map(l => l.id)) + 1,
        ...data,
        coordinates: null,
        workingHours: null,
        assignedAgents: [],
      };
      setLocations([...locations, newLocation]);
      toast({
        title: "Centre créé",
        description: "Le centre a été créé avec succès.",
      });
    }
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-8">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Gestion des Centres
          </h2>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <Button onClick={handleCreateLocation}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un centre
          </Button>
        </div>
      </div>

      {/* Locations Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {locations.map((location) => (
          <Card key={location.id} className="border border-gray-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <span>{location.name}</span>
                </CardTitle>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditLocation(location)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteLocation(location.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{location.address}, {location.city} {location.postalCode}</span>
                </div>
                {location.phone && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{location.phone}</span>
                  </div>
                )}
                {location.email && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>{location.email}</span>
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Agents assignés</h4>
                <div className="flex flex-wrap gap-2">
                  {location.assignedAgents.length > 0 ? (
                    location.assignedAgents.map((agent) => (
                      <Badge key={agent.id} variant="secondary">
                        {agent.displayName || `${agent.firstName} ${agent.lastName}`}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">Aucun agent assigné</span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Badge variant={location.isActive ? "default" : "secondary"}>
                  {location.isActive ? 'Actif' : 'Inactif'}
                </Badge>
                {location.coordinates && (
                  <span className="text-xs text-gray-500">
                    Coordonnées: {location.coordinates.lat.toFixed(4)}, {location.coordinates.lng.toFixed(4)}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Location Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedLocation ? 'Modifier le centre' : 'Créer un nouveau centre'}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom du centre</FormLabel>
                      <FormControl>
                        <Input placeholder="ex: Paris Centre" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ville</FormLabel>
                      <FormControl>
                        <Input placeholder="Paris" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Rue de Rivoli" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code postal</FormLabel>
                      <FormControl>
                        <Input placeholder="75001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pays</FormLabel>
                      <FormControl>
                        <Input placeholder="France" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Téléphone</FormLabel>
                      <FormControl>
                        <Input placeholder="+33 1 42 60 30 30" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="centre@beautybook.fr" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Centre actif</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Ce centre sera disponible pour les réservations
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">
                  {selectedLocation ? 'Modifier' : 'Créer'} le centre
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
