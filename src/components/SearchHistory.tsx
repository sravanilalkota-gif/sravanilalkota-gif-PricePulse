import { 
  History, 
  Trash2, 
  ChevronRight, 
  Clock, 
  Sparkles,
  ShoppingBag,
  Car
} from 'lucide-react';
import { SearchHistoryItem } from '../types';

interface SearchHistoryProps {
  history: SearchHistoryItem[];
  onClearHistory: () => void;
  setActiveTab: (tab: string) => void;
}

export default function SearchHistory({ history, onClearHistory, setActiveTab }: SearchHistoryProps) {
  
  const formatDate = (isoStr: string) => {
    const d = new Date(isoStr);
    return d.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div id="search-history-view" className="space-y-6 py-6 px-4 max-w-4xl mx-auto text-slate-100 animate-fade-in">
      
      {/* Upper header action blocks */}
      <div className="flex justify-between items-center pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Active Search Logs</h2>
          <p className="text-xs text-slate-500 font-sans mt-0.5">Scrapes and audits synchronized internally within SQLite caches.</p>
        </div>
        {history.length > 0 && (
          <button
            id="btn-clear-history"
            onClick={onClearHistory}
            className="px-3.5 py-1.5 rounded-lg border border-red-500/10 hover:border-red-500/30 bg-red-500/5 hover:bg-red-500/10 text-red-400 text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>Wipe Search Database</span>
          </button>
        )}
      </div>

      {/* History listing maps */}
      {history.length > 0 ? (
        <div className="space-y-3" id="history-items-container">
          {history.map((item) => {
            const isProduct = item.type === 'product';
            const Icon = isProduct ? ShoppingBag : Car;
            
            return (
              <div 
                key={item.id} 
                className="p-4 rounded-xl bg-slate-900/40 border border-slate-850/85 hover:border-slate-800 flex items-center justify-between gap-4 transition-all"
                id={`history-item-${item.id}`}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`w-9 h-9 rounded-lg border shrink-0 flex items-center justify-center ${
                    isProduct ? 'border-violet-500/10 bg-violet-500/5 text-violet-400' : 'border-cyan-500/10 bg-cyan-500/5 text-cyan-400'
                  }`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div className="space-y-1 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-slate-200">{item.queryText}</h4>
                      <span className="text-[9px] bg-slate-850 border border-slate-800 text-slate-500 font-mono px-1.5 py-0.5 rounded capitalize">
                        {item.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-sans leading-normal break-words">{item.resultsSummary}</p>
                    <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1 mt-1">
                      <Clock className="w-3.5 h-3.5 text-slate-600" />
                      <span>{formatDate(item.timestamp)}</span>
                    </span>
                  </div>
                </div>

                <button
                  id={`btn-recall-match-${item.id}`}
                  onClick={() => setActiveTab(item.type)}
                  className="px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-950 text-slate-400 hover:text-slate-200 flex items-center gap-1 text-xs cursor-pointer transition-colors"
                >
                  <span>Re-run</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-20 text-center space-y-4" id="history-empty-box">
          <div className="w-12 h-12 rounded-full border border-slate-800 bg-slate-900/40 flex items-center justify-center text-slate-600 mx-auto">
            <History className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-200">No Historical Records Found</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto font-sans leading-relaxed">
              Run product comparison searches or route calculations to populate SQL logs immediately.
            </p>
          </div>
          <button
            id="btn-trigger-history-action"
            onClick={() => setActiveTab('product')}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
          >
            Start Comparing
          </button>
        </div>
      )}

    </div>
  );
}
