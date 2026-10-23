import { ProductDetail, PlatformPrice, PriceTrendPoint, ProductComparisonRecord, RideOption, RideComparisonRecord, SearchHistoryItem, SavedCompareItem } from '../types';

export const MOCK_PRODUCTS: ProductDetail[] = [
  {
    id: 'prod-macbook',
    name: 'MacBook Air M3 (13-inch, 16GB, 512GB)',
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80',
    description: 'Strikingly thin and fast MacBook Air with Apple M3 chip, delivering outstanding battery life in an ultra-portable design.',
    specs: {
      'CPU': 'Apple M3 8-Core',
      'RAM': '16GB Unified',
      'SSD': '512GB NVMe',
      'Screen': '13.6-inch Liquid Retina',
      'Battery': 'Up to 18 hours'
    },
    basePrice: 1299.00
  },
  {
    id: 'prod-iphone15',
    name: 'iPhone 15 Pro Max (Titanium, 256GB)',
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=400&q=80',
    description: 'Forged in titanium and featuring the groundbreaking A17 Pro chip, a customizable Action button, and the most powerful iPhone camera system ever.',
    specs: {
      'CPU': 'A17 Pro Chip',
      'Camera': '48MP Main / 5x Telephoto',
      'Screen': '6.7-inch Super Retina XDR OLED',
      'Weight': '221g',
      'Port': 'USB-C (USB 3 speeds)'
    },
    basePrice: 1199.00
  },
  {
    id: 'prod-sonyheadphones',
    name: 'Sony WH-1000XM5 Wireless Headphones',
    category: 'Audio',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80',
    description: 'Premium wireless noise canceling headphones rewriting the rules of distraction-free listening and exceptional call clarity.',
    specs: {
      'Battery Life': 'Up to 30 Hours',
      'ANC': 'Dual Processor V1 & QN1',
      'Drivers': '30mm High Quality',
      'Bluetooth': 'V5.2 LDAC Support',
      'Weight': '250g'
    },
    basePrice: 399.00
  },
  {
    id: 'prod-applewatch',
    name: 'Apple Watch Ultra 2 (Rugged Titanium, 49mm)',
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?auto=format&fit=crop&w=400&q=80',
    description: 'The ultimate sports and adventure watch. Featuring a lightweight titanium case, extra-long battery life, and the brightest display ever.',
    specs: {
      'Case': '49mm Aerospace Titanium',
      'Battery': 'Up to 36 Hours / 72 in Low Power',
      'GPS': 'Precision Dual-Frequency',
      'Waterproof': '100m ISO standard',
      'Chip': 'S9 SiP with Double Tap'
    },
    basePrice: 799.00
  },
  {
    id: 'prod-rtx4080',
    name: 'NVIDIA GeForce RTX 4080 Super GPU (16GB)',
    category: 'Computer Components',
    imageUrl: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=400&q=80',
    description: 'Empowers extreme workflows and gaming. Driven by ultra-efficient NVIDIA Ada Lovelace architecture and dynamic DLSS 3 artificial frames generation.',
    specs: {
      'Memory': '16GB GDDR6X',
      'Bus Width': '256-bit',
      'CUDA Cores': '10240 Units',
      'TGP': '320W Recommended',
      'Outputs': '3x DisplayPort 1.4a / 1x HDMI 2.1a'
    },
    basePrice: 999.00
  }
];

