import { motion } from 'framer-motion';
import { HomebiteProvider, useHomebite } from '@/context/HomebiteContext';
import { Header } from '@/components/Header';
import { EaterFeed } from '@/components/EaterFeed';
import { CookDashboard } from '@/components/CookDashboard';

function HomebiteContent() {
  const { role } = useHomebite();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <motion.div
          key={role}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {role === 'eater' ? <EaterFeed /> : <CookDashboard />}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© 2026 Homebite · Paris, France</p>
            <p className="flex items-center gap-1">
              Made with <span className="text-terracotta">♥</span> for home cooks
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

const Index = () => {
  return (
    <HomebiteProvider>
      <HomebiteContent />
    </HomebiteProvider>
  );
};

export default Index;
