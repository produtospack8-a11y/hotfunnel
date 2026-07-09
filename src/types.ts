export interface Persona {
  rostro: string;
  alma: string;
  corpo: string;
  historia: string;
}

export interface FunnelStep {
  stepId: number;
  title: string;
  description: string;
  status: 'Não iniciado' | 'Em andamento' | 'Concluído' | 'Validado';
  completedTasks: string[]; // List of IDs or strings representing the checkboxes marked
  evidence: string;
  improvements: string;
  aiAdvice: string;
}

export interface CalendarItem {
  id: string;
  platform: 'Instagram' | 'TikTok' | 'Telegram' | 'Facebook' | 'Contingência/Links';
  type: 'Reels' | 'Stories' | 'Feed' | 'Prévia Grátis' | 'Promo VIP' | 'Destaques';
  hook: string;
  desc: string;
  published: boolean;
  date: string;
}

export interface Campaign {
  id: string;
  name: string;
  type: 'ABO' | 'CBO';
  budget: number;
  structure: string; // Ex: "1-3-1" ou "1-1-5"
  leadCtr: number; // CTR inicial de entrada
  saleCtr: number; // CTR final de cliques em checkout
  roi: number; // Retorno do Investimento
  note: string;
  status: 'Ativo' | 'Escalado' | 'Pausado';
}

export interface Product {
  id: string;
  type: 'Front' | 'Orderbump' | 'Upsell' | 'Downsell';
  name: string;
  price: number;
  description: string;
  isActive: boolean;
}

export interface SavedRedditPage {
  id: string;
  url: string;
  label: string;
  notes?: string;
}

export interface ModelProfile {
  id: string;
  name: string;
  startDate: string;
  status: 'Ativo' | 'Em scaling' | 'Precisa atenção' | 'Concluído';
  avatarUrl: string;
  persona: Persona;
  funnelSteps: FunnelStep[];
  calendar: CalendarItem[];
  campaigns: Campaign[];
  products: Product[];
  notes: string;
  logs: Array<{ id: string; timestamp: string; text: string }>;
  savedRedditPages?: SavedRedditPage[];
}
