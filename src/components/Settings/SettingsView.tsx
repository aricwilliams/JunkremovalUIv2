import React, { useState, useEffect } from 'react';
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
  Save,
  Loader2
} from 'lucide-react';
import { businessService, BusinessProfile, BusinessUpdateData } from '../../services/businessService';
import { useAuth } from '../../contexts/AuthContext';

const SettingsView: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('business');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  
  const [settings, setSettings] = useState({
    business: {
      name: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      website: '',
      logo: '',
      ownerFirstName: '',
      ownerLastName: '',
      ownerPhone: '',
      licenseNumber: '',
      insuranceNumber: '',
      serviceRadius: 0,
      numberOfTrucks: 0,
      yearsInBusiness: 0
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
      googleReviewLink: '',
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
    // { id: 'pricing', label: 'Pricing', icon: DollarSign },
    //{ id: 'schedule', label: 'Schedule', icon: Clock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  //  { id: 'team', label: 'Team', icon: Users },
   // { id: 'account', label: 'Account', icon: User }
  ];

  // Load business profile on component mount
  useEffect(() => {
    const loadBusinessProfile = async () => {
      if (!user) return;
      
      setLoading(true);
      setError('');
      
      try {
        const profile = await businessService.getProfile();
        setBusinessProfile(profile);
        
        // Update settings with loaded data
        setSettings(prev => ({
          ...prev,
          business: {
            name: profile.business_name || '',
            phone: profile.business_phone || '',
            email: profile.owner_email || '',
            address: profile.business_address || '',
            city: profile.business_city || '',
            state: profile.business_state || '',
            zipCode: profile.business_zip_code || '',
            website: '', // Not in API response
            logo: '', // Not in API response
            ownerFirstName: profile.owner_first_name || '',
            ownerLastName: profile.owner_last_name || '',
            ownerPhone: profile.owner_phone || '',
            licenseNumber: profile.license_number || '',
            insuranceNumber: profile.insurance_number || '',
            serviceRadius: profile.service_radius || 0,
            numberOfTrucks: profile.number_of_trucks || 0,
            yearsInBusiness: profile.years_in_business || 0
          }
        }));
      } catch (error: any) {
        setError(error.message);
        console.error('Failed to load business profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBusinessProfile();
  }, [user]);

  const handleSaveSettings = async () => {
    if (activeTab !== 'business') {
      // For other tabs, just show success message for now
      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const updateData: BusinessUpdateData = {
        business_name: settings.business.name,
        business_phone: settings.business.phone,
        business_address: settings.business.address,
        business_city: settings.business.city,
        business_state: settings.business.state,
        business_zip_code: settings.business.zipCode,
        owner_first_name: settings.business.ownerFirstName,
        owner_last_name: settings.business.ownerLastName,
        owner_phone: settings.business.ownerPhone,
        license_number: settings.business.licenseNumber,
        insurance_number: settings.business.insuranceNumber,
        service_radius: settings.business.serviceRadius,
        number_of_trucks: settings.business.numberOfTrucks,
        years_in_business: settings.business.yearsInBusiness
      };

      const response = await businessService.updateProfile(updateData);
      
      if (response.success) {
        setBusinessProfile(response.data.business);
        setSuccess('Business profile updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.message || 'Failed to update profile');
      }
    } catch (error: any) {
      setError(error.message);
      console.error('Failed to save business settings:', error);
    } finally {
      setSaving(false);
    }
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

  const renderBusinessSettings = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading business profile...</span>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Error/Success Messages */}
        {error && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            ❌ {error}
          </div>
        )}
        {success && (
          <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            ✅ {success}
          </div>
        )}

        {/* Business Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Business Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Name *</label>
              <input
                type="text"
                value={settings.business.name}
                onChange={(e) => updateSetting('business', 'name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Phone *</label>
              <input
                type="tel"
                value={settings.business.phone}
                onChange={(e) => updateSetting('business', 'phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Owner Email</label>
              <input
                type="email"
                value={settings.business.email}
                onChange={(e) => updateSetting('business', 'email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed here</p>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Address *</label>
              <input
                type="text"
                value={settings.business.address}
                onChange={(e) => updateSetting('business', 'address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
              <input
                type="text"
                value={settings.business.city}
                onChange={(e) => updateSetting('business', 'city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
              <select
                value={settings.business.state}
                onChange={(e) => updateSetting('business', 'state', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select State</option>
                <option value="NC">North Carolina</option>
                <option value="SC">South Carolina</option>
                <option value="VA">Virginia</option>
                <option value="GA">Georgia</option>
                <option value="TN">Tennessee</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code *</label>
              <input
                type="text"
                value={settings.business.zipCode}
                onChange={(e) => updateSetting('business', 'zipCode', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>
        </div>

        {/* Owner Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Owner Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
              <input
                type="text"
                value={settings.business.ownerFirstName}
                onChange={(e) => updateSetting('business', 'ownerFirstName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
              <input
                type="text"
                value={settings.business.ownerLastName}
                onChange={(e) => updateSetting('business', 'ownerLastName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Owner Phone</label>
              <input
                type="tel"
                value={settings.business.ownerPhone}
                onChange={(e) => updateSetting('business', 'ownerPhone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Business Details */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Business Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">License Number</label>
              <input
                type="text"
                value={settings.business.licenseNumber}
                onChange={(e) => updateSetting('business', 'licenseNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Insurance Number</label>
              <input
                type="text"
                value={settings.business.insuranceNumber}
                onChange={(e) => updateSetting('business', 'insuranceNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Service Radius (miles)</label>
              <input
                type="number"
                min="0"
                value={settings.business.serviceRadius}
                onChange={(e) => updateSetting('business', 'serviceRadius', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Number of Trucks</label>
              <input
                type="number"
                min="0"
                value={settings.business.numberOfTrucks}
                onChange={(e) => updateSetting('business', 'numberOfTrucks', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Years in Business</label>
              <input
                type="number"
                min="0"
                value={settings.business.yearsInBusiness}
                onChange={(e) => updateSetting('business', 'yearsInBusiness', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

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
        
        {/* Google Review Link Section */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-md font-medium text-blue-900 mb-3">📝 Review Management</h4>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Google Review Link
            </label>
            <input
              type="url"
              value={settings.notifications.googleReviewLink}
              onChange={(e) => updateSetting('notifications', 'googleReviewLink', e.target.value)}
              placeholder="https://g.page/r/your-business/review"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              This link will be included in SMS messages when requesting reviews from customers.
            </p>
          </div>
        </div>

        {/* Notification Toggles */}
      
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
              disabled={saving || loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Settings</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;