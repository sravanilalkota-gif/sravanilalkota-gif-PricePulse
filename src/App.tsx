import React, { useState, useEffect } from 'react';
import { Sparkles, Menu, X, Bell, Info, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, SearchHistoryItem, SavedCompareItem } from './types';
import { INITIAL_SEARCH_HISTORY, INITIAL_SAVED_ITEMS } from './data/mockData';
import { fetchExchangeRate, formatDirectINR } from './utils/currency';

// Component imports
import Sidebar from './components/Sidebar';
import LandingPage from './components/LandingPage';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import ProductComparison from './components/ProductComparison';
import RideComparison from './components/RideComparison';
import SearchHistory from './components/SearchHistory';
import SavedItems from './components/SavedItems';
import UserProfile from './components/UserProfile';
import SplashScreen from './components/SplashScreen';

interface PricePulseNotification {
  id: string;
  type: 'product' | 'ride' | 'system';
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
}

export default function App() {
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return !sessionStorage.getItem('pricepulse_splash_shown');
    }
    return true;
  });
  const [activeTab, setActiveTabState] = useState<string>('landing');

  const [navigationHistory, setNavigationHistory] = useState<string[]>(['landing']);

  const setActiveTab = (tabOrFn: string | ((prev: string) => string)) => {
    setActiveTabState(prev => {
      const nextTab = typeof tabOrFn === 'function' ? tabOrFn(prev) : tabOrFn;
      if (nextTab !== prev) {
        setNavigationHistory(h => [...h, nextTab]);
      }
      return nextTab;
    });
  };

  const handleGoBack = () => {
    if (navigationHistory.length > 1) {
      const updatedHistory = [...navigationHistory];
      updatedHistory.pop(); // remove current active tab
      const prevTab = updatedHistory[updatedHistory.length - 1];
      setNavigationHistory(updatedHistory);
      setActiveTabState(prevTab);
    }
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [systemNotifs, setSystemNotifs] = useState<PricePulseNotification[]>([]);

  // Global relational databases states representation
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [savedItems, setSavedItems] = useState<SavedCompareItem[]>([]);
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'info' }[]>([]);

  // Toggle or fetch notifications
  const fetchNotifs = async () => {
    console.log("[Notification Event] fetchNotifs() initiated - querying server /api/notifications");
    try {
      const startTime = performance.now();
      const res = await fetch('/api/notifications');
      const endTime = performance.now();
      console.log(`[Notification Event] fetchNotifs() response code: ${res.status} (took ${(endTime - startTime).toFixed(1)}ms)`);
      if (res.ok) {
        const data = await res.json();
        console.log(`[Notification Event] fetchNotifs() successfully fetched ${data.notifications?.length || 0} active notifications.`);
        setSystemNotifs(data.notifications || []);
      } else {
        console.error(`[Notification Event] fetchNotifs() failed with status: ${res.status}`);
      }
    } catch (err) {
      console.warn("[Notification Event] Failed to synchronize alerts with backend service:", err);
    }
  };

  const handleDismissNotif = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`[Notification Event] Dismiss action requested for id: "${id}"`);
    try {
      const res = await fetch('/api/notifications/dismiss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      console.log(`[Notification Event] Dismiss response status: ${res.status}`);
      if (res.ok) {
        const data = await res.json();
        console.log("[Notification Event] Dismiss completed. Updated notifications state:", data.notifications);
        setSystemNotifs(data.notifications || []);
      }
    } catch (err) {
      console.error("[Notification Event] Dismiss single entry failed with error details:", err);
    }
  };

  const handleDismissAllNotifs = async () => {
    console.log("[Notification Event] Dismiss All notifications requested by user.");
    try {
      const res = await fetch('/api/notifications/dismiss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      console.log(`[Notification Event] Dismiss All response status: ${res.status}`);
      if (res.ok) {
        const data = await res.json();
        console.log("[Notification Event] Dismiss All completed. Fresh notifications state:", data.notifications);
        setSystemNotifs(data.notifications || []);
      }
    } catch (err) {
      console.error("[Notification Event] Dismiss all entries failed with error details:", err);
    }
  };

  // Load state backups or initialize defaults from database tables representation
  useEffect(() => {
    // 1. Fetch real-time exchange rates at load
    fetchExchangeRate().then((rate) => {
      console.log(`Pristine currency rate established at 1 USD = ₹${rate}`);
    });

    // 2. Fetch notifications database list
    fetchNotifs();

    // 3. User logins validation
    const storedUser = localStorage.getItem('pricepulse_user');
    if (storedUser) {
      const userObj = JSON.parse(storedUser);
      // Backend JWT validation proxy verification
      fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: userObj.token })
      }).then(res => {
        if (res.ok) {
          setCurrentUser(userObj);
        } else {
          // Token expired, logging back to guest default
          localStorage.removeItem('pricepulse_user');
          setGuestSession();
        }
      }).catch(() => {
        // Offline or fallback verification
        setCurrentUser(userObj);
      });
    } else {
      setGuestSession();
    }

    const storedHist = localStorage.getItem('pricepulse_history');
    if (storedHist) {
      setHistory(JSON.parse(storedHist));
    } else {
      setHistory(INITIAL_SEARCH_HISTORY);
    }

    const storedSaved = localStorage.getItem('pricepulse_saved_items');
    if (storedSaved) {
      setSavedItems(JSON.parse(storedSaved));
    } else {
      setSavedItems(INITIAL_SAVED_ITEMS);
    }
  }, []);

  const setGuestSession = () => {
    const defaultUser: User = {
      id: 'u-default',
      name: 'Recruiter Guest',
      email: 'developer@recruiters.com',
      joinedAt: new Date().toISOString(),
      token: 'verified-jwt-session-u-default-static'
    };
    setCurrentUser(defaultUser);
  };

  // Alert loops trigger scanner simulator (INR Calibrated)
  useEffect(() => {
    if (savedItems.length === 0) return;
    
    // Periodically verify if items prices drop below set threshold standards
    const checkTimer = setTimeout(() => {
      savedItems.forEach(async (item) => {
        if (item.type === 'product' && item.targetPrice && item.isPriceDropAlertEnabled) {
          if (item.lastPrice <= item.targetPrice) {
            const inrTarget = formatDirectINR(item.targetPrice);
            const inrLast = formatDirectINR(item.lastPrice);
            const msg = `Alert threshold hit! "${item.title}" is currently ${inrLast}, below your watch target of ${inrTarget}.`;
            triggerToast(msg, 'success');

            // Post log alert straight to backend notifications list
            try {
              await fetch('/api/notifications/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  type: 'product',
                  title: `Watchlist Trigger: ${item.title}`,
                  message: msg
                })
              });
              fetchNotifs();
            } catch (err) {
              console.warn("Failed alert broadcast log to server: ", err);
            }
          }
        }
      });
    }, 5000);

    return () => clearTimeout(checkTimer);
  }, [savedItems]);

  // Toast systems helper
  const triggerToast = (message: string, type: 'success' | 'info' = 'info') => {
    const id = `toast-${Date.now()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5500);
  };

  // State modifiers
  const handleAddSearchHistory = (queryText: string, summary: string) => {
    const newLog: SearchHistoryItem = {
      id: `sh-${Date.now()}`,
      userId: currentUser?.id || 'guest',
      type: activeTab === 'ride' ? 'ride' : 'product',
      queryText,
      resultsSummary: summary,
      timestamp: new Date().toISOString()
    };
    
    setHistory(prev => {
      const updated = [newLog, ...prev];
      localStorage.setItem('pricepulse_history', JSON.stringify(updated));
      return updated;
    });
    
    triggerToast(`Query logged: "${queryText}" compared successfully.`, 'info');
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('pricepulse_history');
    triggerToast('Historical search databases cleared.', 'info');
  };

  const handleSaveItem = (newItem: SavedCompareItem) => {
    setSavedItems(prev => {
      if (prev.some(item => item.title.toLowerCase() === newItem.title.toLowerCase())) {
        triggerToast('This item is already referenced inside your watchlist.', 'info');
        return prev;
      }
      const updated = [newItem, ...prev];
      localStorage.setItem('pricepulse_saved_items', JSON.stringify(updated));
      return updated;
    });
    triggerToast(`Added to Watchlist: tracking "${newItem.title}" alerts.`, 'success');
  };

  const handleRemoveSavedItem = (id: string) => {
    setSavedItems(prev => {
      const updated = prev.filter(item => item.id !== id);
      localStorage.setItem('pricepulse_saved_items', JSON.stringify(updated));
      return updated;
    });
    triggerToast('Item unfollowed from alerts registry.', 'info');
  };

  const handleUpdateAlertConfig = (id: string, enabled: boolean, targetPrice?: number) => {
    setSavedItems(prev => {
      const updated = prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            isPriceDropAlertEnabled: enabled,
            targetPrice: targetPrice !== undefined ? targetPrice : item.targetPrice
          };
        }
        return item;
      });
      localStorage.setItem('pricepulse_saved_items', JSON.stringify(updated));
      return updated;
    });
    triggerToast('Alert threshold constraints updated.', 'success');
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setActiveTab('dashboard');
    triggerToast(`Authentication verified. Welcome ${user.name}!`, 'success');
    fetchNotifs();
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('pricepulse_user');
    setGuestSession();
    setActiveTab('landing');
    triggerToast('Session closed. Credentials purged from cache.', 'info');
  };

  const handleUpdateProfileName = (newName: string) => {
    if (currentUser) {
      const updated = { ...currentUser, name: newName };
      setCurrentUser(updated);
      localStorage.setItem('pricepulse_user', JSON.stringify(updated));
    }
  };

  const getActiveTabLabel = (tab: string): string => {
    switch (tab) {
      case 'landing': return 'PricePulse Home';
      case 'dashboard': return 'User Dashboard';
      case 'product': return 'Compare Product';
      case 'ride': return 'Compare Rides';
      case 'history': return 'Search History Logs';
      case 'saved': return 'Alert Watchlist';
      case 'profile': return 'User Profile';
      default: return 'Overview';
    }
  };

  if (showSplash) {
    return (
      <SplashScreen 
        onComplete={() => {
          sessionStorage.setItem('pricepulse_splash_shown', 'true');
          setShowSplash(false);
        }} 
      />
    );
  }

  return (
    <motion.div 
      id="pricepulse-main-viewport" 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-screen bg-[#090D1A] flex font-sans antialiased text-slate-300 w-full relative overflow-hidden"
    >
      {/* Background Sweet Motion Graphics Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
        {/* Soft magical background pastel cloud layers */}
        <div className="absolute top-[15%] left-[10%] w-[45vw] h-[45vh] rounded-full bg-pink-500/[0.04] blur-[130px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[10%] right-[5%] w-[50vw] h-[50vh] rounded-full bg-cyan-500/[0.04] blur-[150px] animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="absolute top-[50%] left-[55%] w-[35vw] h-[35vh] rounded-full bg-violet-600/[0.03] blur-[110px]" />

        {/* Floating rings resembling cute planetary pulse paths */}
        {[0, 1, 2, 3, 4, 5, 6].map((i) => {
          const size = 160 + i * 70;
          return (
            <motion.div
              key={i}
              className="absolute rounded-full border border-dashed border-pink-400/[0.03]"
              style={{
                width: size,
                height: size,
                top: `${12 + i * 11}%`,
                left: `${8 + (i * 13) % 75}%`,
              }}
              animate={{
                x: [0, (i % 2 === 0 ? 35 : -35), 0],
                y: [0, (i % 2 === 0 ? -45 : 45), 0],
                rotate: [0, 180, 360],
                scale: [1, 1.15, 1],
              }}
              transition={{
                duration: 15 + i * 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          );
        })}

        {/* Adorable Floating Background Emojis related to PricePulse (Shopping bags, cute scooters, piggies, keychains) */}
        {[
          { char: "🧸", top: "12%", left: "4%", size: "text-2xl", delay: 0 },
          { char: "🛍️", top: "7%", right: "6%", size: "text-3xl", delay: 1.2 },
          { char: "🛵", top: "38%", left: "14%", size: "text-2xl", delay: 2.5 },
          { char: "🐷", top: "72%", left: "3%", size: "text-3xl", delay: 0.8 },
          { char: "🚗", top: "25%", right: "12%", size: "text-2xl", delay: 3.1 },
          { char: "✨", top: "54%", right: "5%", size: "text-xl", delay: 1.7 },
          { char: "🎒", top: "82%", right: "10%", size: "text-3xl", delay: 2.1 },
          { char: "💖", top: "88%", left: "11%", size: "text-2xl", delay: 0.4 },
          { char: "🏷️", top: "45%", right: "18%", size: "text-2xl", delay: 4.2 },
          { char: "👑", top: "64%", left: "22%", size: "text-2xl", delay: 3.5 }
        ].map((emoji, idx) => (
          <motion.div
            key={`bg-emoji-${idx}`}
            className={`absolute ${emoji.size} select-none pointer-events-none opacity-[0.32] z-0`}
            style={{
              top: emoji.top,
              left: emoji.left,
              right: emoji.right,
              filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.18))"
            }}
            animate={{
              y: [0, -26, 0],
              x: [0, Math.sin(idx + 1) * 16, 0],
              rotate: [0, 10, -10, 0],
              scale: [0.95, 1.1, 0.95],
            }}
            transition={{
              duration: 8 + idx * 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: emoji.delay,
            }}
          >
            {emoji.char}
          </motion.div>
        ))}
      </div>

      
      {/* Toast Overlay Alerts Stack */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm pointer-events-none" id="toasts-portal">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            id={`toast-notif-${toast.id}`}
            className={`p-4 rounded-xl border flex items-start gap-3 shadow-lg hover:shadow-2xl transition-all duration-300 pointer-events-auto animate-slide-in ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-300 shadow-emerald-950/25'
                : 'bg-indigo-950/90 border-violet-500/40 text-indigo-200 shadow-indigo-950/25'
            }`}
          >
            {toast.type === 'success' ? (
              <Bell className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5 animate-bounce" />
            ) : (
              <Info className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
            )}
            <p className="text-xs font-medium leading-relaxed font-sans">{toast.message}</p>
          </div>
        ))}
      </div>

      {/* Persistent Left Desktop Navigation Rail */}
      <div className="hidden lg:block">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          currentUser={currentUser} 
          onLogout={handleLogout} 
        />
      </div>

      {/* Main Panel Frame Wrapper */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto relative">
        
        {/* Unified Application Global Header and Notifications Center */}
        <header className="flex justify-between items-center px-6 py-4 bg-slate-900/80 border-b border-slate-800/80 sticky top-0 z-30 backdrop-blur-md" id="pricepulse-global-header">
          <div className="flex items-center gap-3">
            <button
              id="btn-mobile-drawer-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 border border-slate-800 hover:border-slate-700/60 rounded-xl text-slate-300 transition-colors cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            {navigationHistory.length > 1 && (
              <button
                id="btn-global-back"
                onClick={handleGoBack}
                className="px-3 py-1.5 bg-slate-950 hover:bg-slate-900 hover:text-rose-400 border border-slate-800 hover:border-slate-700 rounded-xl text-slate-200 transition-all cursor-pointer flex items-center justify-center gap-1 text-xs font-semibold shadow-sm"
                title="Go to previous page"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}
            <h1 className="text-sm font-bold text-white tracking-widest uppercase" id="navigation-active-title">
              {getActiveTabLabel(activeTab)}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Real-time Notifications Bell Dropdown button */}
            <div className="relative">
              <button
                id="btn-dropdown-bell"
                onClick={() => {
                  console.log(`[Notification Trigger] click registered on btn-dropdown-bell. Prev state isNotifOpen: ${isNotifOpen}`);
                  fetchNotifs();
                  setIsNotifOpen(!isNotifOpen);
                  console.log(`[Notification Trigger] State toggled. Next state isNotifOpen: ${!isNotifOpen}`);
                }}
                className="p-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-slate-300 transition-all cursor-pointer relative"
                title="View Price Alerts"
              >
                <Bell className={`w-4 h-4 ${systemNotifs.some(n => !n.read) ? 'text-violet-400 animate-pulse' : 'text-slate-400'}`} />
                {systemNotifs.some(n => !n.read) && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border border-slate-950 flex items-center justify-center text-[7px] text-white font-mono font-bold">
                    {systemNotifs.filter(n => !n.read).length}
                  </span>
                )}
              </button>

              {/* Drawer Container Panel */}
              {isNotifOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)} />
                  <div className="absolute right-0 mt-3 w-80 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-4.5 space-y-3 z-50 text-slate-200 animate-slide-in" id="pricepulse-alerts-center-drawer">
                    <div className="flex justify-between items-center pb-2.5 border-b border-slate-800">
                      <span className="text-xs font-bold text-white font-sans tracking-tight">Active Price Alerts ({systemNotifs.filter(n => !n.read).length} new)</span>
                      <button
                        id="btn-alert-clear-all"
                        onClick={() => {
                          handleDismissAllNotifs();
                          setIsNotifOpen(false);
                        }}
                        className="text-[10px] text-violet-400 hover:text-violet-300 cursor-pointer"
                      >
                        Dismiss All
                      </button>
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1" id="alerts-center-scrolling-view">
                      {systemNotifs.length > 0 ? (
                        systemNotifs.map(notif => (
                          <div
                            key={notif.id}
                            className={`p-2.5 rounded-xl border text-[11px] space-y-1 transition-colors ${notif.read ? 'bg-slate-950/20 border-slate-900/40 text-slate-500' : 'bg-violet-950/10 border-violet-500/20 text-slate-200'}`}
                            id={`alert-bubble-${notif.id}`}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <span className="font-bold text-[11px] text-slate-200 truncate pr-0.5">{notif.title}</span>
                              {!notif.read && (
                                <button
                                  onClick={(e) => handleDismissNotif(notif.id, e)}
                                  className="text-[10px] text-slate-500 hover:text-slate-300 shrink-0 cursor-pointer"
                                >
                                  Clear
                                </button>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400 leading-normal">{notif.message}</p>
                            <span className="text-[8px] text-slate-500 font-mono block text-right">
                              {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-[10px] text-slate-550 py-8">No current notifications yet.</p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* User credentials identifier badge */}
            <div
              onClick={() => setActiveTab('profile')}
              className="px-3.5 py-1.5 rounded-xl border border-slate-800 bg-slate-950 hover:border-slate-700/60 transition-colors flex items-center gap-2 cursor-pointer text-xs font-mono select-none text-slate-400 hover:text-slate-200"
              id="top-user-indicator"
            >
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
              <span>{currentUser?.name || 'Recruiter'}</span>
            </div>
          </div>
        </header>

        {/* Floating Mobile Sidebar Drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden flex" id="mobile-expanded-drawer">
            <div className="w-68 h-full shadow-2xl relative">
              <Sidebar 
                activeTab={activeTab} 
                setActiveTab={(tab) => {
                  setActiveTab(tab);
                  setIsMobileMenuOpen(false);
                }} 
                currentUser={currentUser} 
                onLogout={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }} 
              />
            </div>
            {/* Click outside backdrop container */}
            <div className="flex-1 cursor-pointer" onClick={() => setIsMobileMenuOpen(false)} />
          </div>
        )}

        {/* Reactive tab content viewport switches */}
        <main className="flex-1 overflow-x-hidden pb-12" id="main-content-fluid">
          {activeTab === 'landing' && (
            <LandingPage setActiveTab={setActiveTab} />
          )}

          {activeTab === 'login' && (
            <Auth onLoginSuccess={handleLoginSuccess} />
          )}

          {activeTab === 'dashboard' && (
            <Dashboard 
              currentUser={currentUser} 
              history={history} 
              savedItems={savedItems} 
              setActiveTab={setActiveTab} 
            />
          )}

          {activeTab === 'product' && (
            <ProductComparison 
              onAddSearchHistory={handleAddSearchHistory} 
              onSaveItem={handleSaveItem}
              savedItems={savedItems}
            />
          )}

          {activeTab === 'ride' && (
            <RideComparison 
              onAddSearchHistory={handleAddSearchHistory} 
              onSaveItem={handleSaveItem}
              savedItems={savedItems}
            />
          )}

          {activeTab === 'history' && (
            <SearchHistory 
              history={history} 
              onClearHistory={handleClearHistory} 
              setActiveTab={setActiveTab} 
            />
          )}

          {activeTab === 'saved' && (
            <SavedItems 
              savedItems={savedItems} 
              onRemoveItem={handleRemoveSavedItem}
              onUpdateAlert={handleUpdateAlertConfig}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'profile' && (
            <UserProfile 
              currentUser={currentUser} 
              onUpdateName={handleUpdateProfileName}
              setActiveTab={setActiveTab}
            />
          )}
        </main>
      </div>

    </motion.div>
  );
}

