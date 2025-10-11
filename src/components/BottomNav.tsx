import { useNavigate, useLocation } from 'react-router-dom';
import { Home, CreditCard, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      icon: Home,
      label: 'Home',
      path: '/dashboard',
    },
    {
      icon: CreditCard,
      label: 'Assinatura',
      path: '/subscription',
    },
    {
      icon: Settings,
      label: 'Configurações',
      path: '/settings',
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
      <div className="mx-4 mb-6">
        <div
          className="relative overflow-hidden rounded-3xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(70,204,198,0.2)]"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#46CCC6]/10 via-transparent to-transparent" />
          <div className="relative flex justify-around items-center px-6 py-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    'flex flex-col items-center gap-1 transition-all duration-300 px-6 py-2 rounded-2xl',
                    isActive
                      ? 'text-[#46CCC6] bg-[#46CCC6]/10'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  )}
                >
                  <Icon
                    className={cn(
                      'transition-all duration-300',
                      isActive ? 'w-6 h-6' : 'w-5 h-5'
                    )}
                  />
                  <span
                    className={cn(
                      'text-xs font-medium transition-all duration-300',
                      isActive ? 'opacity-100' : 'opacity-60'
                    )}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};
