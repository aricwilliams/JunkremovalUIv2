import { useState } from 'react';
import { pdfService, PDFEstimateData } from '../services/pdfService';
import { EstimateRequest } from '../services/estimatesService';
import { useToast } from '../contexts/ToastContext';

interface UsePDFGeneratorReturn {
  generateEstimatePDF: (estimate: EstimateRequest, businessInfo?: any) => Promise<void>;
  generateSimpleQuotePDF: (estimate: EstimateRequest, businessInfo?: any) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const usePDFGenerator = (): UsePDFGeneratorReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showSuccess, showError } = useToast();

  const generateEstimatePDF = async (estimate: EstimateRequest, businessInfo?: any) => {
    console.log('🎯 PDF Hook: Starting PDF generation for estimate:', estimate.id);
    setLoading(true);
    setError(null);

    try {
      const data: PDFEstimateData = {
        estimate,
        businessInfo
      };

      console.log('📊 PDF Hook: Calling pdfService with data:', data);
      await pdfService.generateEstimatePDF(data);
      console.log('🎉 PDF Hook: PDF generation successful');
      showSuccess('PDF Generated', 'Estimate PDF has been downloaded successfully!');
    } catch (err: any) {
      console.error('❌ PDF Hook: Error generating PDF:', err);
      const errorMessage = err.message || 'Failed to generate PDF';
      setError(errorMessage);
      showError('PDF Generation Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const generateSimpleQuotePDF = async (estimate: EstimateRequest, businessInfo?: any) => {
    setLoading(true);
    setError(null);

    try {
      const data: PDFEstimateData = {
        estimate,
        businessInfo
      };

      await pdfService.generateSimpleQuotePDF(data);
      showSuccess('PDF Generated', 'Quote PDF has been downloaded successfully!');
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to generate PDF';
      setError(errorMessage);
      showError('PDF Generation Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    generateEstimatePDF,
    generateSimpleQuotePDF,
    loading,
    error
  };
};
