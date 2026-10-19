import { Bot, Snowflake, MapPin, Cpu, Wrench, Zap, FlaskConical, Hammer, BookOpen, Cog } from 'lucide-react';

const ICONS = {
  'map-pin': { label: 'Local', Icon: MapPin },
  bot: { label: 'Robótica', Icon: Bot },
  snowflake: { label: 'Refrigeração', Icon: Snowflake },
  cpu: { label: 'Eletrônica', Icon: Cpu },
  wrench: { label: 'Mecânica', Icon: Wrench },
  zap: { label: 'Elétrica', Icon: Zap },
  'flask-conical': { label: 'Laboratório', Icon: FlaskConical },
  hammer: { label: 'Oficina', Icon: Hammer },
  cog: { label: 'Automação', Icon: Cog },
  'book-open': { label: 'Biblioteca', Icon: BookOpen },
};

export const ICON_OPTIONS = Object.entries(ICONS).map(([value, { label }]) => ({ value, label }));

export const getSalaIcon = (key) => ICONS[key]?.Icon || MapPin;