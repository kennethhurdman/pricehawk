export type Category = 'FLIGHT' | 'HOTEL' | 'ECOMMERCE';

export type Tier = 'FREE' | 'PREMIUM';

export interface User {
  email: string;
  tier: Tier;
  emailTokens: number;
  selectedCategories: Category[];
  premiumActiveUntil?: string;
}

export interface MockCatalogItem {
  id: string;
  category: Category;
  name: string;
  price: number;
  currency: string;
  imageUrl: string;
  sourceUrl: string;
  location?: string;
}

export interface TrackedItem {
  id: string;
  userId: string;
  category: Category;
  title: string;
  imageUrl: string;
  targetUrl: string;
  targetPrice: number;
  currentPrice: number;
  currency: string;
  isFavorite?: boolean;
}

export type EmailType = 'DEAL_ALERT' | 'SYSTEM_OUT_OF_TOKENS';

export interface MockEmail {
  id: string;
  userId: string;
  subject: string;
  htmlBody: string;
  sentAt: string;
  read: boolean;
  type: EmailType;
}

// AI Chatbot types for the item search assistant
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  matchedItemIds?: string[];
  isLoading?: boolean;
  timestamp: Date;
}

export interface AppState {
  user: User | null;
  trackedItems: TrackedItem[];
  emails: MockEmail[];
  latestTriggeredEmailId: string | null;
  
  // Actions
  login: (email: string, categories: Category[]) => void;
  logout: () => void;
  addTrackedItem: (item: Omit<TrackedItem, 'id' | 'userId' | 'currentPrice'>) => void;
  removeTrackedItem: (id: string) => void;
  toggleFavorite: (id: string) => void;
  simulatePriceCheck: (itemId: string) => Promise<void>;
  markEmailRead: (emailId: string) => void;
  subscribePro: () => void;
  cancelPro: () => void;
}
