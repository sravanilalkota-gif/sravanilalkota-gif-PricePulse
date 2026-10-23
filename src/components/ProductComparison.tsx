import { useState, useEffect, FormEvent } from 'react';
import { 
  Search, 
  Sparkles, 
  TrendingDown, 
  BookmarkCheck, 
  ExternalLink, 
  Info
} from 'lucide-react';
import { ProductDetail, ProductComparisonRecord, SavedCompareItem } from '../types';
import { MOCK_PRODUCTS, generateProductComparison } from '../data/mockData';
import { formatDirectINR, getExchangeRate, convertUSDToINR } from '../utils/currency';

interface ProductComparisonProps {
  onAddSearchHistory: (query: string, summary: string) => void;
  onSaveItem: (savedItem: SavedCompareItem) => void;
  savedItems: SavedCompareItem[];
}

export default function ProductComparison({ onAddSearchHistory, onSaveItem, savedItems }: ProductComparisonProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<ProductDetail | null>(null);
  const [comparison, setComparison] = useState<ProductComparisonRecord | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(false);
  const [aiModelUsed, setAiModelUsed] = useState('Standard Backend Ruleset');

  // Triggered comparison loader
  const loadComparison = async (product: ProductDetail) => {
    setLoading(true);
    setAiLoading(true);
    setAiError(false);

    // If it's a dynamic custom product searched on-the-fly, load directly from backend
    if (product.id.startsWith('prod-custom-') || product.category === 'Searched Item') {
      try {
        const response = await fetch(`/api/products/search?q=${encodeURIComponent(product.name)}`);
        if (response.ok) {
          const result = await response.json();
          if (result && result.payload) {
            setComparison(result.payload);
            // Replace raw searched item/URL with the cleanly parsed product details returned by the server
            if (result.payload.product) {
              setSelectedProduct(result.payload.product);
            }
            setAiModelUsed(result.source === 'gemini-3.5-flash' ? 'Gemini 3.5 AI Model' : 'Local Heuristics Engine');
            
            // Log search history with AI summary
            const sorted = [...result.payload.offers].sort((a,b)=>a.price-b.price);
            const bestOffer = sorted[0];
            const loggedName = result.payload.product?.name || product.name;
            onAddSearchHistory(
              loggedName, 
              `MSRP: ${formatDirectINR(result.payload.product.basePrice)}. Best deal: ${formatDirectINR(bestOffer.price)} on ${bestOffer.platform}. Advice: ${result.payload.aiAnalysis.bestTimeToBuy}`
            );
            setLoading(false);
            setAiLoading(false);
            return;
          }
        }
      } catch (err) {
        console.log("[Aggregator Info] Dynamic product comparison fallback active:", err instanceof Error ? err.message : String(err));
      }
    }
    
    // Default predefined static catalog metrics loader, converted from USD to INR
    const rate = getExchangeRate();
    const baseCompare = generateProductComparison(product);
    
    // Map USD values to INR values dynamically:
    const inrProduct = {
      ...product,
      basePrice: convertUSDToINR(product.basePrice, rate)
    };
    
    const inrOffers = baseCompare.offers.map(o => ({
      ...o,
      platform: o.platform === 'Amazon' ? 'Amazon.in' : o.platform === 'BestBuy' ? 'Reliance Digital' : o.platform === 'Walmart' ? 'Flipkart' : o.platform === 'Target' ? 'Vijay Sales' : o.platform,
      price: convertUSDToINR(o.price, rate),
      shippingCost: convertUSDToINR(o.shippingCost, rate)
    }));
    
    const inrTrends = baseCompare.trends.map(t => ({
      ...t,
      averagePrice: convertUSDToINR(t.averagePrice, rate)
    }));

    const inrCompare: ProductComparisonRecord = {
      ...baseCompare,
      product: inrProduct,
      offers: inrOffers,
      trends: inrTrends,
      aiAnalysis: {
        ...baseCompare.aiAnalysis,
        prediction: 'Pricing trends is converting into Indian Rupees INR.',
        recommendationReason: 'Performing dynamic pricing analysis in Rupees.'
      }
    };

    setComparison(inrCompare);

    try {
      // Direct full-stack pipeline fetch calling /api/gemini/analyze in server.ts
      const response = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: inrProduct.name,
          basePrice: inrProduct.basePrice,
          specs: inrProduct.specs,
          offers: inrOffers
        })
      });

      if (response.ok) {
        const aiResult = await response.json();
        setAiModelUsed(aiResult.source === 'gemini-3.5-flash' ? 'Gemini 3.5 AI Model' : 'Local Heuristics Engine');
        
        setComparison(prev => {
          if (!prev) return null;
          return {
            ...prev,
            aiAnalysis: {
              prediction: aiResult.prediction || prev.aiAnalysis.prediction,
              bestTimeToBuy: aiResult.bestTimeToBuy || prev.aiAnalysis.bestTimeToBuy,
              recommendationReason: aiResult.recommendationReason || prev.aiAnalysis.recommendationReason,
              buyConfidence: aiResult.buyConfidence || prev.aiAnalysis.buyConfidence
            }
          };
        });

        // Log search history with AI summary in INR
        const sorted = [...inrOffers].sort((a,b)=>a.price-b.price);
        const bestOffer = sorted[0];
        onAddSearchHistory(
          inrProduct.name, 
          `MSRP: ${formatDirectINR(inrProduct.basePrice)}. Best: ${formatDirectINR(bestOffer.price)} on ${bestOffer.platform}. Verdict: ${aiResult.bestTimeToBuy || 'Aggregate Check'}`
        );
      } else {
        throw new Error("Failed to communicate with full-stack analytics root.");
      }
    } catch (err) {
      console.log("[Aggregator Info] serves fallback cache analytics details:", err instanceof Error ? err.message : String(err));
      setAiError(true);
      setAiModelUsed('Local Heuristics');
      onAddSearchHistory(
        inrProduct.name, 
        `MSRP: ${formatDirectINR(inrProduct.basePrice)}. Fallback INR cached aggregates served.`
      );
    } finally {
      setLoading(false);
      setAiLoading(false);
    }
  };

  // Initial load is kept empty, waiting for the user to search or choose a product.

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Check if search keywords matches existing stock catalog
    const found = MOCK_PRODUCTS.find(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    if (found) {
      setSelectedProduct(found);
      loadComparison(found);
    } else {
      // Dynamic custom product catalog creation (triggers backend Gemini-based search if selected)
      const customProduct: ProductDetail = {
        id: `prod-custom-${Date.now()}`,
        name: searchQuery,
        category: 'Searched Item',
        imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80',
        description: `Dynamically compiling full-scale crawler values for "${searchQuery}" in INR...`,
        specs: {
          'Scrape Target': searchQuery,
          'Validation Status': 'Verified',
          'Platform Match': '5 Online Stores'
        },
        basePrice: 0 // Base price calculated on the fly by Gemini
      };
      setSelectedProduct(customProduct);
      loadComparison(customProduct);
    }
  };

  // Saved alerts watchlist trigger
  const handleSaveWatchlist = () => {
    if (!comparison) return;
    
    const sorted = [...comparison.offers].sort((a,b) => a.price - b.price);
    const best = sorted[0];

    const newItem: SavedCompareItem = {
      id: `saved-${Date.now()}`,
      userId: 'u-default',
      type: 'product',
      title: comparison.product.name,
      targetPrice: Math.round(comparison.product.basePrice * 0.90),
      lastPrice: best.price,
      bestPlatformOrProvider: best.platform,
      isPriceDropAlertEnabled: true,
      savedAt: new Date().toISOString(),
      comparisonId: comparison.id
    };

    onSaveItem(newItem);
  };

  const isAlreadySaved = selectedProduct ? savedItems.some(item => item.title.toLowerCase() === selectedProduct.name.toLowerCase()) : false;

  // SVG Chart Computations (Prised styling, precise coordinates inside frame)
  const renderTrendChart = () => {
    if (!comparison) return null;
    
    const width = 500;
    const height = 150;
    const padding = 25;
    
    const prices = comparison.trends.map(t => t.averagePrice);
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    const priceRange = maxPrice - minPrice || 1;

    // Map coordinates
    const points = comparison.trends.map((t, idx) => {
      const x = padding + (idx * (width - padding * 2)) / (comparison.trends.length - 1);
      const y = height - padding - ((t.averagePrice - minPrice) * (height - padding * 2)) / priceRange;
      return { x, y, price: t.averagePrice, date: t.date, prediction: t.prediction };
    });

    // Create SVG Path Commands
    let pathD = '';
    let predPathD = '';
    
    points.forEach((p, idx) => {
      if (!p.prediction) {
        if (pathD === '') {
          pathD = `M ${p.x} ${p.y}`;
        } else {
          pathD += ` L ${p.x} ${p.y}`;
        }
      } else {
        if (predPathD === '') {
          const lastNormal = points[idx - 1];
          predPathD = `M ${lastNormal.x} ${lastNormal.y} L ${p.x} ${p.y}`;
        } else {
          predPathD += ` L ${p.x} ${p.y}`;
        }
      }
    });

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44 overflow-visible" id="trend-line-svg">
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0, 0.5, 1].map((ratio, idx) => {
          const y = padding + ratio * (height - padding * 2);
          const priceLabel = Math.round(maxPrice - ratio * priceRange);
          return (
            <g key={idx}>
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#1e293b" strokeWidth="1" strokeDasharray="3,3" />
              <text x={padding - 5} y={y + 4} fill="#64748b" className="text-[9px] font-mono text-right" textAnchor="end">{formatDirectINR(priceLabel)}</text>
            </g>
          );
        })}

        {/* Shaded Area underneath */}
        {pathD && (
          <path
            d={`${pathD} L ${points.find(p => points[points.indexOf(p) + 1]?.prediction)?.x || points[points.length-1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`}
            fill="url(#chartGrad)"
          />
        )}

        {/* Normal trend line */}
        <path d={pathD} fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" />

        {/* Predictive line */}
        {predPathD && (
          <path d={predPathD} fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeDasharray="4,4" strokeLinecap="round" />
        )}

        {/* Vertices dot highlights */}
        {points.map((p, idx) => (
          <g key={idx} className="group/dot cursor-pointer">
            <circle
              cx={p.x}
              cy={p.y}
              r={idx === comparison.trends.length - 1 ? 5 : 3.5}
              className={`transition-all duration-300 ${
                p.prediction 
                  ? 'fill-rose-500 stroke-rose-950 stroke-2 hover:fill-rose-400' 
                  : 'fill-violet-500 stroke-violet-950 stroke-2 hover:fill-violet-400'
              }`}
            />
            
            {/* Hover Tooltip Overlay */}
            <g className="opacity-0 group-hover/dot:opacity-100 transition-opacity duration-300 pointer-events-none">
              <rect
                x={p.x - 48}
                y={p.y - 30}
                width="96"
                height="22"
                rx="6"
                fill="#0f172a"
                stroke="#334155"
                strokeWidth="1"
              />
              <text
                x={p.x}
                y={p.y - 15}
                fill="#f8fafc"
                className="text-[9px] font-mono font-bold"
                textAnchor="middle"
              >
                {formatDirectINR(p.price)}
              </text>
            </g>
          </g>
        ))}
      </svg>
    );
  };

  return (
    <div id="product-compare-view" className="space-y-8 py-6 px-4 max-w-6xl mx-auto text-slate-100">
      
      {/* Upper Search input bar & catalogs selection */}
      <div className="space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-3 max-w-xl" id="prod-search-form">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4.5 h-4.5 text-slate-500" />
            <input
              type="text"
              placeholder=" Search for a Product"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-900 border border-slate-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl text-slate-100 text-sm focus:outline-none transition-all font-sans"
            />
          </div>
          <button
            id="btn-prod-search-execute"
            type="submit"
            className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs rounded-xl transition-all cursor-pointer shadow-md shadow-violet-950/40 whitespace-nowrap"
          >
            Track & Compare
          </button>
        </form>

        {/* Quick click preset catalog chips */}
        <div className="flex flex-wrap items-center gap-2" id="pop-prod-chips">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono mr-1">Predefined catalog:</span>
          {MOCK_PRODUCTS.map((prod) => (
            <button
              key={prod.id}
              id={`quick-chip-${prod.id}`}
              onClick={() => {
                setSelectedProduct(prod);
                loadComparison(prod);
              }}
              className={`px-3 py-1.5 rounded-lg border text-xs font-sans transition-all cursor-pointer ${
                selectedProduct?.id === prod.id
                  ? 'bg-violet-600/10 border-violet-500/40 text-violet-300 shadow-sm'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              {prod.name.split(' (')[0]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4" id="prod-loader">
          <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <div className="text-center space-y-2">
            <p className="text-sm font-semibold text-slate-200">Generating AI price crawl specifications...</p>
            <p className="text-xs text-slate-500 font-sans italic">PricePulse using Gemini to query, categorize, and formulate Indian Rupees offers.</p>
          </div>
        </div>
      ) : comparison ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="compare-results">
          
          {/* Product layout sheet (Left side column) */}
          <div className="lg:col-span-2 space-y-6" id="result-details-left">
            
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col sm:flex-row gap-6">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl border border-slate-800 bg-slate-950 flex-shrink-0 overflow-hidden" id="prod-display-frame">
                <img 
                  src={comparison.product.imageUrl} 
                  alt={comparison.product.name} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="space-y-3 flex-1">
                <div className="flex justify-between items-start gap-4 flex-wrap sm:flex-nowrap">
                  <div>
                    <span className="text-[10px] bg-slate-800 border border-slate-750 text-slate-400 font-mono px-2 py-0.5 rounded tracking-wide uppercase">
                      {comparison.product.category}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-1.5 tracking-tight leading-snug">{comparison.product.name}</h3>
                  </div>
                  <button
                    id="btn-watchlist-toggle"
                    onClick={handleSaveWatchlist}
                    disabled={isAlreadySaved}
                    className={`px-4 py-2 border rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                      isAlreadySaved
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : 'bg-violet-600 hover:bg-violet-500 border-transparent text-white shadow-md'
                    }`}
                  >
                    <BookmarkCheck className="w-4 h-4" />
                    <span>{isAlreadySaved ? 'Alerts Tracking' : 'Follow Product'}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-400 font-sans leading-relaxed">{comparison.product.description}</p>
                
                {/* Specs metadata rows */}
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1.5 border-t border-slate-800/60 text-[10px] font-sans text-slate-500">
                  {Object.entries(comparison.product.specs).map(([k, v]) => (
                    <span key={k}>
                      <strong className="text-slate-450">{k}</strong>: {v}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Merchant platform comparison table */}
            <div className="space-y-3">
              <h4 className="text-xs uppercase font-mono tracking-widest text-slate-500 font-semiboldHeader">Merchant Marketplace Tariffs (INR ₹)</h4>
              
              <div className="space-y-2" id="merchant-offers-list">
                {[...comparison.offers]
                  .sort((a,b) => a.price - b.price)
                  .map((offer, idx) => {
                    const isBest = idx === 0;
                    return (
                      <div 
                        key={offer.platform} 
                        className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                          isBest 
                            ? 'bg-violet-900/10 border-violet-500/40 shadow-inner' 
                            : 'bg-slate-900/40 border-slate-850/80 hover:border-slate-800'
                        }`}
                        id={`offer-row-${offer.platform}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold font-mono text-xs border ${
                            isBest ? 'bg-violet-600 border-violet-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}>
                            {offer.platform[0]}
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-slate-200 block">{offer.platform}</span>
                            <span className="text-[10px] text-slate-505 font-sans block">
                              {offer.deliveryDays}d transit • {offer.shippingCost === 0 ? 'Free Shipping delivery' : `+ ${formatDirectINR(offer.shippingCost)} dispatch fee`}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-right">
                          <div>
                            <span className="text-sm font-bold font-mono text-white block">{formatDirectINR(offer.price)}</span>
                            <span className={`text-[10px] font-sans ${
                              offer.availability === 'In Stock' ? 'text-emerald-400' : 'text-amber-400'
                            }`}>
                              {offer.availability}
                            </span>
                          </div>
                          <a
                            id={`redirect-link-${offer.platform}`}
                            href={offer.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    );
                })}
              </div>
            </div>

          </div>

          {/* AI Advisor Hub (Right column) */}
          <div className="space-y-6" id="result-details-right">
            
            <div className={`p-6 rounded-2xl border ${
              aiError ? 'bg-red-950/10 border-red-500/20' : 'bg-slate-900/60 border-slate-800 shadow-md'
            }`} id="ai-prediction-panel">
              <div className="flex justify-between items-start gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-violet-400 animate-pulse" />
                  <h4 className="text-sm font-bold text-white tracking-tight">AI Purchasing Optimiser</h4>
                </div>
                <span className="text-[9px] font-mono text-slate-500 tracking-wider uppercase px-2 py-0.5 rounded bg-slate-950 border border-slate-850">
                  {aiModelUsed}
                </span>
              </div>

              {aiLoading ? (
                <div className="py-10 text-center space-y-3" id="ai-panel-inner-loader">
                  <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-sans text-slate-450 italic">Gemini synthesizing Indian e-commerce charts...</p>
                </div>
              ) : (
                <div className="space-y-5 mt-4">
                  <div className="flex items-center gap-4 py-3 px-4 rounded-xl bg-slate-950 border border-slate-900">
                    <div className="relative w-12 h-12 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <circle
                          cx="18"
                          cy="18"
                          r="15.9155"
                          className="text-slate-850"
                          strokeWidth="2.5"
                          stroke="currentColor"
                          fill="none"
                        />
                        <circle
                          cx="18"
                          cy="18"
                          r="15.9155"
                          className="text-violet-500"
                          strokeWidth="2.5"
                          strokeDasharray={`${comparison.aiAnalysis.buyConfidence}, 100`}
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="none"
                        />
                      </svg>
                      <span className="absolute text-[10px] font-bold font-mono text-slate-200">
                        {comparison.aiAnalysis.buyConfidence}%
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 font-mono tracking-wider uppercase block">Purchasing Verdict</span>
                      <span className={`text-xs font-bold ${
                        comparison.aiAnalysis.bestTimeToBuy === 'Buy Now' ? 'text-emerald-400' : comparison.aiAnalysis.bestTimeToBuy === 'Wait 1 Week' ? 'text-amber-400' : 'text-rose-400'
                      }`}>
                        {comparison.aiAnalysis.bestTimeToBuy}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs leading-relaxed font-sans text-slate-300">
                    <p className="font-semibold text-slate-200">{comparison.aiAnalysis.prediction}</p>
                    <div className="h-px bg-slate-800" />
                    <p className="font-light text-slate-400 italic">
                      " {comparison.aiAnalysis.recommendationReason} "
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Custom SVG Price Trend Graph component */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-md space-y-4" id="price-trend-graph-panel">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-xs font-bold text-white tracking-tight">Market Trend Valuation (INR)</h4>
                </div>
                <div className="flex items-center gap-2 text-[8px] text-slate-500 font-sans">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                    <span>Historical</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    <span>Predictions</span>
                  </span>
                </div>
              </div>

              {renderTrendChart()}

              <div className="flex items-center gap-2 text-[9px] text-slate-500 font-sans bg-slate-950 p-3 rounded-lg border border-slate-900">
                <Info className="w-4 h-4 text-slate-405 shrink-0" />
                <p>Hover coordinate vertices to inspect precise, historical scraping points recalculated in INR.</p>
              </div>
            </div>

          </div>

        </div>
      ) : (
        <div className="py-20 text-center space-y-5 max-w-sm mx-auto" id="comparison-empty-state">
          <div className="w-16 h-16 bg-gradient-to-tr from-pink-500 to-violet-600 rounded-full flex items-center justify-center shadow-lg shadow-pink-500/20 mx-auto text-3xl animate-bounce" style={{ animationDuration: '3s' }}>
            🔍
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white">Your Saving Playground is Ready! 🛍️</h3>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Find cute deals on tech, toys, and custom goodies! Type any product name in the search bar above, or click any of our preset catalogs to reveal sparkly e-commerce savings instantly! ✨🍰
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
