// Nationality data with flag emojis
export const nationalityFlags: Record<string, string> = {
  French: '🇫🇷',
  Italian: '🇮🇹',
  Moroccan: '🇲🇦',
  Vietnamese: '🇻🇳',
  Chinese: '🇨🇳',
  Brazilian: '🇧🇷',
  Japanese: '🇯🇵',
  Indian: '🇮🇳',
  Mexican: '🇲🇽',
  Spanish: '🇪🇸',
  Thai: '🇹🇭',
  Greek: '🇬🇷',
  Lebanese: '🇱🇧',
  Korean: '🇰🇷',
  Ethiopian: '🇪🇹',
  American: '🇺🇸',
  British: '🇬🇧',
  German: '🇩🇪',
  Portuguese: '🇵🇹',
  Turkish: '🇹🇷',
};

export function getFlag(nationality: string | null | undefined): string {
  if (!nationality) return '🍽️';
  return nationalityFlags[nationality] || '🍽️';
}

export const NATIONALITIES = Object.keys(nationalityFlags);
