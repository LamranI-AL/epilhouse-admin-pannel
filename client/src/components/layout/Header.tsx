import { Search, Bell, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export function Header() {
  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <Button variant="ghost" size="icon" className="lg:hidden">
        <Menu className="h-6 w-6" />
      </Button>
      
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <form className="relative flex flex-1" action="#" method="GET">
          <label htmlFor="search-field" className="sr-only">
            Rechercher
          </label>
          <Search className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400 pl-3" />
          <Input
            id="search-field"
            className="block h-full w-full border-0 py-0 pl-10 pr-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
            placeholder="Rechercher..."
            type="search"
            name="search"
          />
        </form>
        
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-6 w-6" />
            <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-red-500 hover:bg-red-500">
              4
            </Badge>
          </Button>
          
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" />
          
          <div className="relative">
            <Button variant="ghost" className="flex items-center gap-x-3 p-1.5">
              <Avatar className="h-8 w-8">
                <AvatarImage src="" alt="Profile" />
                <AvatarFallback>MD</AvatarFallback>
              </Avatar>
              <span className="hidden lg:flex lg:items-center">
                <span className="ml-4 text-sm font-semibold leading-6 text-gray-900">
                  Marie Dubois
                </span>
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
