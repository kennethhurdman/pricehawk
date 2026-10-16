import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AppState, Category, MockEmail, TrackedItem, User } from './types';
import { v4 as uuidv4 } from 'uuid';

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [trackedItems, setTrackedItems] = useState<TrackedItem[]>([]);
  const [emails, setEmails] = useState<MockEmail[]>([]);
  const [latestTriggeredEmailId, setLatestTriggeredEmailId] = useState<string | null>(null);

  const login = (email: string, categories: Category[]) => {
    setUser({
      email,
      tier: 'FREE',
      emailTokens: 5,
      selectedCategories: categories,
    });
  };

  const logout = () => {
    setUser(null);
    setTrackedItems([]);
    setEmails([]);
    setLatestTriggeredEmailId(null);
  };

  const addTrackedItem = (item: Omit<TrackedItem, 'id' | 'userId' | 'currentPrice'>) => {
    if (!user) return;
    
    // Enforce limits
    if (user.tier === 'FREE' && trackedItems.length >= 2) {
      return; // Handled by UI, but double check
    }

    const newItem: TrackedItem = {
      ...item,
      id: uuidv4(),
      userId: user.email,
      currentPrice: item.targetPrice * 1.5, // Start current price artificially high for demo
    };
    
    setTrackedItems(prev => [newItem, ...prev]);
  };

  const removeTrackedItem = (id: string) => {
    setTrackedItems(prev => prev.filter(item => item.id !== id));
  };

  const toggleFavorite = (id: string) => {
    setTrackedItems(prev =>
      prev.map(item => item.id === id ? { ...item, isFavorite: !item.isFavorite } : item)
    );
  };

  const generateAIEmail = async (item: TrackedItem, oldPrice: number, newPrice: number) => {
    try {
      const res = await fetch('/api/generate-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ item, oldPrice, newPrice })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.error('AI Email Generation failed, falling back to local template.', e);
    }
    return null;
  };

  const simulatePriceCheck = async (itemId: string) => {
    if (!user) return;

    // Find the item first to get its current state
    const currentItem = trackedItems.find(i => i.id === itemId);
    if (!currentItem) return;

    // Let's guarantee it hits target for demo purposes by just forcing it to targetPrice - small amount
    // to ensure the user gets to see the email flow.
    const dropAmount = Math.floor(Math.random() * 50) + 1;
    let newPrice = currentItem.targetPrice - dropAmount;
    const oldPrice = currentItem.currentPrice;

    // Pre-calculate email generation if it hit
    if (newPrice <= currentItem.targetPrice) {
      if (user.tier === 'PREMIUM' || user.emailTokens > 0) {
        let subject = `🎯 Target locked — ${currentItem.title} just dropped!`;
        
        let introText = "Good news! We spotted a price drop for an item you're tracking.";
        let ctaText = "Swoop in & Get Deal";
        
        if (currentItem.category === 'FLIGHT') {
          subject = `✈️ Price Drop Alert: Flights to ${currentItem.title.split('to ')[1]?.split(' -')[0] || 'your destination'}`;
          introText = "Pack your bags! The flight you've been watching just hit your target price.";
          ctaText = "Book Flight Now";
        } else if (currentItem.category === 'HOTEL') {
          subject = `🏨 Deal Alert: ${currentItem.title} is cheaper!`;
          introText = "Your dream stay just became more affordable. The hotel price has dropped below your target.";
          ctaText = "Secure Room";
        } else if (currentItem.category === 'ECOMMERCE') {
          subject = `🛒 Price Drop: ${currentItem.title}`;
          introText = "Great news! The item you're eyeing just went on sale.";
          ctaText = "Buy Now";
        }

        let htmlBody = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #0f172a; margin-top: 0;">PriceHawk Alert 🦅</h2>
            <p style="color: #475569; font-size: 16px;">${introText}</p>
            
            <div style="background-color: #f8fafc; padding: 16px; border-radius: 6px; margin: 20px 0;">
              <img src="${currentItem.imageUrl}" alt="${currentItem.title}" style="max-width: 100%; height: 150px; object-fit: cover; border-radius: 4px; margin-bottom: 12px; display: block;" />
              <h3 style="margin: 0 0 10px 0; color: #1e293b;">${currentItem.title}</h3>
              <p style="margin: 0; font-size: 14px; color: #64748b;">
                Old Price: <span style="text-decoration: line-through;">${currentItem.currency} ${Math.round(oldPrice).toLocaleString()}</span>
              </p>
              <p style="margin: 5px 0 0 0; font-size: 20px; font-weight: bold; color: #15803d;">
                New Price: ${currentItem.currency} ${Math.round(newPrice).toLocaleString()}
              </p>
              <p style="margin: 8px 0 0 0; font-size: 14px; color: #f59e0b; font-weight: 600;">
                Target: ${currentItem.currency} ${Math.round(currentItem.targetPrice).toLocaleString()}
              </p>
            </div>
            
            <a href="${currentItem.targetUrl}" target="_blank" style="display: inline-block; background-color: #f97316; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600;">${ctaText}</a>
            <p style="margin-top: 20px; font-size: 12px; color: #94a3b8;">Prices are subject to availability. Book quickly before the deal expires!</p>
          </div>
        `;

        // Try AI Generation
        const aiEmail = await generateAIEmail(currentItem, oldPrice, newPrice);
        if (aiEmail && aiEmail.subject && aiEmail.htmlBody) {
          subject = aiEmail.subject;
          htmlBody = aiEmail.htmlBody;
        }

        const newEmail: MockEmail = {
          id: uuidv4(),
          userId: user.email,
          type: 'DEAL_ALERT',
          subject,
          sentAt: new Date().toISOString(),
          read: false,
          htmlBody
        };
        
        setEmails(prev => [newEmail, ...prev]);
        setLatestTriggeredEmailId(newEmail.id);
        
        if (user.tier === 'FREE') {
          setUser(prev => prev ? { ...prev, emailTokens: prev.emailTokens - 1 } : null);
        }
      } else if (user.tier === 'FREE' && user.emailTokens <= 0) {
        // Out of tokens
        const sysEmail: MockEmail = {
          id: uuidv4(),
          userId: user.email,
          type: 'SYSTEM_OUT_OF_TOKENS',
          subject: `⚠️ You're out of Email Tokens!`,
          sentAt: new Date().toISOString(),
          read: false,
          htmlBody: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h2 style="color: #0f172a; margin-top: 0;">PriceHawk Alert 🦅</h2>
              <p style="color: #475569; font-size: 16px;">We spotted a price drop for <strong>${currentItem.title}</strong>, but you're out of Email Tokens!</p>
              <p style="color: #475569; font-size: 16px;">Upgrade to PriceHawk Pro to get unlimited tracking and never miss a deal again.</p>
              <div style="margin-top: 20px;">
                <a href="#/dashboard" style="display: inline-block; background-color: #3b82f6; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600;">Upgrade to Pro</a>
              </div>
            </div>
          `
        };
        setEmails(prev => [sysEmail, ...prev]);
        setLatestTriggeredEmailId(sysEmail.id);
      }
    }

    // Only update the price if the simulation actually triggered a deal (tokens > 0 or premium)
    // When out of tokens on FREE tier, don't update price (avoids misleading green "Target Hit" state)
    const shouldUpdatePrice = user.tier === 'PREMIUM' || user.emailTokens > 0;
    if (shouldUpdatePrice) {
      setTrackedItems(prev => prev.map(item => item.id === itemId ? { ...item, currentPrice: newPrice } : item));
    }
  };

  const markEmailRead = (emailId: string) => {
    setEmails(prev => prev.map(e => e.id === emailId ? { ...e, read: true } : e));
  };

  const subscribePro = () => {
    if (!user) return;
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    setUser({
      ...user,
      tier: 'PREMIUM',
      premiumActiveUntil: nextMonth.toISOString()
    });
  };

  const cancelPro = () => {
    if (!user) return;
    setUser({
      ...user,
      tier: 'FREE',
      premiumActiveUntil: undefined,
      emailTokens: 5 // Reset for demo purposes
    });
  };

  const value = {
    user,
    trackedItems,
    emails,
    latestTriggeredEmailId,
    login,
    logout,
    addTrackedItem,
    removeTrackedItem,
    toggleFavorite,
    simulatePriceCheck,
    markEmailRead,
    subscribePro,
    cancelPro
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppStore must be used within an AppProvider');
  }
  return context;
};
