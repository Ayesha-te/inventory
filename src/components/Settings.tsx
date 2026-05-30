import React, { useState } from 'react';
import {
  Bell,
  Database,
  Globe,
  Lock,
  Radio,
  Save,
  Settings as SettingsIcon,
  Shield,
} from 'lucide-react';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState({
    notifications: {
      expiryAlerts: true,
      lowStockAlerts: true,
      newRegistrations: true,
      emailNotifications: true,
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordExpiry: 90,
    },
    system: {
      autoBackup: true,
      backupFrequency: 'daily',
      dataRetention: 365,
    },
    display: {
      language: 'en',
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
    },
  });

  const handleSettingChange = (category: string, setting: string, value: any) => {
    setSettings((previous) => ({
      ...previous,
      [category]: {
        ...previous[category as keyof typeof previous],
        [setting]: value,
      },
    }));
  };

  const handleSave = () => {
    alert('Your settings have been saved.');
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-slate-900 p-3 text-white">
              <SettingsIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Workspace</p>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">Settings</h2>
              <p className="mt-2 text-sm text-slate-500">
                Manage alerts, security, backups, and regional preferences.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <Save className="h-4 w-4" />
            Save
          </button>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <SettingsCard
          icon={<Bell className="h-5 w-5 text-sky-600" />}
          title="Notifications"
          description="Choose which updates you want to receive."
        >
          <div className="space-y-3">
            <ToggleRow
              title="Expiry reminders"
              description="Get a reminder before products expire."
              checked={settings.notifications.expiryAlerts}
              onChange={() =>
                handleSettingChange('notifications', 'expiryAlerts', !settings.notifications.expiryAlerts)
              }
            />
            <ToggleRow
              title="Low stock warnings"
              description="Get notified when stock reaches its low level."
              checked={settings.notifications.lowStockAlerts}
              onChange={() =>
                handleSettingChange('notifications', 'lowStockAlerts', !settings.notifications.lowStockAlerts)
              }
            />
            <ToggleRow
              title="New store notices"
              description="See updates when a store or branch is added."
              checked={settings.notifications.newRegistrations}
              onChange={() =>
                handleSettingChange(
                  'notifications',
                  'newRegistrations',
                  !settings.notifications.newRegistrations
                )
              }
            />
            <ToggleRow
              title="Email updates"
              description="Send important updates to my email."
              checked={settings.notifications.emailNotifications}
              onChange={() =>
                handleSettingChange(
                  'notifications',
                  'emailNotifications',
                  !settings.notifications.emailNotifications
                )
              }
            />
          </div>
        </SettingsCard>

        <SettingsCard
          icon={<Shield className="h-5 w-5 text-emerald-600" />}
          title="Security"
          description="Keep accounts and sessions protected."
        >
          <div className="space-y-4">
            <ToggleRow
              title="Two-step verification"
              description="Add an extra sign-in check for your account."
              checked={settings.security.twoFactorAuth}
              onChange={() =>
                handleSettingChange('security', 'twoFactorAuth', !settings.security.twoFactorAuth)
              }
            />
            <SelectField
              label="Sign out after inactivity"
              value={String(settings.security.sessionTimeout)}
              onChange={(value) => handleSettingChange('security', 'sessionTimeout', Number(value))}
              options={[15, 30, 60, 120].map((value) => ({
                value: String(value),
                label: `${value} minutes`,
              }))}
            />
            <SelectField
              label="Ask for a new password after"
              value={String(settings.security.passwordExpiry)}
              onChange={(value) => handleSettingChange('security', 'passwordExpiry', Number(value))}
              options={[30, 60, 90, 180, 365].map((value) => ({
                value: String(value),
                label: `${value} days`,
              }))}
            />
          </div>
        </SettingsCard>

        <SettingsCard
          icon={<Database className="h-5 w-5 text-violet-600" />}
          title="Backups & Data"
          description="Control backup timing and retention."
        >
          <div className="space-y-4">
            <ToggleRow
              title="Automatic backup"
              description="Create backup copies on a schedule."
              checked={settings.system.autoBackup}
              onChange={() => handleSettingChange('system', 'autoBackup', !settings.system.autoBackup)}
            />
            <SelectField
              label="Back up every"
              value={settings.system.backupFrequency}
              onChange={(value) => handleSettingChange('system', 'backupFrequency', value)}
              options={['hourly', 'daily', 'weekly', 'monthly'].map((value) => ({
                value,
                label: value.charAt(0).toUpperCase() + value.slice(1),
              }))}
            />
            <SelectField
              label="Keep backups for"
              value={String(settings.system.dataRetention)}
              onChange={(value) => handleSettingChange('system', 'dataRetention', Number(value))}
              options={[90, 180, 365, 730, 1095].map((value) => ({
                value: String(value),
                label: `${value} days`,
              }))}
            />
          </div>
        </SettingsCard>

        <SettingsCard
          icon={<Globe className="h-5 w-5 text-amber-600" />}
          title="Language & Region"
          description="Set language, time zone, and date display."
        >
          <div className="space-y-4">
            <SelectField
              label="Language"
              value={settings.display.language}
              onChange={(value) => handleSettingChange('display', 'language', value)}
              options={[
                { value: 'en', label: 'English (US)' },
                { value: 'ar', label: 'Arabic' },
                { value: 'ur', label: 'Urdu' },
                { value: 'tr', label: 'Turkish' },
              ]}
            />
            <SelectField
              label="Time zone"
              value={settings.display.timezone}
              onChange={(value) => handleSettingChange('display', 'timezone', value)}
              options={['UTC', 'EST', 'PST', 'GMT', 'CET'].map((value) => ({
                value,
                label: value,
              }))}
            />
            <SelectField
              label="Date format"
              value={settings.display.dateFormat}
              onChange={(value) => handleSettingChange('display', 'dateFormat', value)}
              options={['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'].map((value) => ({
                value,
                label: value,
              }))}
            />
          </div>
        </SettingsCard>
      </div>
    </div>
  );
};

const SettingsCard = ({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) => (
  <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
    <div className="flex items-start gap-4 border-b border-slate-100 pb-4">
      <div className="rounded-2xl bg-slate-100 p-3">{icon}</div>
      <div>
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
    </div>
    <div className="mt-5">{children}</div>
  </section>
);

const ToggleRow = ({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) => (
  <div className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-4">
    <div className="pr-4">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-1 text-xs text-slate-500">{description}</p>
    </div>

    <button
      type="button"
      onClick={onChange}
      className={`relative h-7 w-12 rounded-full transition ${
        checked ? 'bg-emerald-500' : 'bg-slate-200'
      }`}
      aria-pressed={checked}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
          checked ? 'left-6' : 'left-1'
        }`}
      />
    </button>
  </div>
);

const SelectField = ({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) => (
  <div>
    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
      {label}
    </label>
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
        <Radio className="h-4 w-4" />
      </div>
    </div>
  </div>
);

export default Settings;
