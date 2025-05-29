import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { ServiceWithAgents } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ServiceCardProps {
  service: ServiceWithAgents;
  onEdit: (service: ServiceWithAgents) => void;
  onDelete: (id: number) => void;
}

export function ServiceCard({ service, onEdit, onDelete }: ServiceCardProps) {
  const getServiceIcon = (name: string) => {
    if (name.includes('1 Zone')) return '1Z';
    if (name.includes('2 Zones')) return '2Z';
    if (name.includes('3 Zones')) return '3Z';
    if (name.includes('4 Zones')) return '4Z';
    if (name.includes('5 Zones')) return '5Z';
    if (name.includes('Full Body')) return 'FB';
    return name.substring(0, 2).toUpperCase();
  };

  const getIconColor = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      red: 'bg-red-100 text-red-600',
      orange: 'bg-orange-100 text-orange-600',
      yellow: 'bg-yellow-100 text-yellow-600',
    };
    return colorMap[color] || 'bg-gray-100 text-gray-600';
  };

  return (
    <Card className="border border-gray-200 hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getIconColor(service.color)}`}>
              <span className="font-semibold text-sm">
                {getServiceIcon(service.name)}
              </span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">
                {service.name}
              </h3>
              <p className="text-sm text-gray-500">
                {service.description || 'Service d\'épilation'}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(service)}>
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(service.id)}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Durée
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {service.duration} min
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Prix
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {service.price}€
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Capacité
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {service.capacity} {service.capacity > 1 ? 'personnes' : 'personne'}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Agents
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {service.assignedAgents.length} assignés
            </dd>
          </div>
        </div>
        
        <div className="mt-4">
          <Badge variant={service.isActive ? "default" : "secondary"}>
            {service.isActive ? 'Actif' : 'Inactif'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
