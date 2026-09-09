// hooks/useSubscription.ts
import { useEffect, useState } from "react";
import { Alert, Platform } from "react-native";
import Purchases, {
  PurchasesPackage,
  CustomerInfo,
} from "react-native-purchases";
import Constants from "expo-constants";
import { authService } from "@/services/auth.service";
import { router } from "expo-router";
import i18n from "@/lib/i18n";

const isExpoGo = Constants.appOwnership === "expo";

export const useSubscription = () => {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isExpoGo) {
      initRevenueCat();
    }
  }, []);

  const initRevenueCat = async () => {
    try {
      const apiKey = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;

      if (!apiKey) {
        console.error("RevenueCat API Key is missing!");
        return;
      }

      Purchases.configure({ apiKey });

      const userInfo = await authService.getUserInfo();
      if (userInfo?.id) {
        await Purchases.logIn(userInfo.id);
      }

      loadCustomerAndOfferings();
    } catch (e) {
      console.error("Error initializing RevenueCat:", e);
    }
  };

  const loadCustomerAndOfferings = async () => {
    setIsLoading(true);
    try {
      const info = await Purchases.getCustomerInfo();
      setCustomerInfo(info);

      const offerings = await Purchases.getOfferings();
      if (offerings.current && offerings.current.availablePackages.length > 0) {
        setPackages(offerings.current.availablePackages);
      }
    } catch (e) {
      console.error("Error loading RevenueCat data:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const purchasePackage = async (pkg: PurchasesPackage) => {
    if (isExpoGo) {
      Alert.alert(
        i18n.t("subscription.alerts.expoGoTitle"),
        i18n.t("subscription.alerts.expoGoPurchaseMessage"),
      );
      return;
    }

    setIsLoading(true);
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      setCustomerInfo(customerInfo);

      if (customerInfo.entitlements.active["Kitroom Pro"]) {
        Alert.alert(
          i18n.t("subscription.alerts.successTitle"),
          i18n.t("subscription.alerts.successMessage"),
          [
            {
              text: i18n.t("subscription.alerts.ok"),
              onPress: () => router.replace("/(drawer)/(tabs)"),
            },
          ],
        );
      }
    } catch (e: any) {
      if (!e.userCancelled) {
        Alert.alert(i18n.t("subscription.alerts.errorTitle"), e.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const restorePurchases = async () => {
    if (isExpoGo) {
      Alert.alert(
        i18n.t("subscription.alerts.expoGoTitle"),
        i18n.t("subscription.alerts.expoGoRestoreMessage"),
      );
      return;
    }

    setIsLoading(true);
    try {
      const info = await Purchases.restorePurchases();
      setCustomerInfo(info);
      Alert.alert(
        i18n.t("subscription.alerts.successTitle"),
        i18n.t("subscription.alerts.restoreSuccessMessage"),
      );
    } catch (e: any) {
      Alert.alert(i18n.t("subscription.alerts.errorTitle"), e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const isElite =
    customerInfo?.entitlements.active["Kitroom Pro"] !== undefined;

  return {
    packages,
    isLoading,
    isElite,
    purchasePackage,
    restorePurchases,
  };
};
