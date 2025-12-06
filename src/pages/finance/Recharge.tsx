import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, MapPin, HelpCircle } from "lucide-react";
import { AuthService } from "@/services/AuthService";

const Recharge = () => {
  const nav = useNavigate();
  const currentUser = AuthService.getCurrentUser();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  const coinBalance = 39; // Current coin balance
  const location = "الأردن"; // User location

  const paymentMethods = [
    {
      id: "agent",
      name: "إعادة شحن وكيل الشحن",
      nameEn: "",
      icon: "👤",
      badge: "أخص",
      badgeColor: "bg-pink-500"
    },
    {
      id: "google-pay",
      name: "Google Pay",
      nameEn: "Google Pay",
      icon: "🔵"
    },
    {
      id: "visa-master-1",
      name: "Visa/Master Card",
      nameEn: "Visa/Master Card",
      icons: ["💳", "🔴"]
    },
    {
      id: "visa-master-2",
      name: "Visa/Master Card",
      nameEn: "Visa/Master Card",
      icons: ["💳", "🔴", "🟡"]
    },
    {
      id: "paypal",
      name: "Pay Pal",
      nameEn: "PayPal",
      icon: "💙"
    },
    {
      id: "google-wallet",
      name: "Google Wallet",
      nameEn: "Google Wallet",
      icon: "🔵"
    }
  ];

  const handlePayment = (methodId: string) => {
    setSelectedMethod(methodId);
    // TODO: Implement payment logic
    console.log("Selected payment method:", methodId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="relative bg-gradient-to-b from-indigo-600 to-purple-600 px-4 py-6">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => nav(-1)}
            className="w-10 h-10 rounded-xl bg-black/20 backdrop-blur-sm flex items-center justify-center border border-white/10"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
          
          <div className="flex items-center gap-6 text-sm">
            <button className="text-white/90 hover:text-white transition-all border-b-2 border-cyan-400 pb-1 font-medium">
              كوينز
            </button>
            <button className="text-white/70 hover:text-white transition-all pb-1">
              عملات اللعبة
            </button>
            <button className="text-white/70 hover:text-white transition-all pb-1">
              ماس
            </button>
          </div>

          <button className="w-10 h-10 rounded-xl bg-black/20 backdrop-blur-sm flex items-center justify-center border border-white/10">
            <div className="w-6 h-1 bg-white rounded-full"></div>
          </button>
        </div>

        {/* Balance Card */}
        <div className="relative bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-3xl p-6 mb-4 overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-40 h-40 opacity-10">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="30" r="40" fill="currentColor" className="text-yellow-400" />
            </svg>
          </div>
          <div className="absolute bottom-0 left-0 w-32 h-32 opacity-10">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <path d="M 50 10 L 90 90 L 10 90 Z" fill="currentColor" className="text-yellow-400" />
            </svg>
          </div>

          {/* FAQ Button */}
          <div className="absolute top-4 left-4">
            <button className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-orange-400 text-white text-sm font-medium">
              <HelpCircle className="w-4 h-4" />
              FAQ
            </button>
          </div>

          {/* Balance */}
          <div className="relative text-center pt-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-6xl font-bold text-gray-800">{coinBalance}</span>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-yellow-500 flex items-center justify-center">
                <span className="text-2xl">🪙</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 pb-24">
        {/* Location */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-semibold text-lg" dir="rtl">طريقة الشحن</h3>
          <div className="flex items-center gap-2 text-white/70">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{location}</span>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => handlePayment(method.id)}
              className={`w-full flex items-center justify-between bg-white/5 backdrop-blur-sm rounded-2xl p-4 border transition-all ${
                selectedMethod === method.id
                  ? "border-purple-500 bg-white/10"
                  : "border-white/10 hover:bg-white/10"
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Icon */}
                {method.icons ? (
                  <div className="flex items-center gap-1">
                    {method.icons.map((icon, idx) => (
                      <div key={idx} className="text-2xl">{icon}</div>
                    ))}
                  </div>
                ) : (
                  <div className="text-3xl">{method.icon}</div>
                )}

                {/* Name */}
                <div className="text-left">
                  <h4 className="text-white font-medium" dir="rtl">{method.name}</h4>
                  {method.nameEn && (
                    <p className="text-white/60 text-sm">{method.nameEn}</p>
                  )}
                </div>
              </div>

              {/* Badge & Arrow */}
              <div className="flex items-center gap-3">
                {method.badge && (
                  <div className={`px-3 py-1 rounded-full ${method.badgeColor} text-white text-xs font-medium`}>
                    {method.badge}
                  </div>
                )}
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </button>
          ))}
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
          <div className="flex gap-3">
            <HelpCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-blue-200 text-sm leading-relaxed" dir="rtl">
                يمكنك شحن حسابك باستخدام أي من طرق الدفع المتاحة. جميع المعاملات آمنة ومحمية.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recharge;
