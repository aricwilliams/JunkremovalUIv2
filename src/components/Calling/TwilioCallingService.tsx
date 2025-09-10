import React, { useState, useEffect } from 'react';
import { useUserPhoneNumbers } from '../../contexts/UserPhoneNumbersContext';
import BrowserCallComponent from './BrowserCallComponent';
import SMSComponent from '../SMS/SMSComponent';
import { 
  Phone, 
  PhoneCall, 
  History, 
  Mic, 
  Plus, 
  Trash2, 
  Download,
  Play,
  Search,
  RefreshCw,
  MessageSquare
} from 'lucide-react';

const TwilioCallingService: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'calling' | 'numbers' | 'buy' | 'sms' | 'history' | 'recordings'>('buy');
  const [searchAreaCode, setSearchAreaCode] = useState('');
  const [isSearchingNumbers, setIsSearchingNumbers] = useState(false);
  const [availableNumbers, setAvailableNumbers] = useState<any[]>([]);
  
  const userPhoneNumbers = useUserPhoneNumbers();

  // Load data on component mount
  useEffect(() => {
    if (userPhoneNumbers.phoneNumbers.length === 0) {
      userPhoneNumbers.getMyNumbers();
    }
    userPhoneNumbers.getCallHistory();
    userPhoneNumbers.getRecordings();
  }, []);

  const handleSearchNumbers = async () => {
    if (!searchAreaCode.trim()) {
      alert('Please enter an area code');
      return;
    }

    setIsSearchingNumbers(true);
    try {
      const response = await userPhoneNumbers.searchAvailableNumbers({
        areaCode: searchAreaCode,
        country: 'US',
        limit: 10
      });
      
      if (response.success && response.availableNumbers) {
        setAvailableNumbers(response.availableNumbers);
      } else {
        setAvailableNumbers([]);
        alert('No numbers found for this area code');
      }
    } catch (error) {
      console.error('Error searching numbers:', error);
      alert('Failed to search for numbers');
    } finally {
      setIsSearchingNumbers(false);
    }
  };

  const handleBuyNumber = async (phoneNumber: string) => {
    try {
      await userPhoneNumbers.buyPhoneNumber({
        phoneNumber,
        country: 'US',
        areaCode: searchAreaCode
      });
      alert('Phone number purchased successfully!');
      setAvailableNumbers([]);
      setSearchAreaCode('');
      userPhoneNumbers.getMyNumbers(); // Refresh the list
    } catch (error) {
      console.error('Error buying number:', error);
      alert('Failed to purchase phone number');
    }
  };

  const handleReleaseNumber = async (id: string) => {
    if (confirm('Are you sure you want to release this phone number?')) {
      try {
        await userPhoneNumbers.releasePhoneNumber(id);
        alert('Phone number released successfully!');
      } catch (error) {
        console.error('Error releasing number:', error);
        alert('Failed to release phone number');
      }
    }
  };

  const handleDeleteRecording = async (recordingSid: string) => {
    if (confirm('Are you sure you want to delete this recording?')) {
      try {
        await userPhoneNumbers.deleteRecording(recordingSid);
        alert('Recording deleted successfully!');
      } catch (error) {
        console.error('Error deleting recording:', error);
        alert('Failed to delete recording');
      }
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'no-answer': return 'bg-yellow-100 text-yellow-800';
      case 'busy': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div className="text-center sm:text-left">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">📞 Calling Service</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage phone numbers and make calls</p>
        </div>
        <div className="flex justify-center sm:justify-end">
          <button
            onClick={() => userPhoneNumbers.getMyNumbers()}
            className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex flex-wrap -mb-px">
            {[
              { id: 'calling', label: 'Make Calls', icon: PhoneCall },
              { id: 'numbers', label: 'My Numbers', icon: Phone },
              { id: 'buy', label: 'Buy Numbers', icon: Plus },
              { id: 'sms', label: 'SMS', icon: MessageSquare },
              { id: 'history', label: 'Call History', icon: History },
              { id: 'recordings', label: 'Recordings', icon: Mic }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-3 sm:p-6">
          {/* Calling Tab */}
          {activeTab === 'calling' && (
            <BrowserCallComponent />
          )}

          {/* Buy Numbers Tab */}
          {activeTab === 'buy' && (
            <div className="space-y-4">
              <div className="text-center sm:text-left">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Buy New Phone Number</h2>
                <p className="text-sm text-gray-600">Search for and purchase a new phone number for your business.</p>
              </div>

              {/* Search Section */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
                <h3 className="text-sm sm:text-base font-medium text-blue-900 mb-3">Search for Available Numbers</h3>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <input
                    type="text"
                    placeholder="Enter area code (e.g., 415, 910, 212)"
                    value={searchAreaCode}
                    onChange={(e) => setSearchAreaCode(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <button
                    onClick={handleSearchNumbers}
                    disabled={isSearchingNumbers || !searchAreaCode.trim()}
                    className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    <Search className="w-4 h-4" />
                    <span>{isSearchingNumbers ? 'Searching...' : 'Search Numbers'}</span>
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-blue-700 mt-2">
                  Enter a 3-digit area code to find available phone numbers in that area. Numbers typically cost $1.00/month.
                </p>
              </div>

              {/* Available Numbers */}
              {availableNumbers.length > 0 && (
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Available Numbers</h3>
                  <div className="space-y-3">
                    {availableNumbers.map((number, index) => (
                      <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex-1 mb-2 sm:mb-0">
                          <div className="font-medium text-gray-900 text-lg">{number.phoneNumber}</div>
                          <div className="text-sm text-gray-600">
                            Monthly Cost: ${number.monthlyCost || '1.00'} • Area Code: {searchAreaCode}
                          </div>
                        </div>
                        <button
                          onClick={() => handleBuyNumber(number.phoneNumber)}
                          className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm sm:text-base"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Buy This Number</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {availableNumbers.length === 0 && searchAreaCode && !isSearchingNumbers && (
                <div className="text-center py-8 bg-gray-50 border border-gray-200 rounded-lg">
                  <Phone className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No numbers found</h3>
                  <p className="text-gray-600">Try a different area code or check back later for new numbers.</p>
                </div>
              )}
            </div>
          )}

          {/* SMS Tab */}
          {activeTab === 'sms' && (
            <SMSComponent />
          )}

          {/* Phone Numbers Tab */}
          {activeTab === 'numbers' && (
            <div className="space-y-4">
              <div className="text-center sm:text-left">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">My Phone Numbers</h2>
                <p className="text-sm text-gray-600 mt-1">Manage your purchased phone numbers</p>
              </div>

              {/* My Numbers */}
              <div className="space-y-3">
                {userPhoneNumbers.loading ? (
                  <div className="text-center py-4">Loading phone numbers...</div>
                ) : userPhoneNumbers.phoneNumbers.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 border border-gray-200 rounded-lg">
                    <Phone className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No phone numbers yet</h3>
                    <p className="text-gray-600 mb-4">Go to the "Buy Numbers" tab to search for and purchase your first phone number.</p>
                    <button
                      onClick={() => setActiveTab('buy')}
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Go to Buy Numbers</span>
                    </button>
                  </div>
                ) : (
                  userPhoneNumbers.phoneNumbers.map((number) => (
                    <div key={number.id} className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3">
                            <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{number.phone_number}</h3>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${number.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                              {number.status}
                            </span>
                          </div>
                          <div className="text-xs sm:text-sm text-gray-600 mt-1">
                            <p>Country: {number.country} • Monthly Cost: ${number.monthlyFee || '1.00'}</p>
                            {number.region && <p>Region: {number.region}</p>}
                          </div>
                        </div>
                        <button
                          onClick={() => handleReleaseNumber(number.id.toString())}
                          className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white text-xs sm:text-sm rounded hover:bg-red-700 transition-colors"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>Release</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Available Numbers */}
              {availableNumbers.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Available Numbers</h3>
                  <div className="space-y-2">
                    {availableNumbers.map((number, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div>
                          <span className="font-medium text-gray-900">{number.phoneNumber}</span>
                          <span className="ml-2 text-sm text-gray-600">${number.monthlyCost || '1.00'}/month</span>
                        </div>
                        <button
                          onClick={() => handleBuyNumber(number.phoneNumber)}
                          className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white text-xs sm:text-sm rounded hover:bg-green-700 transition-colors"
                        >
                          <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>Buy</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Call History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 text-center sm:text-left">Call History</h2>
                <div className="flex space-x-2">
                  <select className="px-3 py-1 border border-gray-300 rounded text-xs sm:text-sm">
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                    <option value="no-answer">No Answer</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                {userPhoneNumbers.loading ? (
                  <div className="text-center py-4">Loading call history...</div>
                ) : userPhoneNumbers.calls.length === 0 ? (
                  <div className="text-center py-8">
                    <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No call history</h3>
                    <p className="text-gray-500">Make your first call to see history here.</p>
                  </div>
                ) : (
                  userPhoneNumbers.calls.map((call) => (
                    <div key={call.id} className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3">
                            <div className="text-sm sm:text-base">
                              <span className="font-medium text-gray-900">{call.from}</span>
                              <span className="mx-2 text-gray-400">→</span>
                              <span className="font-medium text-gray-900">{call.to}</span>
                            </div>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(call.status)}`}>
                              {call.status}
                            </span>
                          </div>
                          <div className="text-xs sm:text-sm text-gray-600 mt-1">
                            <p>Duration: {formatDuration(call.duration)} • {call.direction} • {call.createdAt ? new Date(call.createdAt).toLocaleDateString() : 'Unknown date'}</p>
                            {call.price && <p>Cost: ${call.price}</p>}
                          </div>
                        </div>
                        {call.recordingUrl && (
                          <button
                            onClick={() => window.open(call.recordingUrl, '_blank')}
                            className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white text-xs sm:text-sm rounded hover:bg-blue-700 transition-colors"
                          >
                            <Play className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>Play</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Recordings Tab */}
          {activeTab === 'recordings' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 text-center sm:text-left">Call Recordings</h2>
                <div className="flex space-x-2">
                  <select className="px-3 py-1 border border-gray-300 rounded text-xs sm:text-sm">
                    <option value="all">All Recordings</option>
                    <option value="completed">Completed</option>
                    <option value="processing">Processing</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                {userPhoneNumbers.loading ? (
                  <div className="text-center py-4">Loading recordings...</div>
                ) : userPhoneNumbers.recordings.length === 0 ? (
                  <div className="text-center py-8">
                    <Mic className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No recordings</h3>
                    <p className="text-gray-500">Call recordings will appear here after calls are made.</p>
                  </div>
                ) : (
                  userPhoneNumbers.recordings.map((recording) => (
                    <div key={recording.id} className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3">
                            <div className="text-sm sm:text-base">
                              <span className="font-medium text-gray-900">{recording.fromNumber}</span>
                              <span className="mx-2 text-gray-400">→</span>
                              <span className="font-medium text-gray-900">{recording.toNumber}</span>
                            </div>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${recording.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                              {recording.status}
                            </span>
                          </div>
                          <div className="text-xs sm:text-sm text-gray-600 mt-1">
                            <p>Duration: {formatDuration(recording.duration)} • {recording.createdAt ? new Date(recording.createdAt).toLocaleDateString() : 'Unknown date'}</p>
                            {recording.price && <p>Cost: ${recording.price}</p>}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => window.open(recording.mediaUrl, '_blank')}
                            className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white text-xs sm:text-sm rounded hover:bg-blue-700 transition-colors"
                          >
                            <Play className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>Play</span>
                          </button>
                          <button
                            onClick={() => window.open(recording.mediaUrl, '_blank')}
                            className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white text-xs sm:text-sm rounded hover:bg-green-700 transition-colors"
                          >
                            <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>Download</span>
                          </button>
                          <button
                            onClick={() => handleDeleteRecording(recording.recordingSid)}
                            className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white text-xs sm:text-sm rounded hover:bg-red-700 transition-colors"
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TwilioCallingService;
