import { useTheme, Theme } from '@/hooks/useTheme';
import { Check } from 'lucide-react';

const themeColors: Record<Theme, { primary: string; bg: string; accent: string }> = {
  slate: {
    primary: 'bg-blue-500',
    bg: 'bg-slate-800',
    accent: 'bg-blue-400',
  },
  void: {
    primary: 'bg-purple-500',
    bg: 'bg-zinc-900',
    accent: 'bg-purple-400',
  },
  ember: {
    primary: 'bg-amber-500',
    bg: 'bg-stone-800',
    accent: 'bg-orange-400',
  },
};

export const ThemeSelector = () => {
  const { theme, setTheme, themes } = useTheme();

  return (
    <div className="space-y-3">
      <h3 className="font-display font-semibold text-lg mb-4">Theme</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {themes.map((t) => (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-left ${
              theme === t.id
                ? 'border-primary bg-primary/10'
                : 'border-border/50 hover:border-primary/50'
            }`}
          >
            {/* Color preview */}
            <div className="flex gap-2 mb-3">
              <div className={`w-6 h-6 rounded-full ${themeColors[t.id].bg}`} />
              <div className={`w-6 h-6 rounded-full ${themeColors[t.id].primary}`} />
              <div className={`w-6 h-6 rounded-full ${themeColors[t.id].accent}`} />
            </div>
            
            {/* Theme info */}
            <div className="font-display font-semibold mb-1">{t.name}</div>
            <div className="text-xs text-muted-foreground line-clamp-2">
              {t.description}
            </div>

            {/* Active indicator */}
            {theme === t.id && (
              <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <Check className="w-3 h-3 text-primary-foreground" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
