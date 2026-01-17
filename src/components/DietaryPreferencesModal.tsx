import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, Sparkles, Check } from 'lucide-react';
import { useDietaryPreferences } from '@/hooks/useAIRecommendations';
import { DietaryPreferences } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const ALLERGY_OPTIONS = ['Dairy', 'Eggs', 'Gluten', 'Nuts', 'Shellfish', 'Soy'];
const RESTRICTION_OPTIONS = ['Vegetarian', 'Vegan', 'Halal', 'Kosher', 'Gluten-Free'];

interface DietaryPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DietaryPreferencesModal({ isOpen, onClose }: DietaryPreferencesModalProps) {
  const { saving, savePreferences, getCurrentPreferences } = useDietaryPreferences();
  const currentPrefs = getCurrentPreferences();
  
  const [allergies, setAllergies] = useState<string[]>(currentPrefs.allergies || []);
  const [restrictions, setRestrictions] = useState<string[]>(currentPrefs.restrictions || []);
  const [maxBudget, setMaxBudget] = useState<string>(
    currentPrefs.maxBudget ? String(currentPrefs.maxBudget) : ''
  );

  const toggleAllergy = (allergy: string) => {
    setAllergies(prev => 
      prev.includes(allergy) 
        ? prev.filter(a => a !== allergy)
        : [...prev, allergy]
    );
  };

  const toggleRestriction = (restriction: string) => {
    setRestrictions(prev => 
      prev.includes(restriction) 
        ? prev.filter(r => r !== restriction)
        : [...prev, restriction]
    );
  };

  const handleSave = async () => {
    const prefs: DietaryPreferences = {
      allergies,
      restrictions,
      maxBudget: maxBudget ? parseFloat(maxBudget) : null
    };
    
    const success = await savePreferences(prefs);
    if (success) {
      toast.success('Preferences saved! AI recommendations will now match your diet.');
      onClose();
    } else {
      toast.error('Failed to save preferences');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-x-4 bottom-4 top-auto max-h-[80vh] overflow-auto bg-card border border-border rounded-2xl shadow-xl z-50 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h2 className="font-display text-xl">Dietary Preferences</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              Set your preferences to get AI-powered meal recommendations tailored to your diet and budget.
            </p>

            {/* Allergies */}
            <div className="space-y-3 mb-6">
              <Label className="text-sm font-medium">Allergies & Intolerances</Label>
              <div className="flex flex-wrap gap-2">
                {ALLERGY_OPTIONS.map((allergy) => (
                  <Badge
                    key={allergy}
                    variant={allergies.includes(allergy) ? 'default' : 'outline'}
                    className={`cursor-pointer transition-all ${
                      allergies.includes(allergy) 
                        ? 'bg-red-500 hover:bg-red-600 text-white' 
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => toggleAllergy(allergy)}
                  >
                    {allergies.includes(allergy) && <Check className="w-3 h-3 mr-1" />}
                    {allergy}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Dietary Restrictions */}
            <div className="space-y-3 mb-6">
              <Label className="text-sm font-medium">Dietary Restrictions</Label>
              <div className="flex flex-wrap gap-2">
                {RESTRICTION_OPTIONS.map((restriction) => (
                  <Badge
                    key={restriction}
                    variant={restrictions.includes(restriction) ? 'default' : 'outline'}
                    className={`cursor-pointer transition-all ${
                      restrictions.includes(restriction) 
                        ? 'bg-primary hover:bg-primary/90' 
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => toggleRestriction(restriction)}
                  >
                    {restrictions.includes(restriction) && <Check className="w-3 h-3 mr-1" />}
                    {restriction}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Budget */}
            <div className="space-y-3 mb-6">
              <Label htmlFor="budget" className="text-sm font-medium">Max Budget (€)</Label>
              <Input
                id="budget"
                type="number"
                min="1"
                max="100"
                placeholder="e.g., 15"
                value={maxBudget}
                onChange={(e) => setMaxBudget(e.target.value)}
                className="max-w-32"
              />
              <p className="text-xs text-muted-foreground">
                We'll prioritize meals within your budget
              </p>
            </div>

            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="w-full"
            >
              {saving ? 'Saving...' : 'Save Preferences'}
            </Button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
