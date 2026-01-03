export type DyadConfig = {
  app: {
    name: string;
    package: string;
    version: string;
    minSdk: number;
    targetSdk: number;
  };
  features: {
    voice_chat: {
      enabled: boolean;
      quality: "hd" | "high" | "medium" | "low";
      max_participants: number;
      recording: boolean;
    };
    gift_system: {
      enabled: boolean;
      animations: "lottie" | "basic";
      categories: string[];
      real_time_notifications: boolean;
    };
    virtual_economy: {
      enabled: boolean;
      currency: "coins" | "gems" | string;
      exchange_rate: number;
      withdrawal: boolean;
      earning_system: boolean;
    };
    live_matching: {
      enabled: boolean;
      algorithm: "ai_based" | "simple" | string;
      factors: string[];
      video_call: boolean;
      private_rooms: boolean;
    };
    monetization: {
      coin_purchases: boolean;
      subscriptions: boolean;
      gift_commission: number;
      withdrawal_fee: number;
    };
  };
  firebase: {
    enabled: boolean;
    auth: boolean;
    firestore: boolean;
    storage: boolean;
    messaging: boolean;
    analytics: boolean;
  };
  payment_gateways: {
    stripe: boolean;
    paypal: boolean;
    google_pay: boolean;
    apple_pay: boolean;
    in_app_purchases: boolean;
  };
};

export const dyadConfig: DyadConfig = {
  app: {
    name: "Elite Voice Chat",
    package: "com.elitevoicechat.android",
    version: "1.0.0",
    minSdk: 24,
    targetSdk: 34,
  },
  features: {
    voice_chat: {
      enabled: true,
      quality: "hd",
      max_participants: 50,
      recording: true,
    },
    gift_system: {
      enabled: true,
      animations: "lottie",
      categories: ["popular", "expensive", "limited"],
      real_time_notifications: true,
    },
    virtual_economy: {
      enabled: true,
      currency: "coins",
      exchange_rate: 100,
      withdrawal: true,
      earning_system: true,
    },
    live_matching: {
      enabled: true,
      algorithm: "ai_based",
      factors: ["interests", "location", "behavior", "compatibility"],
      video_call: true,
      private_rooms: true,
    },
    monetization: {
      coin_purchases: true,
      subscriptions: true,
      gift_commission: 0.3,
      withdrawal_fee: 0.1,
    },
  },
  firebase: {
    enabled: true,
    auth: true,
    firestore: true,
    storage: true,
    messaging: true,
    analytics: true,
  },
  payment_gateways: {
    stripe: true,
    paypal: true,
    google_pay: true,
    apple_pay: false,
    in_app_purchases: true,
  },
};