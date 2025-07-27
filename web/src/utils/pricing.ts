// src/utils/pricing.ts

import { SUBSCRIPTION_PLANS, PlanDetails, formatPrice } from "@/config/pricing";

export interface RenewalOption {
  plan: string;
  duration: string;
  price: number;
  newEndDate: string;
  totalDaysAfterRenewal: number;
  isCurrentPlan: boolean;
  recommended: boolean;
}

export interface CurrentSubscription {
  id: string;
  plan: string;
  endDate: string;
  remainingDays: number;
  status: string;
}

/**
 * Calculate days remaining for a subscription
 */
export const calculateDaysRemaining = (endDate: string): number => {
  if (!endDate) return 0;
  const end = new Date(endDate);
  const today = new Date();
  const diffTime = end.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

/**
 * Calculate progress percentage for a subscription
 */
export const calculateSubscriptionProgress = (
  startDate: string,
  endDate: string
): number => {
  if (!startDate || !endDate) return 0;

  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  const totalDuration = end.getTime() - start.getTime();
  if (totalDuration <= 0) return 0;

  const elapsed = now.getTime() - start.getTime();
  const progress = (elapsed / totalDuration) * 100;

  return Math.max(0, Math.min(100, progress));
};

/**
 * Calculate new end date after renewal
 */
export const calculateNewEndDate = (
  currentEndDate: string,
  additionalDays: number
): string => {
  const currentEnd = new Date(currentEndDate);
  const newEnd = new Date(currentEnd);
  newEnd.setDate(currentEnd.getDate() + additionalDays);
  return newEnd.toISOString();
};

/**
 * Generate renewal options for a subscription
 */
export const generateRenewalOptions = (
  currentSubscription: CurrentSubscription
): RenewalOption[] => {
  const renewalOptions: RenewalOption[] = [];

  Object.values(SUBSCRIPTION_PLANS).forEach((plan) => {
    const newEndDate = calculateNewEndDate(
      currentSubscription.endDate,
      plan.duration
    );
    const totalDaysAfterRenewal = calculateDaysRemaining(newEndDate);

    renewalOptions.push({
      plan: plan.id,
      duration: plan.durationText,
      price: plan.price,
      newEndDate,
      totalDaysAfterRenewal,
      isCurrentPlan: plan.id === currentSubscription.plan,
      recommended: plan.recommended || false,
    });
  });

  // Sort by price (ascending)
  return renewalOptions.sort((a, b) => a.price - b.price);
};

/**
 * Calculate subscription status color
 */
export const getSubscriptionStatusColor = (
  status: string,
  daysRemaining: number
): string => {
  switch (status.toLowerCase()) {
    case "active":
      if (daysRemaining <= 7) return "#ef4444"; // red
      if (daysRemaining <= 14) return "#eab308"; // yellow
      return "#22c55e"; // green
    case "expired":
    case "declined":
      return "#ef4444"; // red
    case "pending":
    case "queued":
      return "#64748b"; // gray
    default:
      return "#6b7280"; // neutral gray
  }
};

/**
 * Format subscription duration for display
 */
export const formatSubscriptionDuration = (days: number): string => {
  if (days >= 365) {
    const years = Math.floor(days / 365);
    const remainingDays = days % 365;
    if (remainingDays === 0) {
      return `${years} year${years > 1 ? "s" : ""}`;
    }
    return `${years} year${years > 1 ? "s" : ""} ${remainingDays} day${
      remainingDays > 1 ? "s" : ""
    }`;
  }

  if (days >= 30) {
    const months = Math.floor(days / 30);
    const remainingDays = days % 30;
    if (remainingDays === 0) {
      return `${months} month${months > 1 ? "s" : ""}`;
    }
    return `${months} month${months > 1 ? "s" : ""} ${remainingDays} day${
      remainingDays > 1 ? "s" : ""
    }`;
  }

  return `${days} day${days > 1 ? "s" : ""}`;
};

/**
 * Calculate total cost for multiple subscriptions
 */
export const calculateTotalCost = (planIds: string[]): number => {
  return planIds.reduce((total, planId) => {
    const plan = SUBSCRIPTION_PLANS[planId];
    return total + (plan?.price || 0);
  }, 0);
};

/**
 * Get upgrade recommendations based on current plan
 */
export const getUpgradeRecommendations = (
  currentPlanId: string
): PlanDetails[] => {
  const currentPlan = SUBSCRIPTION_PLANS[currentPlanId];
  if (!currentPlan) return [];

  return Object.values(SUBSCRIPTION_PLANS)
    .filter(
      (plan) => plan.price > currentPlan.price && plan.type === currentPlan.type
    )
    .sort((a, b) => a.price - b.price);
};

/**
 * Get downgrade options based on current plan
 */
export const getDowngradeOptions = (currentPlanId: string): PlanDetails[] => {
  const currentPlan = SUBSCRIPTION_PLANS[currentPlanId];
  if (!currentPlan) return [];

  return Object.values(SUBSCRIPTION_PLANS)
    .filter(
      (plan) => plan.price < currentPlan.price && plan.type === currentPlan.type
    )
    .sort((a, b) => b.price - a.price);
};

/**
 * Calculate discount percentage between two prices
 */
export const calculateDiscountPercentage = (
  originalPrice: number,
  discountedPrice: number
): number => {
  if (originalPrice <= 0) return 0;
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
};

/**
 * Format date for subscription display
 */
export const formatSubscriptionDate = (dateString: string): string => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
