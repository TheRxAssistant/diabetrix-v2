import React, { useState } from "react";
import { DiscountOption } from "../../../types/discounts";

interface DrugPharmaciesTabProps {
  discount_options: DiscountOption[];
  is_loading: boolean;
}

const DrugPharmaciesTab: React.FC<DrugPharmaciesTabProps> = ({
  discount_options,
  is_loading,
}) => {
  // Filter for coupon options (from GoodRx)
  const pharmacy_coupon_options = discount_options.filter(
    (option) => option.type === "coupon"
  );

  // State for showing more pharmacies
  const [show_all_pharmacies, set_show_all_pharmacies] = useState(false);

  // Get displayed pharmacies based on show_all_pharmacies state
  const displayed_pharmacies = show_all_pharmacies
    ? pharmacy_coupon_options
    : pharmacy_coupon_options.slice(0, 9);
  const has_more_pharmacies = pharmacy_coupon_options.length > 9;

  // App configuration for styling
  const app_config = {
    button_background_color: "#3B82F6",
    button_text_color: "#FFFFFF",
    primary_color: "#3B82F6",
    secondary_color: "#6B7280",
  };

  if (is_loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {displayed_pharmacies.map((option, index) => (
          <div
            key={option.coupon_key}
            className={`relative bg-white rounded-lg border p-4 transition-all hover:bg-gray-50 ${
              index === 0 ? "border-yellow-400 bg-yellow-50" : "border-gray-200"
            }`}
          >
            {/* Best Price Badge */}
            {index === 0 && (
              <div className="absolute -top-1.5 -right-1.5 bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full text-xs font-bold z-10">
                BEST
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">
                      {option.pharmacy}
                    </h4>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded font-medium mt-1 inline-block ${
                        option.pharmacy_type === "RETAIL"
                          ? "bg-green-100 text-green-700"
                          : option.pharmacy_type === "MAIL_ORDER"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {option.pharmacy_type.replace("_", " ")}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      ${option.price?.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 line-through">
                      ${option.retail_price?.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Show More/Less Button */}
      {has_more_pharmacies && (
        <div className="flex justify-center pt-4">
          <button
            onClick={() => set_show_all_pharmacies(!show_all_pharmacies)}
            className="flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-colors hover:opacity-80"
            style={{
              backgroundColor: app_config.button_background_color,
              color: app_config.button_text_color,
            }}
          >
            <span>{show_all_pharmacies ? "Show Less ▲" : "Show More ▼"}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default DrugPharmaciesTab;
