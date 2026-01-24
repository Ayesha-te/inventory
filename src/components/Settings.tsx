import React, { useState } from 'react';
import { Settings as SettingsIcon, Bell, Shield, Database, Globe, Save, Cpu, Activity, ShieldCheck, Lock, Terminal, Radio } from 'lucide-react';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState({
    notifications: {
      expiryAlerts: true,
      lowStockAlerts: true,
      newRegistrations: true,
      emailNotifications: true
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordExpiry: 90
    },
    system: {
      autoBackup: true,
      backupFrequency: 'daily',
      dataRetention: 365
    },
    display: {
      language: 'en',
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY'
    }
  });

  const handleSettingChange = (category: string, setting: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [setting]: value
      }
    }));
  };

  const handleSave = () => {
    alert('Settings saved successfully');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Header - App Settings */}
      <div className="bg-[#020617] rounded-[48px] border border-white/10 shadow-2xl p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#B7F000]/5 rounded-full -mr-72 -mt-72 blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full -ml-48 -mb-48 blur-[100px]"></div>
        
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center">
            <div className="bg-[#B7F000] p-6 rounded-[24px] mr-10 rotate-3 shadow-[0_12px_40px_rgba(183,240,0,0.4)]">
              <SettingsIcon className="w-12 h-12 text-[#020617] -rotate-3" />
            </div>
            <div>
              <h2 className="text-6xl font-black text-white tracking-tighter mb-4 uppercase">App Settings</h2>
              <div className="flex items-center gap-4">
                <Terminal className="w-5 h-5 text-[#B7F000]" />
                <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-xs">Manage your app settings and security</p>
              </div>
            </div>
          </div>
          
          <div className="hidden lg:flex flex-col items-end">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-[#B7F000] rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black text-[#B7F000] uppercase tracking-widest">System Online</span>
            </div>
            <p className="text-gray-500 text-[9px] font-black uppercase tracking-tighter">Lat: 34.0151 | Long: 71.5249</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Notifications - Alerts */}
        <div className="bg-[#020617] rounded-[48px] border border-white/10 shadow-xl overflow-hidden group">
          <div className="bg-white/5 p-8 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-[#B7F000]/20 p-3 rounded-xl mr-5">
                <Bell className="w-6 h-6 text-[#B7F000]" />
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-widest">Alerts</h3>
            </div>
            <Activity className="w-5 h-5 text-gray-500 group-hover:text-[#B7F000] transition-colors" />
          </div>

          <div className="p-10 space-y-10">
            {[
              { cat: 'notifications', key: 'expiryAlerts', title: 'Expiry Alerts', desc: 'Notify 30 days before items expire' },
              { cat: 'notifications', key: 'lowStockAlerts', title: 'Low Stock Alerts', desc: 'Notify when stock is low' },
              { cat: 'notifications', key: 'newRegistrations', title: 'New Store Alerts', desc: 'Notify when new stores are added' },
              { cat: 'notifications', key: 'emailNotifications', title: 'Email Alerts', desc: 'Send alerts to your email' }
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between group/item">
                <div className="flex-1">
                  <p className="text-sm font-black text-white uppercase tracking-widest group-hover/item:text-[#B7F000] transition-colors">{item.title}</p>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tight mt-1">{item.desc}</p>
                </div>
                <button 
                  onClick={() => handleSettingChange(item.cat, item.key, !settings.notifications[item.key as keyof typeof settings.notifications])}
                  className={`relative w-16 h-8 rounded-full transition-all duration-500 ${settings.notifications[item.key as keyof typeof settings.notifications] ? 'bg-[#B7F000]' : 'bg-white/10 border border-white/10'}`}
                >
                  <div className={`absolute top-1 left-1 h-6 w-6 rounded-full transition-all duration-500 ${settings.notifications[item.key as keyof typeof settings.notifications] ? 'translate-x-8 bg-[#020617]' : 'translate-x-0 bg-gray-500'}`}></div>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-[#020617] rounded-[48px] border border-white/10 shadow-xl overflow-hidden group">
          <div className="bg-white/5 p-8 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-[#B7F000]/20 p-3 rounded-xl mr-5">
                <Shield className="w-6 h-6 text-[#B7F000]" />
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-widest">Security Settings</h3>
            </div>
            <Lock className="w-5 h-5 text-gray-500 group-hover:text-[#B7F000] transition-colors" />
          </div>

          <div className="p-10 space-y-8">
            <div className="flex items-center justify-between p-6 bg-white/5 rounded-[32px] border border-white/10 group/item hover:border-[#B7F000]/30 transition-all">
              <div>
                <p className="text-sm font-black text-white uppercase tracking-widest group-hover/item:text-[#B7F000] transition-colors">Two-Step Login</p>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tight mt-1">Extra security for your account</p>
              </div>
              <button 
                onClick={() => handleSettingChange('security', 'twoFactorAuth', !settings.security.twoFactorAuth)}
                className={`relative w-14 h-7 rounded-full transition-all duration-500 ${settings.security.twoFactorAuth ? 'bg-[#B7F000]' : 'bg-white/10 border border-white/10'}`}
              >
                <div className={`absolute top-1 left-1 h-5 w-5 rounded-full transition-all duration-500 ${settings.security.twoFactorAuth ? 'translate-x-7 bg-[#020617]' : 'translate-x-0 bg-gray-500'}`}></div>
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] ml-2">SESSION TIMEOUT (MINUTES)</label>
              <select
                value={settings.security.sessionTimeout}
                onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                className="w-full px-8 py-5 bg-white/5 border border-white/10 rounded-3xl focus:ring-4 focus:ring-[#B7F000]/20 focus:border-[#B7F000] text-white font-bold outline-none transition-all appearance-none"
              >
                {[15, 30, 60, 120].map(v => (
                  <option key={v} value={v} className="bg-[#020617]">{v} Minutes</option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="block text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] ml-2">PASSWORD EXPIRY (DAYS)</label>
              <select
                value={settings.security.passwordExpiry}
                onChange={(e) => handleSettingChange('security', 'passwordExpiry', parseInt(e.target.value))}
                className="w-full px-8 py-5 bg-white/5 border border-white/10 rounded-3xl focus:ring-4 focus:ring-[#B7F000]/20 focus:border-[#B7F000] text-white font-bold outline-none transition-all appearance-none"
              >
                {[30, 60, 90, 180, 365].map(v => (
                  <option key={v} value={v} className="bg-[#020617]">{v} Days</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* System & Backup */}
        <div className="bg-[#020617] rounded-[48px] border border-white/10 shadow-xl overflow-hidden group">
          <div className="bg-white/5 p-8 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-[#B7F000]/20 p-3 rounded-xl mr-5">
                <Database className="w-6 h-6 text-[#B7F000]" />
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-widest">System & Backup</h3>
            </div>
            <ShieldCheck className="w-5 h-5 text-gray-500 group-hover:text-[#B7F000] transition-colors" />
          </div>

          <div className="p-10 space-y-8">
            <div className="flex items-center justify-between p-6 bg-white/5 rounded-[32px] border border-white/10 group/item hover:border-[#B7F000]/30 transition-all">
              <div>
                <p className="text-sm font-black text-white uppercase tracking-widest group-hover/item:text-[#B7F000] transition-colors">Auto Backup</p>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tight mt-1">Back up data automatically</p>
              </div>
              <button 
                onClick={() => handleSettingChange('system', 'autoBackup', !settings.system.autoBackup)}
                className={`relative w-14 h-7 rounded-full transition-all duration-500 ${settings.system.autoBackup ? 'bg-[#B7F000]' : 'bg-white/10 border border-white/10'}`}
              >
                <div className={`absolute top-1 left-1 h-5 w-5 rounded-full transition-all duration-500 ${settings.system.autoBackup ? 'translate-x-7 bg-[#020617]' : 'translate-x-0 bg-gray-500'}`}></div>
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] ml-2">BACKUP FREQUENCY</label>
              <select
                value={settings.system.backupFrequency}
                onChange={(e) => handleSettingChange('system', 'backupFrequency', e.target.value)}
                className="w-full px-8 py-5 bg-white/5 border border-white/10 rounded-3xl focus:ring-4 focus:ring-[#B7F000]/20 focus:border-[#B7F000] text-white font-bold outline-none transition-all appearance-none"
              >
                {['hourly', 'daily', 'weekly', 'monthly'].map(v => (
                  <option key={v} value={v} className="bg-[#020617] font-bold uppercase">{v} Schedule</option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="block text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] ml-2">DATA RETENTION (DAYS)</label>
              <select
                value={settings.system.dataRetention}
                onChange={(e) => handleSettingChange('system', 'dataRetention', parseInt(e.target.value))}
                className="w-full px-8 py-5 bg-white/5 border border-white/10 rounded-3xl focus:ring-4 focus:ring-[#B7F000]/20 focus:border-[#B7F000] text-white font-bold outline-none transition-all appearance-none"
              >
                {[90, 180, 365, 730, 1095].map(v => (
                  <option key={v} value={v} className="bg-[#020617]">{v} Days</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Language & Time */}
        <div className="bg-[#020617] rounded-[48px] border border-white/10 shadow-xl overflow-hidden group">
          <div className="bg-white/5 p-8 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-[#B7F000]/20 p-3 rounded-xl mr-5">
                <Globe className="w-6 h-6 text-[#B7F000]" />
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-widest">Language & Time</h3>
            </div>
            <Radio className="w-5 h-5 text-gray-500 group-hover:text-[#B7F000] transition-colors" />
          </div>

          <div className="p-10 space-y-8">
            <div className="space-y-3">
              <label className="block text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] ml-2">SYSTEM LANGUAGE</label>
              <select
                value={settings.display.language}
                onChange={(e) => handleSettingChange('display', 'language', e.target.value)}
                className="w-full px-8 py-5 bg-white/5 border border-white/10 rounded-3xl focus:ring-4 focus:ring-[#B7F000]/20 focus:border-[#B7F000] text-white font-bold outline-none transition-all appearance-none"
              >
                <option value="en" className="bg-[#020617]">English (US)</option>
                <option value="ar" className="bg-[#020617]">العربية (Arabic)</option>
                <option value="ur" className="bg-[#020617]">اردو (Urdu)</option>
                <option value="tr" className="bg-[#020617]">Türkçe (Turkish)</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="block text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] ml-2">TIME ZONE</label>
              <select
                value={settings.display.timezone}
                onChange={(e) => handleSettingChange('display', 'timezone', e.target.value)}
                className="w-full px-8 py-5 bg-white/5 border border-white/10 rounded-3xl focus:ring-4 focus:ring-[#B7F000]/20 focus:border-[#B7F000] text-white font-bold outline-none transition-all appearance-none"
              >
                {['UTC', 'EST', 'PST', 'GMT', 'CET'].map(v => (
                  <option key={v} value={v} className="bg-[#020617]">{v}</option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="block text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] ml-2">DATE FORMAT</label>
              <select
                value={settings.display.dateFormat}
                onChange={(e) => handleSettingChange('display', 'dateFormat', e.target.value)}
                className="w-full px-8 py-5 bg-white/5 border border-white/10 rounded-3xl focus:ring-4 focus:ring-[#B7F000]/20 focus:border-[#B7F000] text-white font-bold outline-none transition-all appearance-none"
              >
                {['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'].map(v => (
                  <option key={v} value={v} className="bg-[#020617]">{v}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-12">
        <button
          onClick={handleSave}
          className="px-16 py-6 bg-[#B7F000] hover:bg-[#A3D900] text-[#020617] rounded-[24px] font-black text-sm uppercase tracking-[0.3em] transition-all shadow-[0_12px_50px_rgba(183,240,0,0.4)] hover:shadow-[0_20px_70px_rgba(183,240,0,0.6)] hover:-translate-y-2 flex items-center gap-4"
        >
          <Save className="w-6 h-6" />
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default Settings;