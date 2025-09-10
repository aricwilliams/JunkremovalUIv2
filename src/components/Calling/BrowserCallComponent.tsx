import React, { useState, useEffect } from 'react';
import { useUserPhoneNumbers } from '../../contexts/UserPhoneNumbersContext';
import { Phone, Mic, MicOff, PhoneOff } from 'lucide-react';

// Mock Device class for now (will be replaced with actual Twilio Device when dependencies are installed)
class MockDevice {
  on(event: string, callback: Function) {
    console.log(`MockDevice: ${event} event registered`);
  }
  async connect(params: any) {
    console.log('MockDevice: connect called with', params);
    return new MockConnection();
  }
}

class MockConnection {
  disconnect() {
    console.log('MockDevice: connection disconnected');
  }
  mute(muted: boolean) {
    console.log(`MockDevice: ${muted ? 'muted' : 'unmuted'}`);
  }
  isMuted() {
    return false;
  }
}

const BrowserCallComponent = () => {
  const [device, setDevice] = useState<any>(null);
  const [connection, setConnection] = useState<any>(null);
  const [isCalling, setIsCalling] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState('');
  const [toNumber, setToNumber] = useState('');
  const [callStatus, setCallStatus] = useState('idle');
  const [selectedFromNumber, setSelectedFromNumber] = useState<string>('');
  
  const userPhoneNumbers = useUserPhoneNumbers();

  // Set default selected number when phone numbers load
  useEffect(() => {
    if (userPhoneNumbers.phoneNumbers.length > 0 && !selectedFromNumber) {
      const firstNumber = userPhoneNumbers.phoneNumbers[0];
      setSelectedFromNumber(firstNumber.phone_number || '');
    }
  }, [userPhoneNumbers.phoneNumbers, selectedFromNumber]);

  // Initialize Twilio Device (using mock for now)
  useEffect(() => {
    const initDevice = async () => {
      try {
        console.log('🎫 Initializing calling device...');
        
        // For now, use mock device until Twilio SDK is installed
        const dev = new MockDevice();

        dev.on('ready', () => {
          console.log('✅ Device ready');
          setCallStatus('ready');
          setError('');
        });

        dev.on('connect', (conn) => {
          console.log('✅ Call connected');
          setConnection(conn);
          setIsConnected(true);
          setIsCalling(false);
          setCallStatus('connected');
          setError('');
        });

        dev.on('disconnect', () => {
          console.log('📞 Call ended');
          setConnection(null);
          setIsConnected(false);
          setIsCalling(false);
          setCallStatus('idle');
          setError('');
        });

        dev.on('error', (error) => {
          console.log('❌ Device error:', error);
          setError(`Device error: ${error.message || 'Unknown error'}`);
          setCallStatus('error');
        });

        setDevice(dev);
        setCallStatus('ready');
      } catch (error) {
        console.error('❌ Failed to initialize:', error);
        setError(`Failed to initialize: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setCallStatus('error');
      }
    };
    
    initDevice();
  }, []);

  const makeCall = async () => {
    if (!device || isCalling || isConnected) return;
    if (!toNumber.trim()) {
      setError('Please enter a phone number to call');
      return;
    }

    try {
      setIsCalling(true);
      setCallStatus('calling');
      setError('');
      
      console.log('📞 Making call to:', toNumber);
      console.log('📞 Call parameters:', {
        To: toNumber,
        From: selectedFromNumber,
        Direction: 'outbound-api'
      });
      
      const conn = await device.connect({
        params: {
          To: toNumber,
          From: selectedFromNumber,
          Direction: 'outbound-api'
        }
      });
      
      setConnection(conn);
    } catch (error: any) {
      console.error('❌ Call failed:', error);
      setError(`Call failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setCallStatus('error');
      setIsCalling(false);
    }
  };

  const hangUp = () => {
    if (connection) {
      console.log('📞 Hanging up call');
      connection.disconnect();
    }
    setConnection(null);
    setIsConnected(false);
    setIsCalling(false);
    setCallStatus('idle');
    setError('');
  };

  const toggleMute = () => {
    if (connection) {
      const muted = !connection.isMuted();
      connection.mute(muted);
      setIsMuted(muted);
      console.log(`🎤 ${muted ? 'Muted' : 'Unmuted'}`);
    }
  };

  return (
    <div className="p-3 sm:p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center sm:text-left">📞 Browser Calling</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          ❌ {error}
        </div>
      )}
      
      <div className="mb-6 p-3 sm:p-4 bg-gray-50 rounded-md">
        <h3 className="font-medium mb-2 text-sm sm:text-base">Status</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs sm:text-sm">
          <p><strong>Status:</strong> {callStatus}</p>
          <p><strong>Device Ready:</strong> {device ? '✅ Yes' : '❌ No'}</p>
          <p><strong>Connected:</strong> {isConnected ? '✅ Yes' : '❌ No'}</p>
          <p><strong>Muted:</strong> {isMuted ? '✅ Yes' : '❌ No'}</p>
          <p><strong>Available Numbers:</strong> {userPhoneNumbers.phoneNumbers.length}</p>
          {selectedFromNumber && (
            <p><strong>Selected Number:</strong> {selectedFromNumber}</p>
          )}
        </div>
      </div>

      {!isConnected ? (
        <div className="space-y-4">
          {/* Call From Number Selection */}
          <div>
            <label htmlFor="fromNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Call From (Your Number):
            </label>
            <select
              id="fromNumber"
              value={selectedFromNumber}
              onChange={(e) => setSelectedFromNumber(e.target.value)}
              disabled={isCalling}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">Select a phone number</option>
              {userPhoneNumbers.phoneNumbers.map((number) => (
                <option key={number.id} value={number.phone_number}>
                  {number.phone_number}
                </option>
              ))}
            </select>
          </div>

          {/* Phone Number Input */}
          <div>
            <label htmlFor="toNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number to Call:
            </label>
            <input
              id="toNumber"
              type="tel"
              value={toNumber}
              onChange={(e) => setToNumber(e.target.value)}
              placeholder="+1 (555) 123-4567"
              disabled={isCalling}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          
          <button
            onClick={makeCall}
            disabled={!device || isCalling || !toNumber.trim() || !selectedFromNumber}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm sm:text-base"
          >
            <Phone className="w-4 h-4" />
            <span>{isCalling ? 'Connecting...' : 'Start Call'}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-md text-center">
            <h3 className="text-lg font-medium text-green-800 mb-2">📞 Connected to {toNumber}</h3>
            {selectedFromNumber && (
              <p className="text-sm text-green-700 mb-3">From: {selectedFromNumber}</p>
            )}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 justify-center">
              <button
                onClick={toggleMute}
                className="px-4 py-2 rounded-md text-white font-medium flex items-center justify-center space-x-2"
                style={{
                  backgroundColor: isMuted ? '#dc3545' : '#28a745'
                }}
              >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                <span>{isMuted ? 'Unmute' : 'Mute'}</span>
              </button>
              <button
                onClick={hangUp}
                className="px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 flex items-center justify-center space-x-2"
              >
                <PhoneOff className="w-4 h-4" />
                <span>Hang Up</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowserCallComponent;
