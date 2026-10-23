/**
 * PricePulse TypeScript Definitions
 */

export interface User {
  id: string;
  email: string;
  name: string;
  token?: string;
  avatar?: string;
  joinedAt: string;
}

export interface ProductDetail {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  description: string;
  specs: Record<string, string>;
  basePrice: number;
}

export interface PlatformPrice {
  platform: string;
  price: number;
  availability: 'In Stock' | 'Low Stock' | 'Out of Stock';
  shippingCost: number;
  deliveryDays: number;
  url: string;
}

export interface PriceTrendPoint {
  date: string;
  averagePrice: number;
  prediction?: boolean;
}

export interface ProductComparisonRecord {
  id: string;
  product: ProductDetail;
  offers: PlatformPrice[];
  trends: PriceTrendPoint[];
  aiAnalysis: {
    prediction: string;
    bestTimeToBuy: 'Buy Now' | 'Wait 1 Week' | 'Wait for Sale';
    recommendationReason: string;
    buyConfidence: number; // 0-100
  };
  scrapedAt: string;
}

export interface RideOption {
  provider: 'Uber' | 'Lyft' | 'Grab' | 'Bolt' | 'DiDi' | 'Uber India' | 'Ola Cabs' | 'Rapido' | 'Namma Yatri';
  serviceType: 'Standard' | 'Premium' | 'XL' | 'Pool' | 'Bike Taxi' | 'Auto (No Commission)' | 'Uber Auto' | 'Ola Auto' | 'Cab (Premium)' | 'Uber Go (Cab)' | 'Ola Mini (Cab)';
  price: number;
  estimatedDurationMin: number;
  driverEtaMin: number;
  surgeMultiplier: number; // e.g. 1.0, 1.3
  driverRating: number;
}

export interface RideComparisonRecord {
  id: string;
  pickupAddress: string;
  dropoffAddress: string;
  distanceMiles: number;
  estimatedTravelTimeMin: number;
  options: RideOption[];
  cheapestProvider: string;
  cheapestPrice: number;
  scrapedAt: string;
}

export interface SearchHistoryItem {
  id: string;
  userId: string;
  type: 'product' | 'ride';
  queryText: string;
  resultsSummary: string;
  timestamp: string;
}

export interface SavedCompareItem {
  id: string;
  userId: string;
  type: 'product' | 'ride';
  title: string;
  targetPrice?: number;
  lastPrice: number;
  bestPlatformOrProvider: string;
  isPriceDropAlertEnabled: boolean;
  savedAt: string;
  comparisonId: string; // Resolves historical result
}

// Portfolio/Presentation Documentation types
export interface DBTable {
  name: string;
  description: string;
  columns: { name: string; type: string; constraints: string; comments?: string }[];
  indices: string[];
  relations: string[];
  sqlalchemyCode: string;
}

export interface APIEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  summary: string;
  requestBody?: string;
  successResponse: string;
  errorResponse?: string;
}
