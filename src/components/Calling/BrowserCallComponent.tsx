import { useState, useEffect, useRef } from 'react';
import { useUserPhoneNumbers } from '../../contexts/UserPhoneNumbersContext';
import { Phone, Mic, MicOff, PhoneOff, Pause, Play } from 'lucide-react';

// Real Twilio Device implementation
import { Device } from '@twilio/voice-sdk';

const BrowserCallComponent = () => {
  console.log('🔧 BrowserCallComponent: Component loaded with enhanced features');
  
  // Core call state
  const [device, setDevice] = useState<any>(null);
  const [connection, setConnection] = useState<any>(null);
  const [callStatus, setCallStatus] = useState('idle'); // idle, ready, calling, connected, ended
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [error, setError] = useState('');
  
  // Call details
  const [toNumber, setToNumber] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  
  // Available numbers and settings
  const [selectedFromNumber, setSelectedFromNumber] = useState<string>('');
  
  // UI state
  const [showKeypad, setShowKeypad] = useState(false);
  const [dtmfTones, setDtmfTones] = useState('');
  
  // Refs for timers
  const durationTimer = useRef<NodeJS.Timeout | null>(null);
  const callStartTimeRef = useRef<Date | null>(null);
  
  const userPhoneNumbers = useUserPhoneNumbers();

  // Set default selected number when phone numbers load
  useEffect(() => {
    if (userPhoneNumbers.phoneNumbers.length > 0 && !selectedFromNumber) {
      const firstNumber = userPhoneNumbers.phoneNumbers[0];
      setSelectedFromNumber(firstNumber.phone_number || '');
    }
  }, [userPhoneNumbers.phoneNumbers, selectedFromNumber]);

  // Call timer functions
  const startCallTimer = () => {
    durationTimer.current = setInterval(() => {
      if (callStartTimeRef.current) {
        const now = new Date();
        const duration = Math.floor((now.getTime() - callStartTimeRef.current.getTime()) / 1000);
        setCallDuration(duration);
      }
    }, 1000);
  };

  const stopCallTimer = () => {
    if (durationTimer.current) {
      clearInterval(durationTimer.current);
      durationTimer.current = null;
    }
  };

  // Format call duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Format phone number for Twilio API
  const formatPhoneNumber = (phoneNumber: string) => {
    // Remove all non-digit characters
    const digits = phoneNumber.replace(/\D/g, '');
    
    // If it's 10 digits, assume US number and add +1
    if (digits.length === 10) {
      return `+1${digits}`;
    }
    
    // If it's 11 digits and starts with 1, add +
    if (digits.length === 11 && digits.startsWith('1')) {
      return `+${digits}`;
    }
    
    // If it already has +, return as is
    if (phoneNumber.startsWith('+')) {
      return phoneNumber.replace(/\D/g, '').replace(/^/, '+');
    }
    
    // Default: add +1 for US numbers
    return `+1${digits}`;
  };

  // Initialize Twilio Device
  useEffect(() => {
    const initDevice = async () => {
      try {
        console.log('🎫 Initializing calling device...');
        
        // Check authentication
        const authToken = localStorage.getItem('authToken');
        console.log('🔑 Auth token exists:', !!authToken);
        console.log('🔑 Auth token value:', authToken ? `${authToken.substring(0, 20)}...` : 'No token');
        
        if (!authToken) {
          throw new Error('No authentication token found. Please log in first.');
        }
        
         // Get access token from API directly (matching your working example)
         const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api/v1/auth', '') || 'http://localhost:3000';
         console.log('🌐 API Base URL:', API_BASE_URL);
         
         const twilioResponse = await fetch(`${API_BASE_URL}/api/twilio/access-token`, {
           method: 'GET',
           headers: {
             'Authorization': `Bearer ${authToken}`
           }
         });

         if (!twilioResponse.ok) {
           const errorText = await twilioResponse.text();
           console.error('❌ Twilio access token API error:', twilioResponse.status, errorText);
           throw new Error(`Failed to get Twilio access token: ${twilioResponse.status} - ${errorText}`);
         }

         const twilioData = await twilioResponse.json();
         console.log('✅ Twilio access token response:', twilioData);
         
         // Extract token from response (adjust based on actual response structure)
         const token = twilioData.token || twilioData.accessToken || twilioData;
         
         if (!token) {
           throw new Error('No token found in Twilio response');
         }
        
        // Initialize real Twilio Device
        const dev = new Device(token);

        dev.on('ready', () => {
          console.log('✅ Device ready');
          setCallStatus('ready');
          setError('');
        });

        dev.on('connect', (conn: any) => {
          console.log('✅ Call connected');
          setConnection(conn);
          setCallStatus('connected');
          callStartTimeRef.current = new Date();
          startCallTimer();
          setError('');
          
          // Connection event handlers
          conn.on('disconnect', () => {
            endCall();
          });
          
          conn.on('mute', (muted: boolean) => {
            setIsMuted(muted);
          });
        });

        dev.on('disconnect', () => {
          endCall();
        });

        dev.on('error', (error: any) => {
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

    return () => {
      if (device) {
        device.destroy();
      }
      if (durationTimer.current) {
        clearInterval(durationTimer.current);
      }
    };
  }, []);

  const makeCall = async () => {
    if (!device || callStatus === 'calling' || callStatus === 'connected') return;
    if (!toNumber.trim()) {
      setError('Please enter a phone number');
      return;
    }

    try {
      setCallStatus('calling');
      setError('');
      
      // Format phone numbers for Twilio API
      const formattedToNumber = formatPhoneNumber(toNumber);
      const formattedFromNumber = formatPhoneNumber(selectedFromNumber);
      
      console.log('📞 Making call to:', toNumber, '→', formattedToNumber);
      console.log('📞 Call parameters:', {
        To: formattedToNumber,
        From: formattedFromNumber
      });
      
      // Make real Twilio call
      const conn = await device.connect({ 
        To: formattedToNumber,
        From: formattedFromNumber
      });
      setConnection(conn);
      
    } catch (error: any) {
      handleCallError(error);
    }
  };

  // End call
  const endCall = () => {
    if (connection) {
      connection.disconnect();
    }
    setConnection(null);
    setCallStatus('idle');
    setCallDuration(0);
    callStartTimeRef.current = null;
    stopCallTimer();
    setIsMuted(false);
    setIsOnHold(false);
    setDtmfTones('');
  };

  // Toggle mute
  const toggleMute = () => {
    if (connection) {
      const muted = !connection.isMuted();
      connection.mute(muted);
      setIsMuted(muted);
    }
  };

  // Toggle hold
  const toggleHold = () => {
    if (connection) {
      const onHold = !connection.isOnHold();
      connection.hold(onHold);
      setIsOnHold(onHold);
    }
  };

  // Send DTMF tones
  const sendDTMF = (digit: string) => {
    if (connection) {
      connection.sendDigits(digit);
      setDtmfTones(prev => prev + digit);
    }
  };

  // Handle call errors
  const handleCallError = (error: any) => {
    if (error.code === 31005 || error.message?.includes('HANGUP')) {
      endCall();
    } else {
      setError(`Call error: ${error.message || 'Unknown error'}`);
      setCallStatus('error');
    }
  };

  // Keypad component
  const Keypad = () => (
    <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
      {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map(digit => (
        <button
          key={digit}
          onClick={() => sendDTMF(digit)}
          disabled={callStatus !== 'connected'}
          className="p-3 text-lg border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
        >
          {digit}
        </button>
      ))}
    </div>
  );

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
          <p><strong>Connected:</strong> {callStatus === 'connected' ? '✅ Yes' : '❌ No'}</p>
          <p><strong>Muted:</strong> {isMuted ? '✅ Yes' : '❌ No'}</p>
          <p><strong>On Hold:</strong> {isOnHold ? '✅ Yes' : '❌ No'}</p>
          <p><strong>Available Numbers:</strong> {userPhoneNumbers.phoneNumbers.length}</p>
          {selectedFromNumber && (
            <p><strong>Selected Number:</strong> {selectedFromNumber}</p>
          )}
          {callStatus === 'connected' && (
            <p><strong>Duration:</strong> {formatDuration(callDuration)}</p>
          )}
        </div>
      </div>

      {callStatus !== 'connected' ? (
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
              disabled={callStatus === 'calling'}
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
              placeholder="(910) 755-5577 or +19107555577"
              disabled={callStatus === 'calling'}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          
          <button
            onClick={makeCall}
            disabled={!device || callStatus === 'calling' || !toNumber.trim() || !selectedFromNumber}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm sm:text-base"
          >
            <Phone className="w-4 h-4" />
            <span>{callStatus === 'calling' ? 'Connecting...' : 'Start Call'}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Active Call Interface */}
          <div className="p-4 sm:p-6 bg-green-50 border border-green-200 rounded-lg text-center">
            <h3 className="text-lg sm:text-xl font-medium text-green-800 mb-2">📞 Connected</h3>
            
            <div className="text-base sm:text-lg mb-2 text-gray-900">
              {toNumber}
            </div>
            <div className="text-xs text-gray-500 mb-2">
              Formatted: {formatPhoneNumber(toNumber)}
            </div>
            
            <div className="text-sm text-gray-600 mb-4">
              Duration: {formatDuration(callDuration)}
            </div>

            {/* DTMF Tones Display */}
            {dtmfTones && (
              <div className="text-sm text-gray-600 mb-4 font-mono">
                Sent: {dtmfTones}
              </div>
            )}

            {/* Keypad Toggle */}
            <button
              onClick={() => setShowKeypad(!showKeypad)}
              className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              {showKeypad ? 'Hide' : 'Show'} Keypad
            </button>

            {/* Keypad */}
            {showKeypad && <Keypad />}

            {/* Call Controls */}
            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={toggleMute}
                className={`w-12 h-12 rounded-full text-white flex items-center justify-center transition-colors ${
                  isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button
                onClick={toggleHold}
                className={`w-12 h-12 rounded-full text-white flex items-center justify-center transition-colors ${
                  isOnHold ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isOnHold ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
              </button>

              <button
                onClick={endCall}
                className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-colors"
              >
                <PhoneOff className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowserCallComponent;
