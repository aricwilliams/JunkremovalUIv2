import React, { useState } from 'react';
import axios from 'axios';
import Logo from '../Common/Logo';
import { useAuth } from '../../contexts/AuthContext';
import PasswordResetForm from './PasswordResetForm';

interface LoginFormData {
  username: string;
  password: string;
}

interface SignupFormData {
  // Business Information
  businessName: string;
  businessPhone: string;
  businessAddress: string;
  businessCity: string;
  businessState: string;
  businessZipCode: string;
  
  // Owner Information
  ownerFirstName: string;
  ownerLastName: string;
  ownerEmail: string;
  ownerPhone: string;
  
  // Account Credentials
  username: string;
  password: string;
  confirmPassword: string;
  
}


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1/auth';

const AuthPage: React.FC<{ onLoginSuccess: (user: any) => void }> = ({ onLoginSuccess }) => {
  const { login, refreshAuth } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'signup' | 'reset'>('login');
  const [loginData, setLoginData] = useState<LoginFormData>({
    username: '',
    password: ''
  });
  const [signupData, setSignupData] = useState<SignupFormData>({
    // Business Information
    businessName: '',
    businessPhone: '',
    businessAddress: '',
    businessCity: '',
    businessState: '',
    businessZipCode: '',
    
    // Owner Information
    ownerFirstName: '',
    ownerLastName: '',
    ownerEmail: '',
    ownerPhone: '',
    
    // Account Credentials
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await login(loginData.username, loginData.password);
      
      if (result.success) {
        // Refresh auth state to ensure immediate update
        refreshAuth();
        onLoginSuccess({}); // AuthContext handles the state update
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (error: any) {
      setError('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate passwords match
    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password strength according to API requirements
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,128}$/;
    if (!passwordRegex.test(signupData.password)) {
      setError('Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character (!@#$%^&*)');
      setLoading(false);
      return;
    }


    try {
      const signupPayload = {
        // Business Information
        business_name: signupData.businessName,
        business_phone: signupData.businessPhone,
        business_address: signupData.businessAddress,
        business_city: signupData.businessCity,
        business_state: signupData.businessState,
        business_zip_code: signupData.businessZipCode,
        
        // Owner Information
        owner_first_name: signupData.ownerFirstName,
        owner_last_name: signupData.ownerLastName,
        owner_email: signupData.ownerEmail,
        owner_phone: signupData.ownerPhone,
        
        // Account Credentials
        username: signupData.username,
        password: signupData.password,
        confirm_password: signupData.confirmPassword,
        
        // User type for business registration
        user_type: 'business_owner'
      };

      const response = await axios.post(`${API_BASE_URL}/api/v1/auth/signup`, signupPayload);

      if (response.data.success) {
        setSuccess('Account created successfully! You can now log in.');
        // Clear form
        setSignupData({
          // Business Information
          businessName: '',
          businessPhone: '',
          businessAddress: '',
          businessCity: '',
          businessState: '',
          businessZipCode: '',
          
          // Owner Information
          ownerFirstName: '',
          ownerLastName: '',
          ownerEmail: '',
          ownerPhone: '',
          
          // Account Credentials
          username: '',
          password: '',
          confirmPassword: ''
        });
        // Switch to login tab
        setTimeout(() => {
          setActiveTab('login');
          setSuccess('');
        }, 2000);
      } else {
        setError(response.data.message || 'Signup failed');
      }
    } catch (error: any) {
      if (error.response?.data?.details) {
        // Handle field-specific validation errors
        const fieldErrors = error.response.data.details.map((detail: any) => detail.message).join(', ');
        setError(fieldErrors);
      } else {
        setError(error.response?.data?.message || 'Signup failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Show password reset form if active tab is reset
  if (activeTab === 'reset') {
    return (
      <PasswordResetForm 
        onBackToLogin={() => setActiveTab('login')}
        onSuccess={() => setActiveTab('login')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Branding */}
        <div className="text-center">
          <Logo size="lg" className="mb-6" />
        </div>

        {/* Auth Container */}
        <div className="bg-gray-50 rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === 'login'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border-r border-gray-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === 'signup'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Business Sign Up
            </button>
          </div>

          {/* Form Content */}
          <div className="p-8 bg-white">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">{success}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Login Form */}
            {activeTab === 'login' && (
              <div>
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-semibold text-gray-900">
                    Welcome Back
                  </h3>
                  <p className="text-gray-600 mt-2">
                    Sign in to your account
                  </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                  <div>
                    <label htmlFor="login-username" className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <input
                      id="login-username"
                      name="username"
                      type="text"
                      required
                      value={loginData.username}
                      onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                      className="w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                      placeholder="Enter your username"
                    />
                  </div>

                  <div>
                    <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <input
                      id="login-password"
                      name="password"
                      type="password"
                      required
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      className="w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                      placeholder="Enter your password"
                    />
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {loading ? (
                        <div className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Signing in...
                        </div>
                      ) : (
                        'Sign In'
                      )}
                    </button>
                  </div>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setActiveTab('reset')}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                      Forgot your password?
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Signup Form */}
            {activeTab === 'signup' && (
              <div>
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-semibold text-gray-900">
                    Register Your Business
                  </h3>
                  <p className="text-gray-600 mt-2">
                    Join Junk Removal Pro today
                  </p>
                </div>

                <form onSubmit={handleSignup} className="space-y-4">
                  {/* Business Information Section */}
                  <div className="border-b border-gray-200 pb-4">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Business Information</h4>
                    
                    <div>
                      <label htmlFor="business-name" className="block text-sm font-medium text-gray-700 mb-2">
                        Business Name *
                      </label>
                      <input
                        id="business-name"
                        name="businessName"
                        type="text"
                        required
                        value={signupData.businessName}
                        onChange={(e) => setSignupData({ ...signupData, businessName: e.target.value })}
                        className="w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                        placeholder="Your business name"
                      />
                    </div>

                    <div>
                      <label htmlFor="business-phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Business Phone *
                      </label>
                      <input
                        id="business-phone"
                        name="businessPhone"
                        type="tel"
                        required
                        value={signupData.businessPhone}
                        onChange={(e) => setSignupData({ ...signupData, businessPhone: e.target.value })}
                        className="w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                        placeholder="Business phone number"
                      />
                    </div>

                    <div>
                      <label htmlFor="business-address" className="block text-sm font-medium text-gray-700 mb-2">
                        Business Address *
                      </label>
                      <input
                        id="business-address"
                        name="businessAddress"
                        type="text"
                        required
                        value={signupData.businessAddress}
                        onChange={(e) => setSignupData({ ...signupData, businessAddress: e.target.value })}
                        className="w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                        placeholder="Street address"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label htmlFor="business-city" className="block text-sm font-medium text-gray-700 mb-2">
                          City *
                        </label>
                        <input
                          id="business-city"
                          name="businessCity"
                          type="text"
                          required
                          value={signupData.businessCity}
                          onChange={(e) => setSignupData({ ...signupData, businessCity: e.target.value })}
                          className="w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                          placeholder="City"
                        />
                      </div>
                      <div>
                        <label htmlFor="business-state" className="block text-sm font-medium text-gray-700 mb-2">
                          State *
                        </label>
                        <input
                          id="business-state"
                          name="businessState"
                          type="text"
                          required
                          maxLength={2}
                          value={signupData.businessState}
                          onChange={(e) => setSignupData({ ...signupData, businessState: e.target.value.toUpperCase() })}
                          className="w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                          placeholder="ST"
                        />
                      </div>
                      <div>
                        <label htmlFor="business-zip" className="block text-sm font-medium text-gray-700 mb-2">
                          ZIP Code *
                        </label>
                        <input
                          id="business-zip"
                          name="businessZipCode"
                          type="text"
                          required
                          value={signupData.businessZipCode}
                          onChange={(e) => setSignupData({ ...signupData, businessZipCode: e.target.value })}
                          className="w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                          placeholder="12345"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Owner Information Section */}
                  <div className="border-b border-gray-200 pb-4">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Owner Information</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="owner-firstname" className="block text-sm font-medium text-gray-700 mb-2">
                          First Name *
                        </label>
                        <input
                          id="owner-firstname"
                          name="ownerFirstName"
                          type="text"
                          required
                          value={signupData.ownerFirstName}
                          onChange={(e) => setSignupData({ ...signupData, ownerFirstName: e.target.value })}
                          className="w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                          placeholder="First name"
                        />
                      </div>
                      <div>
                        <label htmlFor="owner-lastname" className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name *
                        </label>
                        <input
                          id="owner-lastname"
                          name="ownerLastName"
                          type="text"
                          required
                          value={signupData.ownerLastName}
                          onChange={(e) => setSignupData({ ...signupData, ownerLastName: e.target.value })}
                        className="w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                        placeholder="Last name"
                      />
                    </div>
                  </div>

                    <div>
                      <label htmlFor="owner-email" className="block text-sm font-medium text-gray-700 mb-2">
                        Owner Email *
                      </label>
                      <input
                        id="owner-email"
                        name="ownerEmail"
                        type="email"
                        required
                        value={signupData.ownerEmail}
                        onChange={(e) => setSignupData({ ...signupData, ownerEmail: e.target.value })}
                        className="w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                        placeholder="Owner email address"
                      />
                    </div>

                    <div>
                      <label htmlFor="owner-phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Owner Phone *
                      </label>
                      <input
                        id="owner-phone"
                        name="ownerPhone"
                        type="tel"
                        required
                        value={signupData.ownerPhone}
                        onChange={(e) => setSignupData({ ...signupData, ownerPhone: e.target.value })}
                        className="w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                        placeholder="Owner phone number"
                      />
                    </div>
                  </div>

                  {/* Account Credentials Section */}
                  <div className="border-b border-gray-200 pb-4">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Account Credentials</h4>

                  <div>
                    <label htmlFor="signup-username" className="block text-sm font-medium text-gray-700 mb-2">
                        Username *
                    </label>
                    <input
                      id="signup-username"
                      name="username"
                      type="text"
                      required
                      value={signupData.username}
                      onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
                      className="w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                      placeholder="Choose a username"
                    />
                  </div>

                  <div>
                    <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-2">
                        Password *
                    </label>
                    <input
                      id="signup-password"
                      name="password"
                      type="password"
                      required
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      className="w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                      placeholder="Create a password"
                    />
                  </div>

                  <div>
                    <label htmlFor="signup-confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm Password *
                    </label>
                    <input
                      id="signup-confirm-password"
                      name="confirmPassword"
                      type="password"
                      required
                      value={signupData.confirmPassword}
                      onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                      className="w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                      placeholder="Confirm your password"
                    />
                  </div>
                  </div>


                  <div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {loading ? (
                        <div className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creating account...
                        </div>
                      ) : (
                        'Create Business Account'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>&copy; 2024 Junk Removal Pro. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
