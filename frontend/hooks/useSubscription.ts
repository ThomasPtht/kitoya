// hooks/useSubscription.ts
import { useEffect, useState } from "react";
import { Alert, Platform } from "react-native";
import Purchases, {
  PurchasesPackage,
  CustomerInfo,
} from "react-native-purchases";
import Constants from "expo-constants";

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

      // RevenueCat gère la clé universelle (que ce soit pour iOS ou Android en test ou prod)
      Purchases.configure({ apiKey });

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
        "Expo Go Mode",
        "Native in-app purchases do not work in Expo Go. Please create an EAS build to test.",
      );
      return;
    }

    setIsLoading(true);
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      setCustomerInfo(customerInfo);

      if (customerInfo.entitlements.active["kitoya_elite"]) {
        Alert.alert("Success", "Your subscription is now active. Thank you!");
      }
    } catch (e: any) {
      if (!e.userCancelled) {
        Alert.alert("Error", e.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const restorePurchases = async () => {
    if (isExpoGo) {
      Alert.alert("Expo Go Mode", "Cannot restore purchases inside Expo Go.");
      return;
    }

    setIsLoading(true);
    try {
      const info = await Purchases.restorePurchases();
      setCustomerInfo(info);
      Alert.alert("Success", "Purchases successfully restored.");
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const isElite =
    customerInfo?.entitlements.active["kitoya_elite"] !== undefined;

  return {
    packages,
    isLoading,
    isElite,
    purchasePackage,
    restorePurchases,
  };
};
