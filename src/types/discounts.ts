/**
 * Types for discount and coupon functionality
 */

export interface DiscountOption {
  coupon_key: string;
  pharmacy: string;
  pharmacy_type: "RETAIL" | "MAIL_ORDER" | "SPECIALTY";
  price: number;
  retail_price: number;
  type: "coupon" | "cash";
}

export interface CouponDetail {
  coupon_key: string;
  pharmacy: string;
  drug_name: string;
  price: number;
  retail_price: number;
  savings: number;
  instructions?: string;
  terms?: string;
  qr_code?: string;
  barcode?: string;
}

