import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { serviceSchema, ServiceFormData } from '@/lib/validations/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ServiceWithAgents } from '@/types';

interface ServiceFormProps {
  service?: ServiceWithAgents;
  onSubmit: (data: ServiceFormData) => void;
  onCancel: () => void;
}

const colorOptions = [
  { value: 'blue', label: 'Bleu', class: 'bg-blue-500' },
  { value: 'green', label: 'Vert', class: 'bg-green-500' },
  { value: 'purple', label: 'Violet', class: 'bg-purple-500' },
  { value: 'red', label: 'Rouge', class: 'bg-red-500' },
  { value: 'orange', label: 'Orange', class: 'bg-orange-500' },
  { value: 'yellow', label: 'Jaune', class: 'bg-yellow-500' },
];

export function ServiceForm({ service, onSubmit, onCancel }: ServiceFormProps) {
  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: service ? {
      name: service.name,
      description: service.description || '',
      duration: service.duration,
      price: service.price,
      capacity: service.capacity,
      category: service.category as 'FEMMES' | 'HOMMES',
      color: service.color,
      isActive: service.isActive,
    } : {
      name: '',
      description: '',
      duration: 30,
      price: '45.00',
      capacity: 1,
      category: 'FEMMES',
      color: 'blue',
      isActive: true,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom du service</FormLabel>
                <FormControl>
                  <Input placeholder="ex: Épilation 1 Zone" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Catégorie</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une catégorie" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="FEMMES">Femmes</SelectItem>
                    <SelectItem value="HOMMES">Hommes</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Description du service..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Durée (minutes)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prix (€)</FormLabel>
                <FormControl>
                  <Input placeholder="45.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Capacité</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Couleur</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une couleur" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {colorOptions.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center space-x-2">
                        <div className={`w-4 h-4 rounded ${color.class}`} />
                        <span>{color.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Service actif</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Ce service sera disponible pour les réservations
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
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button type="submit">
            {service ? 'Modifier' : 'Créer'} le service
          </Button>
        </div>
      </form>
    </Form>
  );
}
