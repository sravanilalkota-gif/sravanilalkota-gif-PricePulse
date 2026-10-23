import { useState, FormEvent } from 'react';
import { 
  User as UserIcon, 
  Settings, 
  Sliders, 
  SlidersHorizontal,
  Mail, 
  ShieldCheck, 
  Database,
  ArrowRight
} from 'lucide-react';
import { User } from '../types';

interface UserProfileProps {
  currentUser: User | null;
  onUpdateName?: (newName: string) => void;
  setActiveTab: (tab: string) => void;
}

export default function UserProfile({ currentUser, onUpdateName, setActiveTab }: UserProfileProps) {
  const [profileName, setProfileName] = useState(currentUser?.name || 'Recruiter Guest');
  const [dbType, setDbType] = useState<'sqlite' | 'postgres'>('sqlite');
  const [scrapersConcurrency, setScrapersConcurrency] = useState<number>(5);
  const [isSuccessPrompt, setIsSuccessPrompt] = useState(false);

  const handleUpdateProfile = (e: FormEvent) => {
    e.preventDefault();
    if (onUpdateName) {
      onUpdateName(profileName);
    }
    setIsSuccessPrompt(true);
    setTimeout(() => {
      setIsSuccessPrompt(false);
    }, 2000);
  };

  return (
    <div id="profile-view" className="space-y-8 py-6 px-4 max-w-4xl mx-auto text-slate-100 animate-fade-in">
      
      {/* Header */}
      <div className="pb-3 border-b border-slate-800">
        <h2 className="text-xl font-bold text-white tracking-tight">System Account Settings</h2>
        <p className="text-xs text-slate-500 font-sans mt-0.5">Edit credentials states and configure concurrent scraper loops limits.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="profile-body-grid">
        
        {/* Left Column Profile info card */}
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-850 flex flex-col items-center justify-between text-center gap-4 h-fit" id="profile-card">
          <div className="space-y-3 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full border-2 border-violet-500/20 bg-slate-950 flex items-center justify-center font-bold text-violet-400 text-2xl uppercase">
              {profileName ? profileName[0] : 'U'}
            </div>
            
            <div className="space-y-1 overflow-hidden w-full">
              <h3 className="text-sm font-bold text-white leading-none">{profileName}</h3>
              <p className="text-[10px] text-slate-500 font-mono truncate">{currentUser?.email || 'guest@pricepulse.local'}</p>
            </div>
          </div>

          <div className="w-full text-left space-y-2 py-3 border-t border-b border-slate-850/60 text-[10px] font-mono text-slate-500">
            <p className="flex justify-between">
              <span>Account Status:</span>
              <span className="text-emerald-400 font-semibold">[VERIFIED]</span>
            </p>
            <p className="flex justify-between">
              <span>Relational DB:</span>
              <span className="text-slate-300 capitalize">{dbType} Engine</span>
            </p>
            <p className="flex justify-between">
              <span>Joined Session:</span>
              <span className="text-slate-400">June 2026</span>
            </p>
          </div>

          <button
            id="btn-profile-gotoportfolio"
            onClick={() => setActiveTab('portfolio')}
            className="w-full py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-[10px] font-bold uppercase tracking-wider text-slate-300 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all"
          >
            <span>Audit Architecture</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Columns Settings sliders & controls */}
        <div className="md:col-span-2 space-y-6" id="profile-settings-sheet">
          
          {/* Identity editing form block */}
          <form onSubmit={handleUpdateProfile} className="p-6 rounded-2xl bg-slate-900/40 border border-slate-850 space-y-4" id="form-identity">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest font-mono">Profile Credentials</h4>
            
            <div className="space-y-1.5" id="profile-field-name">
              <label className="text-xs font-medium text-slate-400">Display Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl text-slate-100 text-sm focus:outline-none transition-all font-sans"
                  required
                />
              </div>
            </div>

            {isSuccessPrompt && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs" id="profile-save-success">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-sans leading-none">Database credentials updated successfully.</span>
              </div>
            )}

            <div className="flex justify-end pt-1">
              <button
                id="btn-profile-save"
                type="submit"
                className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs rounded-xl transition-all cursor-pointer shadow-md"
              >
                Update Display Profile
              </button>
            </div>
          </form>

          {/* Infrastructure parameters modifiers */}
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-850 space-y-4" id="settings-infrastructure">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest font-mono">Concurrency & Caching</h4>
            
            <div className="space-y-4 font-sans text-xs">
              
              {/* SQLite vs Postgres toggle choice */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <span className="text-slate-300 font-semibold block">Target SQL Database System</span>
                  <span className="text-[10px] text-slate-500">Choose between standalone local development or heavy workloads postgres environments.</span>
                </div>
                
                <div className="flex bg-slate-950 p-1.5 rounded-lg border border-slate-850" id="db-engine-selectors">
                  <button
                    id="btn-db-select-sqlite"
                    onClick={() => setDbType('sqlite')}
                    className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all cursor-pointer ${
                      dbType === 'sqlite' ? 'bg-violet-600 text-white shadow' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    SQLite
                  </button>
                  <button
                    id="btn-db-select-postgres"
                    onClick={() => setDbType('postgres')}
                    className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all cursor-pointer ${
                      dbType === 'postgres' ? 'bg-violet-600 text-white shadow' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    Postgres
                  </button>
                </div>
              </div>

              <div className="h-px bg-slate-850/60" />

              {/* Scrapers Concurrency Limit Range slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-baseline gap-4">
                  <div>
                    <span className="text-slate-300 font-semibold block">Async Scraper Network Ports Limit</span>
                    <span className="text-[10px] text-slate-500">Increase or throttles parallel scrapers connections requests inside FastAPI Asyncio routines.</span>
                  </div>
                  <span className="text-sm font-bold font-mono text-violet-400 bg-slate-950 px-2 py-1 rounded border border-slate-800 select-none">
                    {scrapersConcurrency} concurrent
                  </span>
                </div>
                
                <input
                  id="concurrency-range-slider"
                  type="range"
                  min="2"
                  max="12"
                  value={scrapersConcurrency}
                  onChange={(e) => setScrapersConcurrency(parseInt(e.target.value))}
                  className="w-full accent-violet-500 h-1 bg-slate-950 rounded-lg cursor-pointer"
                />
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
