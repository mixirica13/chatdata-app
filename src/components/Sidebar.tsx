import { NavLink } from 'react-router-dom';
import { Home, History, Settings, Zap, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Assinatura', href: '/subscription', icon: Crown },
  { name: 'Histórico', href: '/history', icon: History },
  { name: 'Configurações', href: '/settings', icon: Settings },
];

export const Sidebar = () => {
  return (
    <aside className="hidden md:flex md:w-64 md:flex-col border-r bg-card">
      <div className="flex flex-col flex-1 overflow-y-auto">
        <div className="flex items-center gap-2 h-16 px-6 border-b">
          <div className="bg-primary p-2 rounded-lg">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg">ChatData</span>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )
              }
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
};