export const generateProductComparison = (product: ProductDetail): ProductComparisonRecord => {
  const seedMultiplier = product.basePrice > 500 ? 0.05 : 0.08;
  
  const offers: PlatformPrice[] = [
    {
      platform: 'Amazon',
      price: Math.round((product.basePrice * (1 - seedMultiplier * 0.4)) * 100) / 100,
      availability: 'In Stock',
      shippingCost: 0.00,
      deliveryDays: 2,
      url: 'https://amazon.com'
    },
    {
      platform: 'BestBuy',
      price: Math.round(product.basePrice * 100) / 100,
      availability: 'In Stock',
      shippingCost: 0.00,
      deliveryDays: 1,
      url: 'https://bestbuy.com'
    },
    {
      platform: 'eBay',
      price: Math.round((product.basePrice * (1 - seedMultiplier * 1.2)) * 100) / 100,
      availability: 'Low Stock',
      shippingCost: 9.99,
      deliveryDays: 4,
      url: 'https://ebay.com'
    },
    {
      platform: 'Walmart',
      price: Math.round((product.basePrice * (1 - seedMultiplier * 0.2)) * 100) / 100,
      availability: 'In Stock',
      shippingCost: 0.00,
      deliveryDays: 3,
      url: 'https://walmart.com'
    },
    {
      platform: 'Target',
      price: Math.round((product.basePrice * (1 + seedMultiplier * 0.1)) * 100) / 100,
      availability: 'In Stock',
      shippingCost: 5.99,
      deliveryDays: 3,
      url: 'https://target.com'
    }
  ];

  const trends: PriceTrendPoint[] = [
    { date: 'May 01', averagePrice: Math.round(product.basePrice * 1.05) },
    { date: 'May 10', averagePrice: Math.round(product.basePrice * 1.03) },
    { date: 'May 20', averagePrice: Math.round(product.basePrice * 1.02) },
    { date: 'Jun 01', averagePrice: Math.round(product.basePrice * 0.99) },
    { date: 'Jun 10', averagePrice: Math.round(product.basePrice * 0.98) },
    { date: 'Jun 16', averagePrice: Math.round(product.basePrice * 0.96) },
    // Predictions (dotted indicator)
    { date: 'Jun 22 (Forecast)', averagePrice: Math.round(product.basePrice * 0.93), prediction: true },
    { date: 'Jun 30 (Forecast)', averagePrice: Math.round(product.basePrice * 0.90), prediction: true }
  ];

  // Best offer filter
  const bestOffer = [...offers].sort((a, b) => (a.price + a.shippingCost) - (b.price + b.shippingCost))[0];

  const waitAdvice: ('Buy Now' | 'Wait 1 Week' | 'Wait for Sale') = 
    bestOffer.price < (product.basePrice * 0.92) ? 'Buy Now' : 
    bestOffer.price < (product.basePrice * 0.96) ? 'Wait 1 Week' : 'Wait for Sale';

  const confidence = waitAdvice === 'Buy Now' ? 95 : waitAdvice === 'Wait 1 Week' ? 82 : 70;

  let aiReasoning = '';
  if (waitAdvice === 'Buy Now') {
    aiReasoning = `${bestOffer.platform} is listing this product at an extreme discount ($${bestOffer.price}) which sits ${Math.round((1 - bestOffer.price / product.basePrice) * 100)}% below MSRP. Current inventory indices hint at immediate restocking delays due to heavy holiday demand, meaning stock could clear out within hours. Highly recommend checking out immediately to claim this optimal deal.`;
  } else if (waitAdvice === 'Wait 1 Week') {
    aiReasoning = `While ${bestOffer.platform} offers a decent price tags ($${bestOffer.price}), historical pricing analysis indicates e-commerce suppliers scale down tech hardware mid-season in late June. BestBuy has scheduled inventory clearances next week, triggering expected competitor matching. Sparing another 5-7 days of tracking could yield an additional $35-$50 in savings.`;
  } else {
    aiReasoning = `The market is currently showing elevated pricing levels. Most platforms are charging close to or above the recommended retail value ($${product.basePrice}). If this purchase isn't historically urgent, we advise configuring a target price alert around $${Math.round(product.basePrice * 0.93)} and waiting for pre-season promotions.`;
  }

  return {
    id: `comp-${product.id}`,
    product,
    offers,
    trends,
    aiAnalysis: {
      prediction: `Prices are projected to drop by ${Math.round(seedMultiplier * 100)}% over the subsequent 10 days before flattening towards the end of the month.`,
      bestTimeToBuy: waitAdvice,
      recommendationReason: aiReasoning,
      buyConfidence: confidence
    },
    scrapedAt: new Date().toISOString()
  };
};

