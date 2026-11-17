import { createContext, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";
import Purchases, { LOG_LEVEL } from "react-native-purchases";
import Constants from "expo-constants";

const API_KEYS = {
  apple: Constants.expoConfig?.extra?.REVENUECAT_IOS_PUBLIC_SDK_KEY || "",
  google: Constants.expoConfig?.extra?.REVENUECAT_ANDROID_PUBLIC_SDK_KEY || "",
};

const RevenueCatContext = createContext(null);

export const RevenueCatProvider = ({ children }) => {
  const [user, setUser] = useState({
    items: [],
    plus: false,
  });
  const [isReady, setIsReady] = useState(false);
  const [packages, setPackages] = useState([]);

  useEffect(() => {
    const init = async () => {
      try {
        void 0;
        Purchases.setLogLevel(LOG_LEVEL.DEBUG);

        const apiKey = Platform.OS === "ios" ? API_KEYS.apple : API_KEYS.google;
        if (!apiKey) { setIsReady(true); return; }
        Purchases.configure({ apiKey });
        void 0;

        setIsReady(true);

        Purchases.addCustomerInfoUpdateListener(updateCustomerInfo);

        void 0;
        await loadOfferings();

        void 0;
        await restorePurchasesUser();
      } catch (error) {
        void 0;
      }
    };

    init();
  }, []);

  const loadOfferings = async () => {
    try {
      void 0;
      const offerings = await Purchases.getOfferings();
      void 0;

      if (offerings?.all) {
        const allPackages = Object.values(offerings.all)
          .flatMap(offering => offering.availablePackages);
        void 0;
        setPackages(allPackages);
      } else {
        void 0;
      }
    } catch (error) {
      void 0;
    }
  };

  const updateCustomerInfo = (customerInfo) => {
    void 0;
    const newUser = {
      items: [],
      plus: false,
    };

    const entitlements = customerInfo?.entitlements?.active;
    void 0;

    if (entitlements?.plus) {
      void 0;
      newUser.items.push(entitlements.plus.identifier);
      newUser.plus = true;
    }

    setUser(newUser);
    void 0;
  };

  const purchasePackage = async (pack) => {
    if (!(Platform.OS === "ios" ? API_KEYS.apple : API_KEYS.google)) { alert("Configure seu próprio projeto RevenueCat para testar compras."); return; }
    try {
      void 0;
      const purchaseResult = await Purchases.purchasePackage(pack);
      void 0;

      const customerInfo = await Purchases.getCustomerInfo();
      void 0;
      updateCustomerInfo(customerInfo);
    } catch (err) {
      if (!err.userCancelled) {
        void 0;
        alert("Erro ao comprar o pacote. Tente novamente.");
      } else {
        void 0;
      }
    }
  };

  const restorePurchasesUser = async () => {
    if (!(Platform.OS === "ios" ? API_KEYS.apple : API_KEYS.google)) return;
    try {
      void 0;
      const customer = await Purchases.restorePurchases();
      void 0;
      updateCustomerInfo(customer);
    } catch (error) {
      void 0;
      if (error.message.includes("receipt")) {
        void 0;
      }
    }
  };

  const value = {
    user,
    packages,
    purchasePackage,
    restorePurchasesUser,
    isReady,
  };

  return (
    <RevenueCatContext.Provider value={value}>
      {children}
    </RevenueCatContext.Provider>
  );
};

export const useRevenueCat = () => {
  return useContext(RevenueCatContext);
};
