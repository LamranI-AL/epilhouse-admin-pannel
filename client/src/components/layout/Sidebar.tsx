import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { 
  BarChart3, 
  Calendar, 
  ClipboardList, 
  ShoppingCart, 
  CreditCard, 
  Users, 
  Settings, 
  UserRoundCheck, 
  MapPin, 
  Ticket,
  Cog,
  Bot,
  Link as LinkIcon,
  FormInput,
  Plus
} from 'lucide-react';

const navigation = [
  { name: 'Tableau de bord', href: '/', icon: BarChart3 },
  { name: 'Calendrier', href: '/calendar', icon: Calendar },
  { name: 'Rendez-vous', href: '/bookings', icon: ClipboardList },
  { name: 'Orders', href: '/orders', icon: ShoppingCart },
  { name: 'Paiements', href: '/payments', icon: CreditCard },
  { name: 'Clients', href: '/clients', icon: Users },
];

const resourcesNavigation = [
  { name: 'Services', href: '/services', icon: Settings },
  { name: 'Agents', href: '/agents', icon: UserRoundCheck },
  { name: 'Locations', href: '/locations', icon: MapPin },
  { name: 'Coupons', href: '/coupons', icon: Ticket },
];

const settingsNavigation = [
  { name: 'Paramètres', href: '/settings', icon: Cog },
  { name: 'Automation', href: '/automation', icon: Bot },
  { name: 'Integrations', href: '/integrations', icon: LinkIcon },
  { name: 'Form Fields', href: '/form-fields', icon: FormInput },
  { name: 'Add-ons', href: '/add-ons', icon: Plus },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 shadow-sm border-r border-gray-200">
        <div className="flex h-16 shrink-0 items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">B</span>
            </div>
            <span className="text-xl font-bold text-gray-900">BeautyBook Pro</span>
          </div>
        </div>
        
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.href;
                  
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold',
                          isActive
                            ? 'bg-gray-50 text-blue-700'
                            : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                        )}
                      >
                        <Icon className="h-6 w-6 shrink-0" />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
            
            <li>
              <div className="text-xs font-semibold leading-6 text-gray-400 uppercase tracking-wide">
                RESOURCES
              </div>
              <ul role="list" className="-mx-2 mt-2 space-y-1">
                {resourcesNavigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.href;
                  
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold',
                          isActive
                            ? 'bg-gray-50 text-blue-700'
                            : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                        )}
                      >
                        <Icon className="h-6 w-6 shrink-0" />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
            
            <li>
              <div className="text-xs font-semibold leading-6 text-gray-400 uppercase tracking-wide">
                PARAMÈTRES
              </div>
              <ul role="list" className="-mx-2 mt-2 space-y-1">
                {settingsNavigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.href;
                  
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold',
                          isActive
                            ? 'bg-gray-50 text-blue-700'
                            : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                        )}
                      >
                        <Icon className="h-6 w-6 shrink-0" />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