export const MOCK_RIDE_RECORD = (pickup: string, dropoff: string): RideComparisonRecord => {
  const pickupClean = pickup.trim() || 'Hitec City Cyber Towers, Hyderabad';
  const dropoffClean = dropoff.trim() || 'Gachibowli DLF Yard, Hyderabad';
  
  // High-fidelity route-specific polynomial string hashing to ensure diverse route calculations
  let hash = 0;
  const combinedStr = (pickupClean + dropoffClean).toLowerCase().trim();
  for (let i = 0; i < combinedStr.length; i++) {
    hash = (hash << 5) - hash + combinedStr.charCodeAt(i);
    hash |= 0;
  }
  const positiveHash = Math.abs(hash);

  // Dynamic distance based on the polynomial hash output (ranging from 3.5 km to 32.5 km)
  const baseDistance = 3.5 + (positiveHash % 290) / 10;
  const distanceMiles = Math.round(baseDistance * 10) / 10;
  
  // Traffic multiplier ranging from 1.6 to 2.8 minutes per km
  const trafficMultiplier = 1.6 + (positiveHash % 60) / 50;
  const estimatedTravelTimeMin = Math.round(distanceMiles * trafficMultiplier + (positiveHash % 6));

  // The frontend multiplies prices with DEFAULT_USD_TO_INR_RATE = 83.50.
  // To show highly accurate INR fares (e.g. ₹90 for Rapido, ₹150 for Namma Yatri),
  // we define target INR formulas directly and divide by 83.50.
  const USD_CONVERSION_RATE = 83.50;

  const rapidoInr = 25 + (distanceMiles * 7.5) + (positiveHash % 12);
  const uberAutoInr = 45 + (distanceMiles * 13.5) + 8 + (positiveHash % 18);
  const olaAutoInr = 48 + (distanceMiles * 14.0) + 12 + (positiveHash % 20);
  const uberGoCabInr = 100 + (distanceMiles * 22.5) + 15 + (positiveHash % 35);
  const olaMiniCabInr = 105 + (distanceMiles * 23.0) + 20 + (positiveHash % 40);

  const options: RideOption[] = [
    {
      provider: 'Rapido',
      serviceType: 'Bike Taxi',
      price: Math.round((rapidoInr / USD_CONVERSION_RATE) * 100) / 100,
      estimatedDurationMin: Math.round(estimatedTravelTimeMin * 0.72),
      driverEtaMin: Math.max(1, 1 + (positiveHash % 3)),
      surgeMultiplier: 1.0,
      driverRating: 4.8 + ((positiveHash % 20) / 100)
    },
    {
      provider: 'Uber India',
      serviceType: 'Uber Auto',
      price: Math.round((uberAutoInr / USD_CONVERSION_RATE) * 100) / 100,
      estimatedDurationMin: estimatedTravelTimeMin,
      driverEtaMin: Math.max(1, 2 + (positiveHash % 4)),
      surgeMultiplier: 1.0,
      driverRating: 4.65 + ((positiveHash % 30) / 100)
    },
    {
      provider: 'Ola Cabs',
      serviceType: 'Ola Auto',
      price: Math.round((olaAutoInr / USD_CONVERSION_RATE) * 100) / 100,
      estimatedDurationMin: estimatedTravelTimeMin,
      driverEtaMin: Math.max(1, 3 + (positiveHash % 4)),
      surgeMultiplier: 1.0,
      driverRating: 4.6 + ((positiveHash % 30) / 100)
    },
    {
      provider: 'Uber India',
      serviceType: 'Uber Go (Cab)',
      price: Math.round((uberGoCabInr / USD_CONVERSION_RATE) * 100) / 100,
      estimatedDurationMin: estimatedTravelTimeMin,
      driverEtaMin: Math.max(2, 3 + (positiveHash % 6)),
      surgeMultiplier: 1.05 + ((positiveHash % 3) * 0.05),
      driverRating: 4.7 + ((positiveHash % 25) / 100)
    },
    {
      provider: 'Ola Cabs',
      serviceType: 'Ola Mini (Cab)',
      price: Math.round((olaMiniCabInr / USD_CONVERSION_RATE) * 100) / 100,
      estimatedDurationMin: estimatedTravelTimeMin,
      driverEtaMin: Math.max(2, 4 + (positiveHash % 5)),
      surgeMultiplier: 1.05 + ((positiveHash % 4) * 0.05),
      driverRating: 4.6 + ((positiveHash % 28) / 100)
    }
  ];

  // Cheapest finder
  const sortedOptions = [...options].sort((a, b) => a.price - b.price);
  const cheapest = sortedOptions[0];

  return {
    id: `ride-${Math.random().toString(36).substr(2, 9)}`,
    pickupAddress: pickupClean,
    dropoffAddress: dropoffClean,
    distanceMiles,
    estimatedTravelTimeMin,
    options,
    cheapestProvider: `${cheapest.provider} (${cheapest.serviceType})`,
    cheapestPrice: cheapest.price,
    scrapedAt: new Date().toISOString()
  };
};

export const INITIAL_SEARCH_HISTORY: SearchHistoryItem[] = [
  {
    id: 'sh-1',
    userId: 'u-default',
    type: 'product',
    queryText: 'MacBook Air M3',
    resultsSummary: 'Best price found on Amazon at $1199.00 (MSRP $1299.00). AI Confidence: 82%',
    timestamp: '2026-06-16T14:30:00-07:00'
  },
  {
    id: 'sh-2',
    userId: 'u-default',
    type: 'product',
    queryText: 'Sony WH-1000XM5',
    resultsSummary: 'Best price found on eBay at $325.00 (MSRP $399.00). AI Confidence: 95%',
    timestamp: '2026-06-16T11:15:00-07:00'
  },
  {
    id: 'sh-3',
    userId: 'u-default',
    type: 'ride',
    queryText: 'Downtown Central to SFO Airport',
    resultsSummary: 'Lyft Standard was cheapest at $28.50. Saved commuters 12% over Uber Standard.',
    timestamp: '2026-06-15T09:44:00-07:00'
  }
];

export const INITIAL_SAVED_ITEMS: SavedCompareItem[] = [
  {
    id: 'si-1',
    userId: 'u-default',
    type: 'product',
    title: 'MacBook Air M3 (13-inch, 16GB, 512GB)',
    targetPrice: 1150.00,
    lastPrice: 1199.00,
    bestPlatformOrProvider: 'Amazon',
    isPriceDropAlertEnabled: true,
    savedAt: '2026-06-16T14:31:00-07:00',
    comparisonId: 'comp-prod-macbook'
  },
  {
    id: 'si-2',
    userId: 'u-default',
    type: 'product',
    title: 'Sony WH-1000XM5 wireless',
    targetPrice: 340.00,
    lastPrice: 325.00, // Triggered Alert!
    bestPlatformOrProvider: 'eBay',
    isPriceDropAlertEnabled: true,
    savedAt: '2026-06-16T11:20:00-07:00',
    comparisonId: 'comp-prod-sonyheadphones'
  }
];
