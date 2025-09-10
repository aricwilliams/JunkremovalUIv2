import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PhoneNumber, TwilioCall, TwilioRecording, UserPhoneNumbersContextType } from '../types';
import { twilioApi } from '../services/twilioApi';
import { useAuth } from './AuthContext';

const UserPhoneNumbersContext = createContext<UserPhoneNumbersContextType | undefined>(undefined);

export const UserPhoneNumbersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
    const [calls, setCalls] = useState<TwilioCall[]>([]);
    const [recordings, setRecordings] = useState<TwilioRecording[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Helper function to transform backend phone number data
    const transformPhoneNumber = (backendNumber: any): PhoneNumber => ({
        id: String(backendNumber.id),
        phone_number: backendNumber.phone_number,
        business_id: backendNumber.business_id,
        twilio_sid: backendNumber.twilio_sid,
        friendly_name: backendNumber.friendly_name,
        provider: 'twilio',
        monthlyFee: parseFloat(backendNumber.monthly_cost || '1.00'),
        monthly_cost: backendNumber.monthly_cost,
        callCount: 0,
        status: backendNumber.is_active === 1 ? 'active' : 'inactive',
        is_active: backendNumber.is_active,
        country: backendNumber.country,
        region: backendNumber.region,
        locality: backendNumber.locality,
        purchase_price: backendNumber.purchase_price,
        purchase_price_unit: backendNumber.purchase_price_unit,
        capabilities: {
            voice: backendNumber.capabilities?.voice !== false,
            sms: backendNumber.capabilities?.sms !== false,
            ...backendNumber.capabilities
        },
        createdAt: new Date(backendNumber.created_at),
        updatedAt: new Date(backendNumber.updated_at),
        created_at: backendNumber.created_at,
        updated_at: backendNumber.updated_at,
    });

    // Helper function to transform call data
    const transformCall = (backendCall: any): TwilioCall | null => {
        if (!backendCall) return null;
        return {
            id: String(backendCall.id),
            callSid: backendCall.call_sid || backendCall.callSid,
            call_sid: backendCall.call_sid || backendCall.callSid,
            userId: String(backendCall.business_id),
            business_id: backendCall.business_id,
            phoneNumberId: String(backendCall.phone_number_id),
            phone_number_id: backendCall.phone_number_id,
            to: backendCall.to_number || backendCall.to,
            to_number: backendCall.to_number || backendCall.to,
            from: backendCall.from_number || backendCall.from,
            from_number: backendCall.from_number || backendCall.from,
            direction: backendCall.direction,
            status: backendCall.status,
            duration: backendCall.duration || 0,
            price: backendCall.price,
            priceUnit: backendCall.price_unit || backendCall.priceUnit,
            price_unit: backendCall.price_unit || backendCall.priceUnit,
            recordingUrl: backendCall.recording_url || backendCall.recordingUrl,
            recording_url: backendCall.recording_url || backendCall.recordingUrl,
            recordingSid: backendCall.recording_sid || backendCall.recordingSid,
            recording_sid: backendCall.recording_sid || backendCall.recordingSid,
            recording_duration: backendCall.recording_duration,
            recording_status: backendCall.recording_status,
            transcription: backendCall.transcription,
            startTime: backendCall.start_time ? new Date(backendCall.start_time) : undefined,
            start_time: backendCall.start_time,
            endTime: backendCall.end_time ? new Date(backendCall.end_time) : undefined,
            end_time: backendCall.end_time,
            createdAt: backendCall.created_at ? new Date(backendCall.created_at) : new Date(),
            created_at: backendCall.created_at,
            updatedAt: backendCall.updated_at ? new Date(backendCall.updated_at) : new Date(),
            updated_at: backendCall.updated_at,
        };
    };

    // Helper function to transform recording data
    const transformRecording = (backendRecording: any): TwilioRecording | null => {
        if (!backendRecording) return null;
        return {
            id: String(backendRecording.id),
            recordingSid: backendRecording.recordingSid,
            userId: String(backendRecording.userId),
            callSid: backendRecording.callSid,
            phoneNumberId: String(backendRecording.phoneNumberId),
            duration: backendRecording.duration || 0,
            channels: backendRecording.channels || 1,
            status: backendRecording.status,
            mediaUrl: backendRecording.mediaUrl,
            price: backendRecording.price,
            priceUnit: backendRecording.priceUnit,
            createdAt: backendRecording.createdAt ? new Date(backendRecording.createdAt) : new Date(),
            updatedAt: backendRecording.updatedAt ? new Date(backendRecording.updatedAt) : new Date(),
            fromNumber: backendRecording.fromNumber,
            toNumber: backendRecording.toNumber,
            callDuration: backendRecording.callDuration,
            callStatus: backendRecording.callStatus,
        };
    };

    // Load user's phone numbers on mount
    useEffect(() => {
        if (isAuthenticated && user) {
            getMyNumbers();
        } else {
            setPhoneNumbers([]);
            setCalls([]);
            setRecordings([]);
        }
    }, [isAuthenticated, user]);

    const getMyNumbers = async () => {
        if (!isAuthenticated) return;
        setLoading(true);
        setError(null);
        try {
            const response = await twilioApi.getMyNumbers();
            if (response.success && response.phoneNumbers) {
                const transformedNumbers = response.phoneNumbers.map(transformPhoneNumber);
                setPhoneNumbers(transformedNumbers);
            } else {
                setPhoneNumbers([]);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch phone numbers';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const searchAvailableNumbers = async (params: {
        areaCode?: string;
        country?: string;
        limit?: number
    }) => {
        if (!isAuthenticated) throw new Error('User must be authenticated');
        setLoading(true);
        setError(null);
        try {
            const response = await twilioApi.getAvailableNumbers(params);
            return response;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to search available numbers';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const buyPhoneNumber = async (data: {
        phoneNumber: string;
        country?: string;
        areaCode?: string;
        websiteId?: string
    }) => {
        if (!isAuthenticated || !user) throw new Error('User must be authenticated');
        setLoading(true);
        setError(null);
        try {
            const response = await twilioApi.buyNumber(data);
            if (response.success && response.phoneNumber) {
                const transformedNumber = transformPhoneNumber(response.phoneNumber);
                setPhoneNumbers(prev => [...prev, transformedNumber]);
                return response;
            } else {
                throw new Error(response.message || 'Failed to purchase phone number');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to purchase phone number';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const releasePhoneNumber = async (id: string) => {
        if (!isAuthenticated) throw new Error('User must be authenticated');
        setLoading(true);
        setError(null);
        try {
            await twilioApi.releasePhoneNumber(id);
            setPhoneNumbers(prev => prev.filter(num => num.id !== id));
            setCalls(prev => prev.filter(call => call.phoneNumberId !== id));
            setRecordings(prev => prev.filter(rec => rec.phoneNumberId !== id));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to release phone number';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const getCallHistory = async (params?: {
        phoneNumberId?: string;
        limit?: number;
        page?: number;
        status?: string;
    }) => {
        if (!isAuthenticated) return;
        setLoading(true);
        setError(null);
        try {
            const response = await twilioApi.getCallLogs(params || {});
            if (response.success && response.callLogs) {
                const validCallLogs = (response.callLogs || []).filter(Boolean);
                const transformedCalls = validCallLogs.map(transformCall).filter((call: TwilioCall | null): call is TwilioCall => call !== null);
                setCalls(transformedCalls);
            } else {
                setCalls([]);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch call history';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const getCallDetails = async (callSid: string): Promise<TwilioCall> => {
        if (!isAuthenticated) throw new Error('User must be authenticated');
        setLoading(true);
        setError(null);
        try {
            const response = await twilioApi.getCallLog(callSid);
            if (response.success && response.callLog) {
                const transformedCall = transformCall(response.callLog);
                if (transformedCall) {
                    return transformedCall;
                }
            }
            throw new Error('Call not found');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch call details';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const getRecordings = async (params?: {
        callSid?: string;
        phoneNumberId?: string;
        limit?: number;
        page?: number
    }) => {
        if (!isAuthenticated) return;
        setLoading(true);
        setError(null);
        try {
            const response = await twilioApi.getRecordings(params || {});
            if (response.success && response.recordings) {
                const validRecordings = (response.recordings || []).filter(Boolean);
                const transformedRecordings = validRecordings.map(transformRecording).filter((recording: TwilioRecording | null): recording is TwilioRecording => recording !== null);
                setRecordings(transformedRecordings);
            } else {
                setRecordings([]);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch recordings';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const deleteRecording = async (recordingSid: string) => {
        if (!isAuthenticated) throw new Error('User must be authenticated');
        setLoading(true);
        setError(null);
        try {
            await twilioApi.deleteRecording(recordingSid);
            setRecordings(prev => prev.filter(rec => rec.recordingSid !== recordingSid));
            setCalls(prev =>
                prev.map(call =>
                    call.recordingSid === recordingSid
                        ? { ...call, recordingSid: undefined, recordingUrl: undefined }
                        : call
                )
            );
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete recording';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const contextValue: UserPhoneNumbersContextType = {
        phoneNumbers,
        calls,
        recordings,
        phoneNumberStats: null,
        loading,
        error,
        getMyNumbers,
        searchAvailableNumbers,
        buyPhoneNumber,
        updatePhoneNumber: async () => ({} as PhoneNumber),
        releasePhoneNumber,
        getCallHistory,
        getCallDetails,
        getRecordings,
        deleteRecording,
    };

    return (
        <UserPhoneNumbersContext.Provider value={contextValue}>
            {children}
        </UserPhoneNumbersContext.Provider>
    );
};

export const useUserPhoneNumbers = () => {
    const context = useContext(UserPhoneNumbersContext);
    if (context === undefined) {
        throw new Error('useUserPhoneNumbers must be used within a UserPhoneNumbersProvider');
    }
    return context;
};
