import { Home, UtensilsCrossed } from 'lucide-react';
import { useHomebite } from '@/context/HomebiteContext';

export function Header() {
  const { role, setRole } = useHomebite();

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-xl">🏠</span>
            <h1 className="text-xl font-display text-foreground">
              Homebite
            </h1>
          </div>

          {/* Role Toggle - Compact pills */}
          <div className="flex items-center gap-1 text-sm">
            <button
              onClick={() => setRole('eater')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
                role === 'eater'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>Browse</span>
            </button>
            <button
              onClick={() => setRole('cook')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
                role === 'cook'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>My Kitchen</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
