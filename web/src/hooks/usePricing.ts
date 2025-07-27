// src/hooks/usePricing.ts

import { useMemo } from "react";
import {
  SUBSCRIPTION_PLANS,
  getPlanById,
  getPlanDisplayName,
  getPlanPrice,
  getPlanDuration,
  formatPrice,
  PlanDetails,
} from "@/config/pricing";
import {
  calculateDaysRemaining,
  calculateSubscriptionProgress,
  generateRenewalOptions,
  getSubscriptionStatusColor,
  formatSubscriptionDuration,
  calculateTotalCost,
  getUpgradeRecommendations,
  getDowngradeOptions,
  RenewalOption,
  CurrentSubscription,
} from "@/utils/pricing";

export interface UsePricingOptions {
  currency?: string;
  locale?: string;
}

export interface UsePricingReturn {
  // Plan utilities
  getPlan: (planId: string) => PlanDetails | undefined;
  getDisplayName: (planId: string) => string;
  getPrice: (planId: string) => number;
  getDuration: (planId: string) => number;
  formatPrice: (price: number) => string;

  // Subscription utilities
  calculateProgress: (startDate: string, endDate: string) => number;
  calculateDaysLeft: (endDate: string) => number;
  getStatusColor: (status: string, daysRemaining: number) => string;
  formatDuration: (days: number) => string;

  // Renewal utilities
  generateRenewals: (subscription: CurrentSubscription) => RenewalOption[];
  getUpgrades: (currentPlanId: string) => PlanDetails[];
  getDowngrades: (currentPlanId: string) => PlanDetails[];

  // Cost utilities
  calculateTotal: (planIds: string[]) => number;

  // All plans
  allPlans: PlanDetails[];
  mobilePlans: PlanDetails[];
  suitePlans: PlanDetails[];
  popularPlans: PlanDetails[];
  recommendedPlans: PlanDetails[];
}

export const usePricing = (
  options: UsePricingOptions = {}
): UsePricingReturn => {
  const { currency = "USD", locale = "en-US" } = options;

  const formatPriceWithOptions = useMemo(() => {
    return (price: number) => formatPrice(price, currency);
  }, [currency]);

  const allPlans = useMemo(() => Object.values(SUBSCRIPTION_PLANS), []);

  const mobilePlans = useMemo(
    () => allPlans.filter((plan) => plan.type === "mobile"),
    [allPlans]
  );

  const suitePlans = useMemo(
    () => allPlans.filter((plan) => plan.type === "full-suite"),
    [allPlans]
  );

  const popularPlans = useMemo(
    () => allPlans.filter((plan) => plan.popular),
    [allPlans]
  );

  const recommendedPlans = useMemo(
    () => allPlans.filter((plan) => plan.recommended),
    [allPlans]
  );

  return {
    // Plan utilities
    getPlan: getPlanById,
    getDisplayName: getPlanDisplayName,
    getPrice: getPlanPrice,
    getDuration: getPlanDuration,
    formatPrice: formatPriceWithOptions,

    // Subscription utilities
    calculateProgress: calculateSubscriptionProgress,
    calculateDaysLeft: calculateDaysRemaining,
    getStatusColor: getSubscriptionStatusColor,
    formatDuration: formatSubscriptionDuration,

    // Renewal utilities
    generateRenewals: generateRenewalOptions,
    getUpgrades: getUpgradeRecommendations,
    getDowngrades: getDowngradeOptions,

    // Cost utilities
    calculateTotal: calculateTotalCost,

    // Plan collections
    allPlans,
    mobilePlans,
    suitePlans,
    popularPlans,
    recommendedPlans,
  };
};
