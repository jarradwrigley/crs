import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  AuthState,
  User,
  RegisterData,
  NewDeviceData,
  NewSubscriptionData,
} from "@/types/auth";
import { apiClient, initializeApiClient } from "@/utils/apiClient";

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: true,
      isCheckingAuth: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          // Use apiClient which automatically includes IP
          const result = await apiClient.post("/api/auth/login", {
            email,
            password,
          });

          // console.log('RRR', result)

          if (!result.success) {
            if (result.data?.requiresVerification) {
              const error = new Error(
                result.error || "Email verification required"
              );
              (error as any).code = "EMAIL_VERIFICATION_REQUIRED";
              (error as any).email = result.data.email;
              throw error;
            }
            throw new Error(result.error || "Login failed");
          }

          if (result?.data.accessToken) {
            const token = result?.data?.accessToken;
            set({ token });

            // Initialize API client with token
            initializeApiClient(token);

            // Fetch user data immediately after login
            await get().fetchUserData();
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true });
        try {
          const formData = new FormData();
          Object.entries(data).forEach(([key, value]) => {
            if (key === "files") {
              (value as File[]).forEach((file, index) => {
                formData.append(`file_${index}`, file);
              });
            } else {
              formData.append(key, value as string);
            }
          });

          // Use apiClient which automatically includes IP in FormData
          const result = await apiClient.post("/api/auth/register", formData);

          console.log('REGISTER Ressss', result)

          if (!result.success) {
            throw new Error(result?.error || "Registration failed");
          }

          if (result.success && result.data?.requiresVerification) {
            const error = new Error(
              result.message ||
                "Registration successful! Please verify your email."
            );
            (error as any).code = "REGISTRATION_SUCCESS_VERIFICATION_REQUIRED";
            (error as any).email = result.data.email;
            throw error;
          }

          const token = result?.data?.accessToken;
          set({ token });

          // Initialize API client with token
          initializeApiClient(token);

          // Fetch user data immediately after registration
          await get().fetchUserData();
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({ user: null, token: null, isLoading: false });
        apiClient.removeAuthToken();
      },

      fetchUserData: async () => {
        const { token, isCheckingAuth } = get();

        if (!token || isCheckingAuth) {
          set({ isLoading: false });
          return;
        }

        try {
          initializeApiClient(token);
          const userResult = await apiClient.get("/api/user");

          if (!userResult.success) {
            throw new Error("User Profile fetch failed");
          }

          set({
            user: userResult?.data,
            isLoading: false,
          });
        } catch (error) {
          console.error("Fetch user data failed:", error);
          set({ user: null, token: null, isLoading: false });
          throw error;
        }
      },

      retrieveUserData: async () => {
        const { token, isCheckingAuth } = get();

        if (!token || isCheckingAuth) {
          set({ isLoading: false });
          return;
        }

        try {
          initializeApiClient(token);
          const userResult = await apiClient.get("/api/user");

          if (!userResult.success) {
            throw new Error("User Profile retrieval failed");
          }

          return userResult;
        } catch (error) {
          console.error("Retrieving user data failed:", error);
          set({ user: null, token: null, isLoading: false });
          throw error;
        }
      },

      checkAuth: async () => {
        const { token, isCheckingAuth } = get();

        if (isCheckingAuth) {
          console.log("Auth check already in progress, skipping...");
          return;
        }

        if (!token) {
          set({ user: null, isLoading: false });
          return;
        }

        set({ isLoading: true, isCheckingAuth: true });

        try {
          initializeApiClient(token);
          const userResult = await apiClient.get("/api/user");

          if (!userResult.success) {
            console.log("Token invalid, clearing auth state");
            set({
              user: null,
              token: null,
              isLoading: false,
              isCheckingAuth: false,
            });
            return;
          }

          set({
            user: userResult?.data,
            isLoading: false,
            isCheckingAuth: false,
          });
        } catch (error) {
          console.error("Auth check failed:", error);
          set({
            user: null,
            token: null,
            isLoading: false,
            isCheckingAuth: false,
          });
        }
      },

      checkOnboarding: async (imei: string) => {
        const { token, isCheckingAuth } = get();

        if (!token || isCheckingAuth) {
          set({ isLoading: false });
          return;
        }

        console.log("Checking onboarding for IMEI:", imei);

        try {
          initializeApiClient(token);
          const result = await apiClient.post("/api/device/check", { imei });

          if (!result.success) {
            throw new Error(result.error || "Device check failed");
          }

          set({ isLoading: false });
          return result;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      setupDevice: async (imei: string, deviceName: string) => {
        const { token, isCheckingAuth } = get();

        if (!token || isCheckingAuth) {
          set({ isLoading: false });
          return;
        }

        try {
          initializeApiClient(token);
          const result = await apiClient.post("/api/device/setup", {
            imei,
            deviceName,
          });

          if (!result.success) {
            throw new Error(result.error || "OTP Setup failed");
          }

          set({ isLoading: false });
          return result;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      activateSubscription: async (
        subscriptionId: string,
        totpCode: string,
        imei: string
      ) => {
        const { token } = get();

        if (!token) {
          throw new Error("No authentication token");
        }

        try {
          initializeApiClient(token);
          const result = await apiClient.post("/api/subscriptions/activate", {
            subscriptionId,
            imei,
            totpCode,
          });

          if (!result.success) {
            return {
              success: false,
              error: result.error || "Failed to activate subscription",
            };
          }

          return {
            success: true,
            data: result.data,
          };
        } catch (error) {
          console.error("Activate subscription error:", error);
          return {
            success: false,
            error: "Failed to activate subscription",
          };
        }
      },

      fetchOptionsById: async (subscriptionId: string) => {
        const { token, isCheckingAuth } = get();

        if (!token || isCheckingAuth) {
          set({ isLoading: false });
          return;
        }

        try {
          initializeApiClient(token);
          const result = await apiClient.get(
            `/api/subscriptions/${subscriptionId}/options`
          );

          if (!result.success) {
            throw new Error(result.error || "Options fetch failed");
          }

          set({ isLoading: false });
          return result;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      checkEncryption: async (ip: string) => {
        const { token, isCheckingAuth } = get();

        if (!token || isCheckingAuth) {
          set({ isLoading: false });
          return;
        }

        try {
          initializeApiClient(token);
          const result = await apiClient.post("/api/device/check/encryption", {
            ip,
          });

          if (!result.success) {
            throw new Error(result.error || "IP check fetch failed");
          }

          set({ isLoading: false });
          return result;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      renewSubscription: async (
        subscriptionId: string,
        newPlan: string,
        paymentMethod: string
      ) => {
        const { token, isCheckingAuth } = get();

        if (!token || isCheckingAuth) {
          set({ isLoading: false });
          return;
        }

        try {
          initializeApiClient(token);
          const result = await apiClient.post(
            `/api/subscriptions/${subscriptionId}/renew`,
            {
              subscriptionId,
              newPlan,
              paymentMethod,
            }
          );

          if (!result.success) {
            throw new Error(result.error || "Subscription renewal failed");
          }

          set({ isLoading: false });
          return result;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      searchDevice: async (debouncedSearchQuery: any) => {
        const { token, isCheckingAuth } = get();

        if (!token || isCheckingAuth) {
          set({ isLoading: false });
          return;
        }

        try {
          initializeApiClient(token);
          const result = await apiClient.get(
            `/api/device/search?q=${encodeURIComponent(debouncedSearchQuery)}`
          );

          if (!result.success) {
            throw new Error(result.error || "Search failed");
          }

          set({ isLoading: false });
          return result;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      addNewDevice: async (data: NewDeviceData) => {
        const { token, isCheckingAuth } = get();

        if (!token || isCheckingAuth) {
          set({ isLoading: false });
          return;
        }

        try {
          const formData = new FormData();
          Object.entries(data).forEach(([key, value]) => {
            if (key === "files") {
              (value as File[]).forEach((file, index) => {
                formData.append(`file_${index}`, file);
              });
            } else {
              formData.append(key, value as string);
            }
          });

          initializeApiClient(token);
          const result = await apiClient.post("/api/device/add", formData);

          if (!result.success) {
            throw new Error(result.error || "Adding New Device failed");
          }

          set({ isLoading: false });
          return result;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      addSubscription: async (data: NewSubscriptionData) => {
        const { token, isCheckingAuth } = get();

        if (!token || isCheckingAuth) {
          set({ isLoading: false });
          return;
        }

        try {
          const formData = new FormData();
          Object.entries(data).forEach(([key, value]) => {
            if (key === "files") {
              (value as File[]).forEach((file, index) => {
                formData.append(`file_${index}`, file);
              });
            } else {
              formData.append(key, value as string);
            }
          });

          initializeApiClient(token);
          const result = await apiClient.post(
            "/api/device/subscribe",
            formData
          );

          if (!result.success) {
            throw new Error(result.error || "Adding Subscription failed");
          }

          set({ isLoading: false });
          return result;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      checkActiveStatus: async () => {
        const { token, isCheckingAuth } = get();

        if (!token || isCheckingAuth) {
          throw new Error("No authentication token available");
        }

        try {
          const response = await fetch("/api/subscriptions/status", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          const result = await response.json();

          if (!result.success) {
            throw new Error(result.error || "Failed to check active status");
          }

          return result;
        } catch (error) {
          console.error("Check active status error:", error);
          throw error;
        }
      },
    }),
    {
      name: "auth-storage",
    }
  )
);
