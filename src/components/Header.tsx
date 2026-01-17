import { motion } from 'framer-motion';
import { Home, Search } from 'lucide-react';
import { useHomebite } from '@/context/HomebiteContext';

export function Header() {
  const { role, setRole } = useHomebite();

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <Home className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-display font-semibold text-foreground">
              Homebite
            </h1>
          </motion.div>

          {/* Role Toggle */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-1 bg-muted rounded-full p-1"
          >
            <button
              onClick={() => setRole('eater')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                role === 'eater'
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Find Food</span>
            </button>
            <button
              onClick={() => setRole('cook')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                role === 'cook'
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Start Cooking</span>
            </button>
          </motion.div>
        </div>
      </div>
    </header>
  );
}
