export const PRODUCT_STATUS = {
  AVAILABLE: 'AVAILABLE',
  UNAVAILABLE: 'UNAVAILABLE',
  RESERVED: 'RESERVED',
  SOLD: 'SOLD'
} as const;

export const SALE_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  DELIVERED: 'DELIVERED'
} as const;

export const DELIVERY_STATUS = {
  PENDING: 'PENDING',
  IN_TRANSIT: 'IN_TRANSIT',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED'
} as const;

export type ProductStatus = typeof PRODUCT_STATUS[keyof typeof PRODUCT_STATUS];
export type SaleStatus = typeof SALE_STATUS[keyof typeof SALE_STATUS];
export type DeliveryStatus = typeof DELIVERY_STATUS[keyof typeof DELIVERY_STATUS]; 