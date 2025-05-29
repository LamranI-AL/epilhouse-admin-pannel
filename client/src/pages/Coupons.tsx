import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, Ticket, Edit, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { couponSchema, CouponFormData } from '@/lib/validations/schemas';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface CouponWithDetails {
  id: number;
  code: string;
  type: string;
  value: string;
  applicableServices: string[];
  validFrom: string;
  validUntil: string;
  usageLimit: number | null;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
}

// Mock data - in a real app, this would come from your API
const mockCoupons: CouponWithDetails[] = [
  {
    id: 1,
    code: 'WELCOME20',
    type: 'percentage',
    value: '20.00',
    applicableServices: ['1', '2'],
    validFrom: '2024-11-01T00:00:00Z',
    validUntil: '2024-12-31T23:59:59Z',
    usageLimit: 100,
    usedCount: 15,
    isActive: true,
    createdAt: '2024-11-01T00:00:00Z',
  },
  {
    id: 2,
    code: 'FIRST50',
    type: 'fixed_amount',
    value: '50.00',
    applicableServices: ['3', '4'],
    validFrom: '2024-11-15T00:00:00Z',
    validUntil: '2024-11-30T23:59:59Z',
    usageLimit: 50,
    usedCount: 8,
    isActive: true,
    createdAt: '2024-11-15T00:00:00Z',
  },
];

const serviceOptions = [
  { value: '1', label: 'Épilation 1 Zone' },
  { value: '2', label: 'Épilation 2 Zones' },
  { value: '3', label: 'Épilation 3 Zones' },
  { value: '4', label: 'Épilation Full Body' },
];

export default function Coupons() {
  const [coupons, setCoupons] = useState<CouponWithDetails[]>(mockCoupons);
  const [selectedCoupon, setSelectedCoupon] = useState<CouponWithDetails | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<CouponFormData>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: '',
      type: 'percentage',
      value: '10.00',
      applicableServices: [],
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      isActive: true,
    },
  });

  const handleCreateCoupon = () => {
    setSelectedCoupon(null);
    form.reset();
    setIsFormOpen(true);
  };

  const handleEditCoupon = (coupon: CouponWithDetails) => {
    setSelectedCoupon(coupon);
    form.reset({
      code: coupon.code,
      type: coupon.type as 'percentage' | 'fixed_amount',
      value: coupon.value,
      applicableServices: coupon.applicableServices,
      validFrom: new Date(coupon.validFrom),
      validUntil: new Date(coupon.validUntil),
      usageLimit: coupon.usageLimit || undefined,
      isActive: coupon.isActive,
    });
    setIsFormOpen(true);
  };

  const handleDeleteCoupon = (id: number) => {
    setCoupons(coupons.filter(c => c.id !== id));
    toast({
      title: "Coupon supprimé",
      description: "Le coupon a été supprimé avec succès.",
    });
  };

  const handleFormSubmit = (data: CouponFormData) => {
    if (selectedCoupon) {
      // Update existing coupon
      setCoupons(coupons.map(c => 
        c.id === selectedCoupon.id 
          ? { 
              ...c, 
              ...data, 
              validFrom: data.validFrom.toISOString(),
              validUntil: data.validUntil.toISOString(),
            }
          : c
      ));
      toast({
        title: "Coupon modifié",
        description: "Le coupon a été modifié avec succès.",
      });
    } else {
      // Create new coupon
      const newCoupon: CouponWithDetails = {
        id: Math.max(...coupons.map(c => c.id)) + 1,
        ...data,
        validFrom: data.validFrom.toISOString(),
        validUntil: data.validUntil.toISOString(),
        usedCount: 0,
        createdAt: new Date().toISOString(),
      };
      setCoupons([...coupons, newCoupon]);
      toast({
        title: "Coupon créé",
        description: "Le coupon a été créé avec succès.",
      });
    }
    setIsFormOpen(false);
  };

  const getTypeLabel = (type: string) => {
    return type === 'percentage' ? 'Pourcentage' : 'Montant fixe';
  };

  const getValueDisplay = (type: string, value: string) => {
    return type === 'percentage' ? `${value}%` : `${value}€`;
  };

  const isExpired = (validUntil: string) => {
    return new Date(validUntil) < new Date();
  };

  return (
    <div className="space-y-8">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Gestion des Coupons
          </h2>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <Button onClick={handleCreateCoupon}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un coupon
          </Button>
        </div>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {coupons.map((coupon) => (
          <Card key={coupon.id} className="border border-gray-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Ticket className="h-5 w-5 text-blue-600" />
                  <span className="font-mono font-bold">{coupon.code}</span>
                </CardTitle>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditCoupon(coupon)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteCoupon(coupon.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Réduction</span>
                <div className="text-right">
                  <div className="font-semibold text-lg text-green-600">
                    {getValueDisplay(coupon.type, coupon.value)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {getTypeLabel(coupon.type)}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Période de validité</span>
                </div>
                <div className="text-xs text-gray-500">
                  Du {format(new Date(coupon.validFrom), 'dd/MM/yyyy', { locale: fr })} au {format(new Date(coupon.validUntil), 'dd/MM/yyyy', { locale: fr })}
                </div>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Utilisation</span>
                <span>
                  {coupon.usedCount} / {coupon.usageLimit || '∞'}
                </span>
              </div>

              {coupon.applicableServices.length > 0 && (
                <div>
                  <div className="text-sm text-gray-600 mb-2">Services applicables</div>
                  <div className="flex flex-wrap gap-1">
                    {coupon.applicableServices.map((serviceId) => {
                      const service = serviceOptions.find(s => s.value === serviceId);
                      return service ? (
                        <Badge key={serviceId} variant="outline" className="text-xs">
                          {service.label}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <Badge 
                  variant={
                    !coupon.isActive ? "secondary" : 
                    isExpired(coupon.validUntil) ? "destructive" : 
                    "default"
                  }
                >
                  {!coupon.isActive ? 'Inactif' : 
                   isExpired(coupon.validUntil) ? 'Expiré' : 
                   'Actif'}
                </Badge>
                {coupon.usageLimit && coupon.usedCount >= coupon.usageLimit && (
                  <Badge variant="destructive">Épuisé</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Coupon Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedCoupon ? 'Modifier le coupon' : 'Créer un nouveau coupon'}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code du coupon</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="WELCOME20" 
                          className="font-mono uppercase"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type de réduction</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez un type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="percentage">Pourcentage</SelectItem>
                          <SelectItem value="fixed_amount">Montant fixe</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Valeur {form.watch('type') === 'percentage' ? '(%)' : '(€)'}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={form.watch('type') === 'percentage' ? '20' : '50.00'} 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="usageLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Limite d'utilisation (optionnel)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="100"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="validFrom"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date de début</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "dd/MM/yyyy", { locale: fr })
                              ) : (
                                <span>Sélectionnez une date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="validUntil"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date de fin</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "dd/MM/yyyy", { locale: fr })
                              ) : (
                                <span>Sélectionnez une date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < form.watch('validFrom')}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
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
                      <FormLabel className="text-base">Coupon actif</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Ce coupon sera disponible pour utilisation
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
                  {selectedCoupon ? 'Modifier' : 'Créer'} le coupon
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
