import { useState, useEffect } from 'react';
import { smsService, SMSMessage, SMSStats, SendSMSResponse, SendBulkSMSResponse } from '../../services/smsService';
import { MessageSquare, Send, Users, BarChart3, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const SMSComponent = () => {
  const [to, setTo] = useState('');
  const [body, setBody] = useState('');
  const [from, setFrom] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SendSMSResponse | SendBulkSMSResponse | null>(null);
  const [error, setError] = useState('');
  const [smsLogs, setSmsLogs] = useState<SMSMessage[]>([]);
  const [stats, setStats] = useState<SMSStats | null>(null);
  const [activeTab, setActiveTab] = useState<'send' | 'logs' | 'stats'>('send');

  // Load SMS logs and stats on component mount
  useEffect(() => {
    loadSMSData();
  }, []);

  const loadSMSData = async () => {
    try {
      const [logsResponse, statsResponse] = await Promise.all([
        smsService.getSMSLogs({ limit: 20 }),
        smsService.getSMSStats()
      ]);
      
      setSmsLogs(logsResponse.data.smsLogs);
      setStats(statsResponse.data);
    } catch (error) {
      console.error('Error loading SMS data:', error);
    }
  };

  const sendSMS = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await smsService.sendSMS(to, body, from || undefined);
      setResult(response);
      setTo('');
      setBody('');
      setFrom('');
      
      // Reload SMS data to show new message
      await loadSMSData();
    } catch (error: any) {
      setError(error.message || 'Failed to send SMS');
    } finally {
      setLoading(false);
    }
  };

  const sendBulkSMS = async () => {
    if (!to.includes(',')) {
      setError('For bulk SMS, enter multiple numbers separated by commas');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const recipients = to.split(',').map(num => num.trim());
      const response = await smsService.sendBulkSMS(recipients, body, from || undefined);
      setResult(response);
      setTo('');
      setBody('');
      setFrom('');
      
      // Reload SMS data
      await loadSMSData();
    } catch (error: any) {
      setError(error.message || 'Failed to send bulk SMS');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
      case 'undelivered':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'sent':
        return <Send className="w-4 h-4 text-blue-500" />;
      case 'queued':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'text-green-600 bg-green-100';
      case 'failed':
      case 'undelivered':
        return 'text-red-600 bg-red-100';
      case 'sent':
        return 'text-blue-600 bg-blue-100';
      case 'queued':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="p-3 sm:p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center sm:text-left">📱 SMS Management</h2>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'send', label: 'Send SMS', icon: MessageSquare },
            { id: 'logs', label: 'Message Logs', icon: Clock },
            { id: 'stats', label: 'Statistics', icon: BarChart3 }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* SMS Statistics Tab */}
      {activeTab === 'stats' && (
        <div className="space-y-4">
          {stats ? (
            <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                SMS Statistics
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                    {stats.total_messages}
                  </div>
                  <div className="text-sm text-gray-600">Total Messages</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-2xl sm:text-3xl font-bold text-green-600">
                    {stats.delivered_count}
                  </div>
                  <div className="text-sm text-gray-600">Delivered</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-2xl sm:text-3xl font-bold text-red-600">
                    {stats.failed_count}
                  </div>
                  <div className="text-sm text-gray-600">Failed</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-2xl sm:text-3xl font-bold text-yellow-600">
                    ${stats.total_cost}
                  </div>
                  <div className="text-sm text-gray-600">Total Cost</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Loading statistics...
            </div>
          )}
        </div>
      )}

      {/* Send SMS Tab */}
      {activeTab === 'send' && (
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Send SMS
            </h3>
            
            <form onSubmit={sendSMS} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To (Phone Number):
                </label>
                <input
                  type="tel"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="+15551234567 or +15551234567,+15559876543 for bulk"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From (Optional):
                </label>
                <input
                  type="tel"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  placeholder="+15559876543 (uses default if empty)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message:
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Enter your message here..."
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-vertical"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {body.length}/1600 characters
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={loading || !to || !body}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm sm:text-base"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? 'Sending...' : '📱 Send SMS'}</span>
                </button>

                <button
                  type="button"
                  onClick={sendBulkSMS}
                  disabled={loading || !to || !body}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm sm:text-base"
                >
                  <Users className="w-4 h-4" />
                  <span>{loading ? 'Sending...' : '📤 Send Bulk SMS'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
              ❌ {error}
            </div>
          )}

          {/* Result Display */}
          {result && (
            <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded text-sm">
              ✅ {result.message}
              <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-auto">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* SMS Logs Tab */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Recent SMS Messages
            </h3>
            <button
              onClick={loadSMSData}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              Refresh
            </button>
          </div>

          {smsLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No SMS messages yet.
            </div>
          ) : (
            <div className="space-y-3">
              {smsLogs.map((log) => (
                <div key={log.id} className={`border rounded-lg p-4 ${
                  log.direction === 'outbound' ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-2 sm:space-y-0">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {getStatusIcon(log.status)}
                        <span className="font-medium text-sm">
                          {log.direction === 'outbound' ? '📤 To:' : '📥 From:'} {log.to_number}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                          {log.status}
                        </span>
                      </div>
                      <div className="text-gray-700 text-sm mb-2">
                        {log.body}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {new Date(log.date_sent).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      {log.price && (
                        <div className="text-sm font-medium text-gray-600">
                          ${log.price}
                        </div>
                      )}
                      {log.error_message && (
                        <div className="text-xs text-red-600 mt-1">
                          {log.error_message}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SMSComponent;
