import { 
  TrendingDown, 
  History, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  PlusCircle, 
  TrendingUp 
} from 'lucide-react';
import { User, SearchHistoryItem, SavedCompareItem } from '../types';
import { formatDirectINR } from '../utils/currency';

interface DashboardProps {
  currentUser: User | null;
  history: SearchHistoryItem[];
  savedItems: SavedCompareItem[];
  setActiveTab: (tab: string) => void;
}

export default function Dashboard({ currentUser, history, savedItems, setActiveTab }: DashboardProps) {
  // Analytical estimates
  const activeAlertsCount = savedItems.filter(item => item.isPriceDropAlertEnabled).length;
  const matchHitsCount = savedItems.filter(item => item.lastPrice <= (item.targetPrice || 0)).length;

  const currentRecommend = [
    {
      title: 'Sony WH-1000XM5 wireless Price Drop',
      desc: `Price matched on Reliance Digital at ${formatDirectINR(24999)}, which sits below your target price threshold of ${formatDirectINR(26000)}. High stock levels but high sales volume.`,
      time: '2 hours ago',
      color: 'border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/35 text-emerald-400',
      actionType: 'saved'
    },
    {
      title: 'Optimal Ride Segment Alert',
      desc: `Historic commutes Hitec City ➔ Gachibowli shows Uber Premier is currently 14% cheaper than competitor options due to minor surge fluctuations. Save about ${formatDirectINR(180)}.`,
      time: 'Real-time',
      color: 'border-cyan-500/20 bg-cyan-500/5 hover:border-cyan-500/35 text-cyan-400',
      actionType: 'ride'
    },
    {
      title: 'MacBook Air M3 Clearances Approaching',
      desc: 'Predictive modeling projects a 4% decline in middle June. Authorized resellers preparing bulk model clearances. We recommend waiting 1 week before claiming.',
      time: 'AI Model Forecast',
      color: 'border-violet-500/20 bg-violet-500/5 hover:border-violet-500/35 text-violet-400',
      actionType: 'product'
    }
  ];

  return (
    <div id="dashboard-view" className="space-y-8 py-6 px-4 max-w-6xl mx-auto text-slate-100 animate-fade-in">
      
      {/* Upper Grid Welcome Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-br from-slate-905 to-slate-900 border border-slate-800 shadow-md">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white font-sans">
            Welcome back, <span className="text-violet-400 font-sans">{currentUser ? currentUser.name : 'Guest Commuter'}</span>
          </h2>
          <p className="text-xs text-slate-500 font-sans mt-1">
            Auditing live platform pricing metrics in INR. Caches updated 2 minutes ago.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            id="btn-dash-newsearch"
            onClick={() => setActiveTab('product')}
            className="px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs rounded-xl transition-all cursor-pointer flex items-center gap-2 font-sans shadow-md"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Compare Product</span>
          </button>
          <button
            id="btn-dash-mob"
            onClick={() => setActiveTab('ride')}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-755 border border-slate-700 text-slate-300 font-medium text-xs rounded-xl transition-all cursor-pointer font-sans"
          >
            Compare Rides
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="dashboard-metrics-grid">
        <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800/80" id="metric-scans">
          <div className="flex justify-between items-center text-slate-505">
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider">Scans Executed</span>
            <History className="w-4 h-4 text-violet-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">{history.length}</span>
            <span className="text-[9px] font-sans text-emerald-400 font-medium">+2 today</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800/80" id="metric-saved">
          <div className="flex justify-between items-center text-slate-505">
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider">Items Tracked</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">{savedItems.length}</span>
            <span className="text-[9px] font-sans text-slate-550 font-normal">in watchlist</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800/80" id="metric-alerts">
          <div className="flex justify-between items-center text-slate-505">
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider">Active Watchers</span>
            <Clock className="w-4 h-4 text-cyan-404" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">{activeAlertsCount}</span>
            <span className="text-[9px] font-sans text-cyan-400 font-medium">{matchHitsCount} goals hit</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800/80" id="metric-savedpct">
          <div className="flex justify-between items-center text-slate-505">
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider">Average Savings</span>
            <TrendingDown className="w-4 h-4 text-fuchsia-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">18.4%</span>
            <span className="text-[9px] font-sans text-fuchsia-400 font-medium">vs platform MSRP</span>
          </div>
        </div>
      </div>

      {/* Bento Grid Split: AI recommendations list + Search history summary logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-body-bento">
        
        {/* Left Side Col: AI Intel Feed */}
        <div className="lg:col-span-2 space-y-4" id="dashboard-ai-intel">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-404 animate-pulse" />
            <h3 className="text-xs uppercase font-mono tracking-wider text-slate-500 font-bold">AI Agent Recommendations</h3>
          </div>
          
          <div className="space-y-3" id="ai-recs-container">
            {currentRecommend.map((rec, idx) => (
              <div 
                key={idx} 
                className={`p-5 rounded-xl border transition-all ${rec.color}`}
                id={`rec-item-${idx}`}
              >
                <div className="flex items-start justify-between gap-4 flex-wrap sm:flex-nowrap">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-205">{rec.title}</h4>
                    <p className="text-[11px] leading-relaxed text-slate-400 font-sans">{rec.desc}</p>
                  </div>
                  <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest whitespace-nowrap bg-slate-950 px-2.5 py-1 rounded border border-slate-800 shrink-0">
                    {rec.time}
                  </span>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    id={`btn-dash-rec-act-${idx}`}
                    onClick={() => setActiveTab(rec.actionType)}
                    className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <span>Inspect</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side Col: Quick History Review */}
        <div className="space-y-4" id="dashboard-side-logs">
          <div className="flex items-center justify-between">
            <h3 className="text-xs uppercase font-mono tracking-wider text-slate-500 font-bold">Recent Activities</h3>
            <button
              id="btn-dash-viewall-hist"
              onClick={() => setActiveTab('history')}
              className="text-[10px] font-bold uppercase tracking-wider text-violet-400 hover:underline cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="space-y-3 bg-slate-900/30 border border-slate-850 p-5 rounded-xl h-[340px] overflow-y-auto" id="dashboard-short-history">
            {history.length > 0 ? (
              history.slice(0, 4).map((log) => (
                <div key={log.id} className="p-3 bg-slate-950/40 rounded-lg border border-slate-900 flex flex-col gap-1 hover:border-slate-800 transition-colors">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-300 truncate max-w-[150px]">{log.queryText}</span>
                    <span className="text-[8px] bg-slate-900 border border-slate-800 text-slate-500 font-mono px-1.5 py-0.5 rounded capitalize">
                      {log.type}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate font-sans leading-none mt-1">{log.resultsSummary}</p>
                  <span className="text-[8px] text-slate-600 font-mono mt-1">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <p className="text-[10px] text-slate-500 italic">No activity entered in cached history yet.</p>
                <button
                  id="btn-dash-startsearch"
                  onClick={() => setActiveTab('product')}
                  className="mt-3 px-3 py-1.5 bg-violet-605/10 border border-violet-500/20 text-violet-400 hover:text-white rounded text-xs cursor-pointer font-bold"
                >
                  Inspect Products
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
