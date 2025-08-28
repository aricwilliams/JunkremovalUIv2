import React, { useState } from 'react';
import { 
  Settings, 
  User, 
  Building, 
  MapPin, 
  CreditCard, 
  Bell, 
  Shield,
  Smartphone,
  Mail,
  DollarSign,
  Clock,
  Users,
  Save
} from 'lucide-react';

const SettingsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState('business');
  const [settings, setSettings] = useState({
    business: {
      name: 'TarheelJunk Removal',
      phone: '(555) 123-4567',
      email: 'info@tarheeljunk.com',
      address: '123 Business St',
      city: 'Raleigh',
      state: 'NC',
      zipCode: '27601',
      website: 'https://tarheeljunk.com',
      logo: ''
    },
    pricing: {
      laborRate: 50,
      minimumJob: 75,
      travelFee: 25,
      disposalFee: 20,
      difficultyMultiplier: 1.5,
      urgentJobFee: 50
    },
    schedule: {
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      startTime: '8:00',
      endTime: '18:00',
      lunchBreak: true,
      lunchStart: '12:00',
      lunchEnd: '13:00',
      bufferTime: 30,
      maxJobsPerDay: 8
    },
    notifications: {
      emailBookings: true,
      smsBookings: true,
      reminderEmails: true,
      reminderSms: true,
      reviewRequests: true,
      followUpEmails: true,
      crewNotifications: true
    },
    team: {
      defaultCrew: 'Alpha Team',
      requireCheckIn: true,
      allowPhotoUpload: true,
      trackTime: true,
      autoAssignJobs: false
    }
  });

  const tabs = [
    { id: 'business', label: 'Business Info', icon: Building },
    { id: 'pricing', label: 'Pricing', icon: DollarSign },
    { id: 'schedule', label: 'Schedule', icon: Clock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'account', label: 'Account', icon: User }
  ];

  const handleSaveSettings = () => {
    // In a real app, this would save to backend
    alert('Settings saved successfully!');
  };

  const updateSetting = (category: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const renderBusinessSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Business Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
            <input
              type="text"
              value={settings.business.name}
              onChange={(e) => updateSetting('business', 'name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input
              type="tel"
              value={settings.business.phone}
              onChange={(e) => updateSetting('business', 'phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={settings.business.email}
              onChange={(e) => updateSetting('business', 'email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
            <input
              type="url"
              value={settings.business.website}
              onChange={(e) => updateSetting('business', 'website', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <input
              type="text"
              value={settings.business.address}
              onChange={(e) => updateSetting('business', 'address', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
            <input
              type="text"
              value={settings.business.city}
              onChange={(e) => updateSetting('business', 'city', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
            <select
              value={settings.business.state}
              onChange={(e) => updateSetting('business', 'state', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="NC">North Carolina</option>
              <option value="SC">South Carolina</option>
              <option value="VA">Virginia</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPricingSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Pricing Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Labor Rate (per hour)</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                value={settings.pricing.laborRate}
                onChange={(e) => updateSetting('pricing', 'laborRate', Number(e.target.value))}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Job</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                value={settings.pricing.minimumJob}
                onChange={(e) => updateSetting('pricing', 'minimumJob', Number(e.target.value))}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Travel Fee</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                value={settings.pricing.travelFee}
                onChange={(e) => updateSetting('pricing', 'travelFee', Number(e.target.value))}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Disposal Fee</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                value={settings.pricing.disposalFee}
                onChange={(e) => updateSetting('pricing', 'disposalFee', Number(e.target.value))}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderScheduleSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Schedule Configuration</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Working Days</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                <label key={day} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.schedule.workingDays.includes(day)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        updateSetting('schedule', 'workingDays', [...settings.schedule.workingDays, day]);
                      } else {
                        updateSetting('schedule', 'workingDays', settings.schedule.workingDays.filter(d => d !== day));
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">{day}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
              <input
                type="time"
                value={settings.schedule.startTime}
                onChange={(e) => updateSetting('schedule', 'startTime', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
              <input
                type="time"
                value={settings.schedule.endTime}
                onChange={(e) => updateSetting('schedule', 'endTime', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          {[
            { key: 'emailBookings', label: 'Email notifications for new bookings' },
            { key: 'smsBookings', label: 'SMS notifications for new bookings' },
            { key: 'reminderEmails', label: 'Send reminder emails to customers' },
            { key: 'reminderSms', label: 'Send reminder SMS to customers' },
            { key: 'reviewRequests', label: 'Auto-send review requests' },
            { key: 'followUpEmails', label: 'Follow-up emails after jobs' },
            { key: 'crewNotifications', label: 'Crew notification updates' }
          ].map(setting => (
            <label key={setting.key} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications[setting.key]}
                onChange={(e) => updateSetting('notifications', setting.key, e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{setting.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTeamSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Team Configuration</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Default Crew</label>
            <select
              value={settings.team.defaultCrew}
              onChange={(e) => updateSetting('team', 'defaultCrew', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Alpha Team">Alpha Team</option>
              <option value="Beta Team">Beta Team</option>
              <option value="Gamma Team">Gamma Team</option>
            </select>
          </div>
          
          <div className="space-y-3">
            {[
              { key: 'requireCheckIn', label: 'Require crew check-in for jobs' },
              { key: 'allowPhotoUpload', label: 'Allow crew to upload photos' },
              { key: 'trackTime', label: 'Track time for each job' },
              { key: 'autoAssignJobs', label: 'Auto-assign jobs to available crews' }
            ].map(setting => (
              <label key={setting.key} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.team[setting.key]}
                  onChange={(e) => updateSetting('team', setting.key, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{setting.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAccountSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Account Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value="admin@tarheeljunk.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Two-Factor Authentication</label>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Enable 2FA for additional security</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'business': return renderBusinessSettings();
      case 'pricing': return renderPricingSettings();
      case 'schedule': return renderScheduleSettings();
      case 'notifications': return renderNotificationSettings();
      case 'team': return renderTeamSettings();
      case 'account': return renderAccountSettings();
      default: return renderBusinessSettings();
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-3">
        <Settings className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500">Configure your business settings</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full lg:w-64 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <nav className="space-y-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {renderTabContent()}
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handleSaveSettings}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;