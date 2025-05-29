import { useState } from 'react';
import { ServiceCard } from '@/components/services/ServiceCard';
import { ServiceForm } from '@/components/services/ServiceForm';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { ServiceWithAgents } from '@/types';
import { ServiceFormData } from '@/lib/validations/schemas';
import { useToast } from '@/hooks/use-toast';

// Mock data - in a real app, this would come from your API
const mockServices: ServiceWithAgents[] = [
  {
    id: 1,
    name: 'Épilation 1 Zone',
    description: 'Zone simple',
    duration: 30,
    price: '45.00',
    capacity: 4,
    category: 'FEMMES',
    color: 'blue',
    isActive: true,
    assignedAgents: [
      { id: 1, firstName: 'Hanna', lastName: 'Bent', displayName: 'Hanna Bent' },
      { id: 2, firstName: 'Agent', lastName: '2', displayName: 'Agent2' },
      { id: 3, firstName: 'Mehdi', lastName: '', displayName: 'mehdi' },
    ],
  },
  {
    id: 2,
    name: 'Épilation 2 Zones',
    description: 'Deux zones combinées',
    duration: 45,
    price: '75.00',
    capacity: 3,
    category: 'FEMMES',
    color: 'green',
    isActive: true,
    assignedAgents: [
      { id: 1, firstName: 'Hanna', lastName: 'Bent', displayName: 'Hanna Bent' },
      { id: 2, firstName: 'Agent', lastName: '2', displayName: 'Agent2' },
    ],
  },
  {
    id: 3,
    name: 'Épilation 3 Zones',
    description: 'Formule complète',
    duration: 60,
    price: '105.00',
    capacity: 2,
    category: 'FEMMES',
    color: 'purple',
    isActive: true,
    assignedAgents: [
      { id: 1, firstName: 'Hanna', lastName: 'Bent', displayName: 'Hanna Bent' },
    ],
  },
  {
    id: 4,
    name: 'Épilation Full Body',
    description: 'Corps complet',
    duration: 120,
    price: '200.00',
    capacity: 1,
    category: 'FEMMES',
    color: 'red',
    isActive: true,
    assignedAgents: [
      { id: 2, firstName: 'Agent', lastName: '2', displayName: 'Agent2' },
      { id: 3, firstName: 'Mehdi', lastName: '', displayName: 'mehdi' },
    ],
  },
];

export default function Services() {
  const [services, setServices] = useState<ServiceWithAgents[]>(mockServices);
  const [selectedService, setSelectedService] = useState<ServiceWithAgents | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();

  const handleCreateService = () => {
    setSelectedService(null);
    setIsFormOpen(true);
  };

  const handleEditService = (service: ServiceWithAgents) => {
    setSelectedService(service);
    setIsFormOpen(true);
  };

  const handleDeleteService = (id: number) => {
    setServices(services.filter(s => s.id !== id));
    toast({
      title: "Service supprimé",
      description: "Le service a été supprimé avec succès.",
    });
  };

  const handleFormSubmit = (data: ServiceFormData) => {
    if (selectedService) {
      // Update existing service
      setServices(services.map(s => 
        s.id === selectedService.id 
          ? { ...s, ...data, assignedAgents: s.assignedAgents }
          : s
      ));
      toast({
        title: "Service modifié",
        description: "Le service a été modifié avec succès.",
      });
    } else {
      // Create new service
      const newService: ServiceWithAgents = {
        id: Math.max(...services.map(s => s.id)) + 1,
        ...data,
        assignedAgents: [],
      };
      setServices([...services, newService]);
      toast({
        title: "Service créé",
        description: "Le service a été créé avec succès.",
      });
    }
    setIsFormOpen(false);
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setSelectedService(null);
  };

  return (
    <div className="space-y-8">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Gestion des Services
          </h2>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <Button onClick={handleCreateService}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un service
          </Button>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            onEdit={handleEditService}
            onDelete={handleDeleteService}
          />
        ))}
      </div>

      {/* Service Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedService ? 'Modifier le service' : 'Créer un nouveau service'}
            </DialogTitle>
          </DialogHeader>
          <ServiceForm
            service={selectedService}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
