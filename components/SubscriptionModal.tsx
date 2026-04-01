"use client";

import { X } from "lucide-react";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const tariffs = [
  {
    name: "Weekly Access",
    price: "$4.99",
    description: "7 days full access",
    popular: false,
  },
  {
    name: "Monthly Pro",
    price: "$9.99",
    description: "30 days premium access",
    popular: true,
  },
];

export default function SubscriptionModal({ isOpen, onClose }: SubscriptionModalProps) {
  const handlePayment = async (tariff: string, invoiceId: string) => {
    const tg = (window as any).Telegram?.WebApp;

    if (tg && tg.openInvoice) {
      tg.openInvoice(invoiceId, (status: string) => {
        console.log(`Payment status: ${status}`);
        if (status === "paid") {
          alert(`Payment for "${tariff}" successful!`);
          onClose();
        }
      });
    } else {
      // Fallback for browser testing
      alert(`Telegram WebApp not available. Test payment: ${tariff} - ${invoiceId}`);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Background overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000] transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="fixed bottom-0 left-0 right-0 z-[2001]
                   bg-white/10 backdrop-blur-xl
                   border-t border-white/20
                   rounded-t-3xl
                   transform transition-transform duration-300 ease-out
                   animate-slide-up"
      >
        {/* Header with close button */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Choose a Plan</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X size={24} className="text-white" />
          </button>
        </div>

        {/* Tariff list */}
        <div className="p-6 space-y-4">
          {tariffs.map((tariff) => (
            <div
              key={tariff.name}
              className={`relative p-5 rounded-2xl border transition-all duration-300
                         ${tariff.popular
                           ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-400/50"
                           : "bg-white/5 border-white/10 hover:border-white/30"
                         }`}
            >
              {tariff.popular && (
                <span className="absolute -top-3 left-4 px-3 py-1 text-xs font-semibold
                                 bg-cyan-500 text-black rounded-full">
                  Best Value
                </span>
              )}

              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-bold text-white">{tariff.name}</h3>
                  <p className="text-sm text-gray-400">{tariff.description}</p>
                </div>
                <span className="text-2xl font-bold text-cyan-400">{tariff.price}</span>
              </div>

              {/* Payment buttons */}
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => handlePayment(tariff.name, `invoice_${tariff.name.toLowerCase().replace(/\s+/g, '_')}_stars`)}
                  className="flex-1 py-3 px-4 rounded-xl
                             bg-gradient-to-r from-pink-500 to-purple-500
                             text-white font-semibold
                             hover:from-pink-600 hover:to-purple-600
                             transition-all duration-300
                             active:scale-95"
                >
                  Pay with Stars ⭐
                </button>
                <button
                  onClick={() => handlePayment(tariff.name, `invoice_${tariff.name.toLowerCase().replace(/\s+/g, '_')}_ton`)}
                  className="flex-1 py-3 px-4 rounded-xl
                             bg-gradient-to-r from-blue-500 to-cyan-500
                             text-white font-semibold
                             hover:from-blue-600 hover:to-cyan-600
                             transition-all duration-300
                             active:scale-95"
                >
                  Pay with TON 💎
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom spacing for safe area */}
        <div className="h-6" />
      </div>
    </>
  );
}
