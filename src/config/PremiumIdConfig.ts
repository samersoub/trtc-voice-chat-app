
export const PremiumIdConfig = {
    // Ordered from shortest (most valuable) to longest
    rules: [
        { length: 2, minLevel: 60, priceWeek: 50000, priceMonth: 150000 },
        { length: 3, minLevel: 40, priceWeek: 20000, priceMonth: 60000 },
        { length: 4, minLevel: 30, priceWeek: 10000, priceMonth: 30000 },
        { length: 5, minLevel: 25, priceWeek: 5000, priceMonth: 15000 }, // Gap filler
        { length: 6, minLevel: 15, priceWeek: 3000, priceMonth: 8000 },
        { length: 7, minLevel: 0, priceWeek: 1000, priceMonth: 3000 },
    ],

    getRuleForId(id: string) {
        const len = id.length;
        return this.rules.find(r => r.length === len);
    },

    canUserBuy(userLevel: number, id: string): { allowed: boolean; minLevel?: number; rule?: typeof PremiumIdConfig.rules[0] } {
        const rule = this.getRuleForId(id);
        if (!rule) return { allowed: false }; // Length not supported (e.g. 1 or >7)

        if (userLevel >= rule.minLevel) {
            return { allowed: true, rule };
        }
        return { allowed: false, minLevel: rule.minLevel, rule };
    }
};
