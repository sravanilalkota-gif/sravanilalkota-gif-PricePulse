import { useState } from 'react';
import { 
  BookmarkCheck, 
  Trash2, 
  BellRing, 
  BellOff, 
  CheckCircle2,
  Car,
  ShoppingBag,
  ArrowRight
} from 'lucide-react';
import { SavedCompareItem } from '../types';
import { formatDirectINR } from '../utils/currency';

interface SavedItemsProps {
  savedItems: SavedCompareItem[];
  onRemoveItem: (id: string) => void;
  onUpdateAlert: (id: string, enabled: boolean, targetPrice?: number) => void;
  setActiveTab: (tab: string) => void;
}

export default function SavedItems({ savedItems, onRemoveItem, onUpdateAlert, setActiveTab }: SavedItemsProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<string>('');

  const handleToggleAlert = (id: string, currentVal: boolean) => {
    onUpdateAlert(id, !currentVal);
  };

  const startEditTarget = (id: string, curVal?: number) => {
    setEditingId(id);
    setTempPrice(curVal ? curVal.toString() : '');
  };

  const saveTargetVal = (id: string) => {
    const val = parseFloat(tempPrice);
    if (!isNaN(val) && val > 0) {
      onUpdateAlert(id, true, val);
    }
    setEditingId(null);
  };

  return (
    <div id="alerts-watchlist-view" className="space-y-6 py-6 px-4 max-w-4xl mx-auto text-slate-100 animate-fade-in">
      
      {/* Upper header */}
      <div className="pb-3 border-b border-slate-800">
        <h2 className="text-xl font-bold text-white tracking-tight">Tracked Price alerts & Watchlist</h2>
        <p className="text-xs text-slate-500 font-sans mt-0.5">Alert rules dispatched to server. Background loops inspect indices every 15m.</p>
      </div>

      {/* Tracked cards lists */}
      {savedItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="watchlist-cards-grid">
          {savedItems.map((item) => {
            const isProduct = item.type === 'product';
            const IconComponent = isProduct ? ShoppingBag : Car;
            const hasMatchedBudget = isProduct && item.targetPrice && (item.lastPrice <= item.targetPrice);

            return (
              <div 
                key={item.id}
                className={`p-5 rounded-2xl border flex flex-col justify-between gap-4 transition-all ${
                  hasMatchedBudget 
                    ? 'bg-emerald-950/10 border-emerald-500/50 shadow-md shadow-emerald-950/10' 
                    : 'bg-slate-900/40 border-slate-850/80 hover:border-slate-800'
                }`}
                id={`watch-card-${item.id}`}
              >
                {/* Upper description header */}
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center border ${
                        hasMatchedBudget 
                          ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400' 
                          : 'border-slate-800 bg-slate-950 text-slate-500'
                      }`}>
                        <IconComponent className="w-4.5 h-4.5" />
                      </div>
                      
                      <div className="overflow-hidden">
                        <h4 className="text-xs font-semibold text-slate-200 truncate">{item.title}</h4>
                        <span className="text-[9px] text-slate-500 font-mono tracking-wide">
                          Best Offer: {item.bestPlatformOrProvider}
                        </span>
                      </div>
                    </div>
                    
                    <button
                      id={`btn-watch-delete-${item.id}`}
                      onClick={() => onRemoveItem(item.id)}
                      className="p-1.5 rounded bg-slate-950 border border-slate-850 text-slate-500 hover:text-red-400 hover:border-red-500/30 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Matching Indicator Callout Banner */}
                  {hasMatchedBudget && (
                    <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 rounded-xl" id={`budget-match-alert-${item.id}`}>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 animate-bounce" />
                      <p className="text-[10px] leading-normal font-sans">
                        <strong>Watchlist Deal Triggered!</strong> Actual marketplace valuation of {formatDirectINR(item.lastPrice)} dropped below your alert target price of {formatDirectINR(item.targetPrice!)}.
                      </p>
                    </div>
                  )}

                  {/* Price comparisons parameters box */}
                  <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-900">
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase font-mono block">Current Best price</span>
                      <span className={`text-xs font-bold font-mono ${hasMatchedBudget ? 'text-emerald-400' : 'text-white'}`}>
                        {formatDirectINR(item.lastPrice)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] text-slate-500 uppercase font-mono block">Alert Threshold target</span>
                      {isProduct ? (
                        editingId === item.id ? (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <input
                              type="number"
                              value={tempPrice}
                              onChange={(e) => setTempPrice(e.target.value)}
                              className="w-16 px-1.5 py-0.5 bg-slate-900 border border-slate-750 text-white text-[10px] font-mono rounded focus:outline-none"
                            />
                            <button
                              id={`btn-save-temp-target-${item.id}`}
                              onClick={() => saveTargetVal(item.id)}
                              className="px-1.5 py-0.5 bg-violet-600 text-white text-[9px] rounded font-bold cursor-pointer"
                            >
                              Set
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 mt-0.5 font-sans">
                            <span className="text-xs font-bold font-mono text-slate-300">
                              {item.targetPrice ? formatDirectINR(item.targetPrice) : 'Unset'}
                            </span>
                            <button
                              id={`btn-edit-target-${item.id}`}
                              onClick={() => startEditTarget(item.id, item.targetPrice)}
                              className="text-[9px] text-violet-450 hover:underline cursor-pointer"
                            >
                              Edit
                            </button>
                          </div>
                        )
                      ) : (
                        <span className="text-[9px] text-slate-500 italic block mt-0.5">Commute alerts live</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* alert state switches */}
                <div className="flex justify-between items-center border-t border-slate-850 pt-3">
                  <button
                    id={`btn-toggle-alert-${item.id}`}
                    onClick={() => handleToggleAlert(item.id, item.isPriceDropAlertEnabled)}
                    className={`flex items-center gap-1.5 text-[10px] font-sans font-medium transition-colors cursor-pointer ${
                      item.isPriceDropAlertEnabled ? 'text-violet-400 hover:text-violet-300' : 'text-slate-500 hover:text-slate-400'
                    }`}
                  >
                    {item.isPriceDropAlertEnabled ? (
                      <>
                        <BellRing className="w-3.5 h-3.5 text-violet-400 animate-pulse" />
                        <span>Active Watcher Live</span>
                      </>
                    ) : (
                      <>
                        <BellOff className="w-3.5 h-3.5" />
                        <span>Muted Logs</span>
                      </>
                    )}
                  </button>

                  <button
                    id={`btn-watch-recompare-${item.id}`}
                    onClick={() => setActiveTab(item.type)}
                    className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <span>Inspect</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-20 text-center space-y-4" id="watchlist-empty-box">
          <div className="w-12 h-12 rounded-full border border-slate-800 bg-slate-900/40 flex items-center justify-center text-slate-600 mx-auto">
            <BookmarkCheck className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-200">Watchlist is Empty</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto font-sans leading-relaxed">
              Pin compared products and ride routes to launch dynamic price trends trackers automatically.
            </p>
          </div>
          <button
            id="btn-goto-watchlist-comparer"
            onClick={() => setActiveTab('product')}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
          >
            Track Products Now
          </button>
        </div>
      )}

    </div>
  );
}
