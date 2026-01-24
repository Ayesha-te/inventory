import React, { useState } from 'react';
import { RefreshCw, Settings, CheckCircle, XCircle, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import type { Supermarket } from '../types/Product';

interface POSSyncProps {
  supermarket: Supermarket;
  onUpdatePOS: (supermarketId: string, posConfig: Supermarket['posSystem']) => void;
}

const POSSync: React.FC<POSSyncProps> = ({ supermarket, onUpdatePOS }) => {
  // Guard: If supermarket is undefined, show a message and return
  if (!supermarket) {
    return <div className="text-center text-[#D4AF37] font-semibold py-8">No store selected. Please add or select a store to configure POS sync.</div>;
  }

  const posSystem = supermarket.posSystem || { enabled: false, type: 'none', apiKey: '', syncEnabled: false };

  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncStatus, setLastSyncStatus] = useState<'success' | 'error' | null>(null);
  const [syncProgress, setSyncProgress] = useState(0);

  const [posConfig, setPosConfig] = useState({
    enabled: posSystem.enabled,
    type: posSystem.type,
    apiKey: posSystem.apiKey,
    syncEnabled: posSystem.syncEnabled
  });

  const posTypes = [
    { value: 'none', label: 'No POS Integration', description: 'Manual inventory management only' },
    { value: 'square', label: 'Square POS', description: 'Integrate with Square payment system' },
    { value: 'shopify', label: 'Shopify POS', description: 'Connect with Shopify point-of-sale' },
    { value: 'custom', label: 'Custom POS', description: 'Connect with custom POS system via API' }
  ];

  const handleConfigSave = () => {
    const newConfig = {
      enabled: posConfig.enabled,
      type: posConfig.type,
      apiKey: posConfig.apiKey,
      syncEnabled: posConfig.syncEnabled && posConfig.enabled && posConfig.type !== 'none',
      lastSync: supermarket.posSystem?.lastSync
    };

    onUpdatePOS(supermarket.id, newConfig);
    setIsConfiguring(false);
  };

  const handleSync = async () => {
    if (!posConfig.enabled || posConfig.type === 'none') return;

    setIsSyncing(true);
    setSyncProgress(0);
    setLastSyncStatus(null);

    try {
      // Simulate sync progress
      for (let progress = 0; progress <= 100; progress += 10) {
        setSyncProgress(progress);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Simulate success/failure
      const success = Math.random() > 0.2; // 80% success rate
      
      if (success) {
        setLastSyncStatus('success');
        const now = new Date().toISOString();
        const updatedConfig = {
          ...posConfig,
          lastSync: now
        };
        onUpdatePOS(supermarket.id, updatedConfig);
      } else {
        setLastSyncStatus('error');
      }
    } catch (error) {
      setLastSyncStatus('error');
    } finally {
      setIsSyncing(false);
      setSyncProgress(0);
    }
  };

  const isConnected = posConfig.enabled && posConfig.type !== 'none' && posConfig.apiKey;
  const canSync = isConnected && posConfig.syncEnabled;

  return (
    <div className="bg-[#1A1A1A] border-l-8 border-[#D4AF37] p-8 rounded-xl">
      <div className="flex items-center justify-between mb-8 border-b border-[#D4AF37]/20 pb-6">
        <div className="flex items-center">
          <div className={`p-4 border-2 ${isConnected ? 'bg-[#242424] border-[#D4AF37]' : 'bg-[#242424] border-[#D4AF37]/40'}`}>
            {isConnected ? (
              <Wifi className={`w-8 h-8 ${isConnected ? 'text-[#D4AF37]' : 'text-gray-500'}`} />
            ) : (
              <WifiOff className="w-8 h-8 text-gray-500" />
            )}
          </div>
          <div className="ml-6">
            <h2 className="text-2xl font-bold text-[#D4AF37] uppercase tracking-wide">Store Sync</h2>
            <p className="text-[#E8C547] text-sm">
              {isConnected ? `ACTIVE LINK: ${posConfig.type.toUpperCase()}` : 'OFFLINE: NO CONNECTION'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          {supermarket.posSystem?.lastSync && (
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
              LAST SYNC: {new Date(supermarket.posSystem.lastSync).toLocaleDateString()}
            </div>
          )}
          
          <button
            onClick={() => setIsConfiguring(!isConfiguring)}
            className="p-3 bg-[#242424] text-[#D4AF37] hover:bg-[#333333] transition-colors rounded"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </div>

      {isConfiguring && (
        <div className="bg-[#242424] mb-8 border-l-4 border-[#D4AF37] p-6 rounded-lg">
          <h3 className="font-black text-[#D4AF37] uppercase tracking-widest text-sm mb-6 pb-2 border-b border-[#D4AF37]/20">Settings</h3>
          
          <div className="space-y-6">
            <div>
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={posConfig.enabled}
                  onChange={(e) => setPosConfig({...posConfig, enabled: e.target.checked})}
                  className="mr-3 h-5 w-5 border-2 border-[#D4AF37] accent-[#D4AF37] rounded"
                />
                <span className="text-xs font-black text-[#D4AF37] uppercase tracking-widest group-hover:text-[#E8C547] transition-colors">Enable Sync</span>
              </label>
            </div>

            {posConfig.enabled && (
              <>
                <div>
                  <label className="block text-sm font-bold text-[#D4AF37] mb-2">POS System</label>
                  <select
                    value={posConfig.type}
                    onChange={(e) => setPosConfig({...posConfig, type: e.target.value as any})}
                    className="w-full px-4 py-2 bg-[#1A1A1A] border-2 border-[#D4AF37]/40 rounded text-gray-300 focus:outline-none focus:border-[#D4AF37]"
                  >
                    {posTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label.toUpperCase()}
                      </option>
                    ))}
                  </select>
                  {posConfig.type !== 'none' && (
                    <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest">
                      {posTypes.find(t => t.value === posConfig.type)?.description}
                    </p>
                  )}
                </div>

                {posConfig.type !== 'none' && (
                  <div>
                    <label className="block text-sm font-bold text-[#D4AF37] mb-2">API Key</label>
                    <input
                      type="password"
                      value={posConfig.apiKey}
                      onChange={(e) => setPosConfig({...posConfig, apiKey: e.target.value})}
                      className="w-full px-4 py-2 bg-[#1A1A1A] border-2 border-[#D4AF37]/40 rounded text-gray-300 focus:outline-none focus:border-[#D4AF37]"
                      placeholder="ENTER API KEY"
                    />
                  </div>
                )}

                {posConfig.type !== 'none' && posConfig.apiKey && (
                  <div>
                    <label className="flex items-center cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={posConfig.syncEnabled}
                        onChange={(e) => setPosConfig({...posConfig, syncEnabled: e.target.checked})}
                        className="mr-3 h-5 w-5 border-2 border-[#D4AF37] accent-[#D4AF37] rounded"
                      />
                      <span className="text-xs font-black text-[#D4AF37] uppercase tracking-widest group-hover:text-[#E8C547] transition-colors">Start Auto Sync</span>
                    </label>
                    <p className="text-[10px] font-bold text-gray-400 mt-2 ml-8 uppercase tracking-widest">
                      Keep inventory up to date with your POS
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-[#D4AF37]/20">
            <button
              onClick={() => setIsConfiguring(false)}
              className="px-6 py-2 border-2 border-[#D4AF37] text-[#D4AF37] rounded font-semibold hover:bg-[#D4AF37]/10 transition-colors"
            >
              CANCEL
            </button>
            <button
              onClick={handleConfigSave}
              className="px-6 py-2 bg-[#D4AF37] text-[#0F0F0F] rounded font-semibold hover:bg-[#E8C547] transition-colors"
            >
              SAVE SETTINGS
            </button>
          </div>
        </div>
      )}

      {!isConfiguring && (
        <div className="space-y-6">
          {/* Connection Status */}
          <div className="flex items-center justify-between p-6 bg-[#242424] border border-[#D4AF37]/20 rounded-lg">
            <div className="flex items-center">
              <div className={`w-4 h-4 mr-4 ${isConnected ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-gray-600'}`}></div>
              <div>
                <p className="font-black text-[#D4AF37] uppercase tracking-widest text-sm">
                  {isConnected ? 'LINK ACTIVE' : 'NO LINK'}
                </p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                  {isConnected 
                    ? `${posConfig.type.toUpperCase()} SYSTEM READY` 
                    : 'AWAITING SETTINGS'}
                </p>
              </div>
            </div>
            
            {canSync && (
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="px-6 py-2 bg-[#D4AF37] text-[#0F0F0F] rounded font-semibold flex items-center hover:bg-[#E8C547] transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-3 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'SYNCING...' : 'SYNC NOW'}
              </button>
            )}
          </div>

          {/* Sync Progress */}
          {isSyncing && (
            <div className="p-6 bg-[#242424] border-l-4 border-[#D4AF37] rounded-lg">
              <div className="flex items-center mb-4">
                <AlertCircle className="w-6 h-6 text-[#D4AF37] mr-3" />
                <span className="font-black text-gray-300 uppercase tracking-widest text-xs">Syncing data...</span>
              </div>
              <div className="w-full bg-[#1A1A1A] h-3 rounded-full">
                <div 
                  className="bg-gradient-to-r from-[#D4AF37] to-[#E8C547] h-full transition-all duration-300 rounded-full"
                  style={{ width: `${syncProgress}%` }}
                ></div>
              </div>
              <p className="text-[10px] font-black text-[#D4AF37] mt-3 uppercase tracking-widest">{syncProgress}% COMPLETE</p>
            </div>
          )}

          {/* Last Sync Status */}
          {lastSyncStatus && !isSyncing && (
            <div className={`p-6 border-l-4 rounded-lg ${lastSyncStatus === 'success' ? 'bg-green-900/20 border-green-600' : 'bg-red-900/20 border-red-600'}`}>
              <div className="flex items-center">
                {lastSyncStatus === 'success' ? (
                  <CheckCircle className="w-6 h-6 text-green-500 mr-3" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-500 mr-3" />
                )}
                <span className={`font-black uppercase tracking-widest text-xs ${lastSyncStatus === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                  {lastSyncStatus === 'success' ? 'SYNC SUCCESSFUL' : 'SYNC FAILED'}
                </span>
              </div>
              {lastSyncStatus === 'success' && (
                <p className="text-xs font-bold text-gray-300 mt-2 uppercase opacity-80">
                  Inventory has been updated.
                </p>
              )}
              {lastSyncStatus === 'error' && (
                <p className="text-xs font-bold text-gray-300 mt-2 uppercase opacity-80">
                  Failed to sync. Please check your settings.
                </p>
              )}
            </div>
          )}

          {/* Sync Features */}
          {canSync && (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-[#242424] border-t-4 border-[#D4AF37] rounded-lg">
                <h4 className="font-black text-[#D4AF37] uppercase tracking-widest text-xs mb-4">What gets synced:</h4>
                <ul className="text-[10px] font-bold text-gray-400 space-y-2 uppercase">
                  <li className="flex gap-2"><span className="text-[#D4AF37]">•</span> STOCK LEVELS</li>
                  <li className="flex gap-2"><span className="text-[#D4AF37]">•</span> PRICE UPDATES</li>
                  <li className="flex gap-2"><span className="text-[#D4AF37]">•</span> NEW PRODUCTS</li>
                  <li className="flex gap-2"><span className="text-[#D4AF37]">•</span> REMOVED PRODUCTS</li>
                </ul>
              </div>
              
              <div className="p-6 bg-[#242424] border-t-4 border-[#D4AF37] rounded-lg">
                <h4 className="font-black text-[#D4AF37] uppercase tracking-widest text-xs mb-4">Tips:</h4>
                <ul className="text-[10px] font-bold text-gray-400 space-y-2 uppercase">
                  <li className="flex gap-2"><span className="text-[#D4AF37]">•</span> SYNC WHEN STORE IS NOT BUSY</li>
                  <li className="flex gap-2"><span className="text-[#D4AF37]">•</span> BACKUP BEFORE SYNC</li>
                  <li className="flex gap-2"><span className="text-[#D4AF37]">•</span> CHECK FOR ERRORS</li>
                  <li className="flex gap-2"><span className="text-[#D4AF37]">•</span> TRY WITH A FEW ITEMS FIRST</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default POSSync;