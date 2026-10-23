import { 
  Compass, 
  LayoutDashboard, 
  ShoppingBag, 
  Car, 
  History, 
  BookmarkCheck, 
  User as UserIcon, 
  Database,
  ArrowRightLeft,
  ChevronRight
} from 'lucide-react';
import { User } from '../types';
interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User | null;
  onLogout: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, currentUser, onLogout }: SidebarProps) {
  const menuItems = [
    { id: 'landing', label: 'Home Sweet Home 🏡', icon: Compass },
    { id: 'dashboard', label: 'Savings Dashboard 👑', icon: LayoutDashboard },
    { id: 'product', label: 'Shop & Compare 🛍️', icon: ShoppingBag },
    { id: 'ride', label: 'Happy Rides 🛵', icon: Car },
    { id: 'history', label: 'Search History 📖', icon: History },
    { id: 'saved', label: 'Alert Watchlist 💖', icon: BookmarkCheck },
    { id: 'profile', label: 'My Little Profile 🧸', icon: UserIcon },
  ];

  return (
    <aside id="sidebar-panel" className="w-68 bg-[#0b0e22] border-r border-[#1a1e3b] flex flex-col justify-between h-screen sticky top-0 text-slate-300">
      {/* Upper Brand Shell */}
      <div className="p-6">
        <div 
          onClick={() => setActiveTab('landing')} 
          className="flex items-center gap-3 cursor-pointer group"
          id="btn-brand-landing"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center font-bold text-white shadow-lg shadow-pink-500/20 border border-pink-400/20 group-hover:scale-110 active:scale-95 transition-transform duration-300">
            <ArrowRightLeft className="w-5 h-5 text-pink-100" />
          </div>
          <div>
            <span className="text-xl font-black text-white tracking-tight group-hover:text-pink-400 transition-colors">
              Price<span className="text-pink-400">Pulse</span> 🍰
            </span>
            <span className="block text-[9px] text-pink-300/70 font-mono tracking-wider font-semibold uppercase">
              Smart • Sweet • Savings
            </span>
          </div>
        </div>

        {/* Separator */}
        <div className="h-px bg-slate-800/60 my-6" />

        {/* Menu Navigation Group */}
        <nav className="space-y-1.5" id="nav-menu">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold tracking-wide transition-all duration-300 transform hover:scale-[1.02] active:scale-95 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-pink-500/15 to-violet-500/10 text-pink-300 border border-pink-500/25 shadow-[0_4px_12px_rgba(236,72,153,0.1)]'
                    : 'hover:bg-[#151936] text-slate-400 hover:text-slate-100 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4.5 h-4.5 ${
                    isActive ? 'text-pink-400 animate-pulse' : 'text-slate-400'
                  }`} />
                  <span>{item.label}</span>
                </div>
                {isActive && (
                  <span className="w-1.5 h-1.5 bg-pink-400 rounded-full shadow-[0_0_8px_rgba(236,72,153,0.8)]" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Secure User Block */}
      <div className="p-4 bg-slate-950/40 border-t border-slate-900" id="user-context-section">
        {currentUser ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border border-slate-800 bg-slate-850 flex items-center justify-center font-bold text-violet-400 uppercase text-sm">
                {currentUser.name ? currentUser.name[0] : 'U'}
              </div>
              <div className="overflow-hidden">
                <h4 className="text-xs font-semibold text-slate-200 truncate">{currentUser.name}</h4>
                <p className="text-[10px] font-mono text-slate-500 truncate">{currentUser.email}</p>
              </div>
            </div>
            <button
              id="sidebar-logout"
              onClick={onLogout}
              className="w-full text-center py-2 bg-slate-900 hover:bg-red-500/10 border border-slate-800 hover:border-red-500/20 text-xs text-slate-400 hover:text-red-400 rounded-lg transition-all cursor-pointer font-medium"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-slate-500 text-center text-balance">Sign in to save alerts and tracker histories.</p>
            <button
              id="sidebar-login"
              onClick={() => setActiveTab('login')}
              className="w-full text-center py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs rounded-lg transition-all cursor-pointer shadow-md shadow-violet-950"
            >
              Register & Sign In
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
