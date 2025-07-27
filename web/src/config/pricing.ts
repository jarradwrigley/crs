// src/config/pricing.ts

export interface PlanFeature {
  text: string;
  included: boolean;
}

export interface PlanDetails {
  id: string;
  name: string;
  displayName: string;
  price: number;
  duration: number; // in days
  durationText: string;
  category: "basic" | "premium" | "enterprise" | "suite";
  version: "v4" | "v5";
  type: "mobile" | "full-suite";
  features: PlanFeature[];
  popular?: boolean;
  recommended?: boolean;
}

export const SUBSCRIPTION_PLANS: Record<string, PlanDetails> = {
  "mobile-v4-basic": {
    id: "mobile-v4-basic",
    name: "Mobile Only v4 - Basic",
    displayName: "Mobile v4 Basic",
    price: 1249.99,
    duration: 30,
    durationText: "30 days",
    category: "basic",
    version: "v4",
    type: "mobile",
    features: [
      { text: "Basic mobile encryption", included: true },
      { text: "30-day validity", included: true },
      { text: "Standard support", included: true },
      { text: "Desktop access", included: false },
      { text: "Premium features", included: false },
    ],
  },
  "mobile-v4-premium": {
    id: "mobile-v4-premium",
    name: "Mobile Only v4 - Premium",
    displayName: "Mobile v4 Premium",
    price: 1425.49,
    duration: 60,
    durationText: "60 days",
    category: "premium",
    version: "v4",
    type: "mobile",
    popular: true,
    features: [
      { text: "Premium mobile encryption", included: true },
      { text: "60-day validity", included: true },
      { text: "Priority support", included: true },
      { text: "Advanced security", included: true },
      { text: "Desktop access", included: false },
    ],
  },
  "mobile-v4-enterprise": {
    id: "mobile-v4-enterprise",
    name: "Mobile Only v4 - Enterprise",
    displayName: "Mobile v4 Enterprise",
    price: 1999.99,
    duration: 90,
    durationText: "90 days",
    category: "enterprise",
    version: "v4",
    type: "mobile",
    features: [
      { text: "Enterprise encryption", included: true },
      { text: "90-day validity", included: true },
      { text: "24/7 support", included: true },
      { text: "Advanced security", included: true },
      { text: "Priority processing", included: true },
    ],
  },
  "mobile-v5-basic": {
    id: "mobile-v5-basic",
    name: "Mobile Only v5 - Basic",
    displayName: "Mobile v5 Basic",
    price: 2395.49,
    duration: 30,
    durationText: "30 days",
    category: "basic",
    version: "v5",
    type: "mobile",
    features: [
      { text: "V5 encryption technology", included: true },
      { text: "30-day validity", included: true },
      { text: "Enhanced security", included: true },
      { text: "Standard support", included: true },
      { text: "Desktop access", included: false },
    ],
  },
  "mobile-v5-premium": {
    id: "mobile-v5-premium",
    name: "Mobile Only v5 - Premium",
    displayName: "Mobile v5 Premium",
    price: 2629.99,
    duration: 60,
    durationText: "60 days",
    category: "premium",
    version: "v5",
    type: "mobile",
    recommended: true,
    features: [
      { text: "V5 premium encryption", included: true },
      { text: "60-day validity", included: true },
      { text: "Advanced security", included: true },
      { text: "Priority support", included: true },
      { text: "Enhanced features", included: true },
    ],
  },
  "full-suite-basic": {
    id: "full-suite-basic",
    name: "Full Suite - Basic",
    displayName: "Full Suite Basic",
    price: 2789.99,
    duration: 60,
    durationText: "60 days",
    category: "basic",
    version: "v4",
    type: "full-suite",
    features: [
      { text: "Complete security suite", included: true },
      { text: "60-day validity", included: true },
      { text: "Desktop & mobile access", included: true },
      { text: "All platforms supported", included: true },
      { text: "Standard support", included: true },
    ],
  },
  "full-suite-premium": {
    id: "full-suite-premium",
    name: "Full Suite - Premium",
    displayName: "Full Suite Premium",
    price: 3145.49,
    duration: 90,
    durationText: "90 days",
    category: "premium",
    version: "v5",
    type: "full-suite",
    features: [
      { text: "Premium security suite", included: true },
      { text: "90-day validity", included: true },
      { text: "All platforms supported", included: true },
      { text: "Premium features", included: true },
      { text: "24/7 priority support", included: true },
    ],
  },
};

// Helper functions
export const getPlanById = (planId: string): PlanDetails | undefined => {
  return SUBSCRIPTION_PLANS[planId];
};

export const getPlanDisplayName = (planId: string): string => {
  return SUBSCRIPTION_PLANS[planId]?.displayName || planId;
};

export const getPlanPrice = (planId: string): number => {
  return SUBSCRIPTION_PLANS[planId]?.price || 0;
};

export const getPlanDuration = (planId: string): number => {
  return SUBSCRIPTION_PLANS[planId]?.duration || 30;
};

export const formatPrice = (
  price: number,
  currency: string = "USD"
): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(price);
};

export const getPlansForRegistration = (): PlanDetails[] => {
  return Object.values(SUBSCRIPTION_PLANS);
};

export const getPopularPlans = (): PlanDetails[] => {
  return Object.values(SUBSCRIPTION_PLANS).filter((plan) => plan.popular);
};

export const getRecommendedPlans = (): PlanDetails[] => {
  return Object.values(SUBSCRIPTION_PLANS).filter((plan) => plan.recommended);
};

export const getPlansByType = (
  type: "mobile" | "full-suite"
): PlanDetails[] => {
  return Object.values(SUBSCRIPTION_PLANS).filter((plan) => plan.type === type);
};

export const getPlansByVersion = (version: "v4" | "v5"): PlanDetails[] => {
  return Object.values(SUBSCRIPTION_PLANS).filter(
    (plan) => plan.version === version
  );
};

// Legacy compatibility - for components that still use the old format
export const getLegacySubscriptionPlans = () => {
  return Object.values(SUBSCRIPTION_PLANS).map((plan) => ({
    id: plan.id,
    name: plan.name,
    price: `$${plan.price}/month`,
    features: plan.features.filter((f) => f.included).map((f) => f.text),
  }));
};
