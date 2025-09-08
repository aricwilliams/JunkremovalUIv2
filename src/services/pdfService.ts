import { jsPDF } from 'jspdf';
import { EstimateRequest } from './estimatesService';

export interface PDFEstimateData {
  estimate: EstimateRequest;
  businessInfo?: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website?: string;
  };
}

class PDFService {
  private defaultBusinessInfo = {
    name: 'Junk Removal Pro',
    address: '123 Business St, Wilmington, NC 28401',
    phone: '(910) 555-0123',
    email: 'info@junkremovalpro.com',
    website: 'www.junkremovalpro.com'
  };

  /**
   * Generate and download PDF for an estimate
   */
  async generateEstimatePDF(data: PDFEstimateData): Promise<void> {
    console.log('🚀 Starting PDF generation...', data);
    const { estimate, businessInfo = this.defaultBusinessInfo } = data;
    
    // Create new PDF document
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Helper function to add text with word wrapping
    const addText = (text: string, x: number, y: number, maxWidth?: number, fontSize: number = 10) => {
      doc.setFontSize(fontSize);
      if (maxWidth) {
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, x, y);
        return y + (lines.length * (fontSize * 0.4));
      } else {
        doc.text(text, x, y);
        return y + (fontSize * 0.4);
      }
    };

    // Helper function to add a line
    const addLine = (y: number) => {
      doc.setLineWidth(0.5);
      doc.line(20, y, pageWidth - 20, y);
      return y + 5;
    };

    // Header
    doc.setFillColor(59, 130, 246); // Blue background
    doc.rect(0, 0, pageWidth, 30, 'F');
    
    doc.setTextColor(255, 255, 255); // White text
    yPosition = addText(businessInfo.name, 20, 20, undefined, 18);
    doc.setTextColor(0, 0, 0); // Black text
    
    yPosition = 40;

    // Business Information
    yPosition = addText('Business Information', 20, yPosition, undefined, 14);
    yPosition += 5;
    yPosition = addText(`Company: ${businessInfo.name}`, 20, yPosition);
    yPosition = addText(`Address: ${businessInfo.address}`, 20, yPosition);
    yPosition = addText(`Phone: ${businessInfo.phone}`, 20, yPosition);
    yPosition = addText(`Email: ${businessInfo.email}`, 20, yPosition);
    if (businessInfo.website) {
      yPosition = addText(`Website: ${businessInfo.website}`, 20, yPosition);
    }
    
    yPosition = addLine(yPosition + 5);

    // Estimate Information
    yPosition = addText('Estimate Information', 20, yPosition, undefined, 14);
    yPosition += 5;
    yPosition = addText(`Estimate #: ${estimate.id}`, 20, yPosition);
    yPosition = addText(`Date: ${new Date(estimate.created_at).toLocaleDateString()}`, 20, yPosition);
    yPosition = addText(`Status: ${estimate.status.toUpperCase()}`, 20, yPosition);
    yPosition = addText(`Priority: ${estimate.request_priority.toUpperCase()}`, 20, yPosition);
    
    if (estimate.quote_amount) {
      yPosition = addText(`Quote Amount: $${parseFloat(estimate.quote_amount || '0').toLocaleString()}`, 20, yPosition, undefined, 12);
    }
    
    yPosition = addLine(yPosition + 5);

    // Customer Information
    yPosition = addText('Customer Information', 20, yPosition, undefined, 14);
    yPosition += 5;
    
    const customerName = estimate.is_new_client ? estimate.full_name : estimate.existing_customer_name || 'N/A';
    const customerPhone = estimate.is_new_client ? estimate.phone_number : estimate.existing_customer_phone || 'N/A';
    const customerEmail = estimate.is_new_client ? estimate.email_address : estimate.existing_customer_email || 'N/A';
    
    yPosition = addText(`Name: ${customerName}`, 20, yPosition);
    yPosition = addText(`Phone: ${customerPhone}`, 20, yPosition);
    yPosition = addText(`Email: ${customerEmail}`, 20, yPosition);
    yPosition = addText(`OK to Text: ${estimate.ok_to_text ? 'Yes' : 'No'}`, 20, yPosition);
    
    yPosition = addLine(yPosition + 5);

    // Service Details
    yPosition = addText('Service Details', 20, yPosition, undefined, 14);
    yPosition += 5;
    yPosition = addText(`Service Address: ${estimate.service_address}`, 20, yPosition, pageWidth - 40);
    yPosition += 5;
    
    if (estimate.gate_code) {
      yPosition = addText(`Gate Code: ${estimate.gate_code}`, 20, yPosition);
    }
    if (estimate.apartment_unit) {
      yPosition = addText(`Apartment/Unit: ${estimate.apartment_unit}`, 20, yPosition);
    }
    
    yPosition = addText(`Location on Property: ${estimate.location_on_property}`, 20, yPosition);
    yPosition = addText(`Approximate Volume: ${estimate.approximate_volume}`, 20, yPosition);
    
    if (estimate.approximate_item_count) {
      yPosition = addText(`Approximate Item Count: ${estimate.approximate_item_count}`, 20, yPosition);
    }
    
    if (estimate.preferred_date) {
      yPosition = addText(`Preferred Date: ${new Date(estimate.preferred_date).toLocaleDateString()}`, 20, yPosition);
    }
    if (estimate.preferred_time) {
      yPosition = addText(`Preferred Time: ${estimate.preferred_time}`, 20, yPosition);
    }
    
    if (estimate.access_considerations) {
      yPosition = addText(`Access Considerations: ${estimate.access_considerations}`, 20, yPosition, pageWidth - 40);
      yPosition += 5;
    }
    
    yPosition = addLine(yPosition + 5);

    // Material Types
    if (estimate.material_types && estimate.material_types.length > 0) {
      yPosition = addText('Material Types', 20, yPosition, undefined, 14);
      yPosition += 5;
      yPosition = addText(estimate.material_types.join(', '), 20, yPosition, pageWidth - 40);
      yPosition = addLine(yPosition + 5);
    }

    // Special Conditions
    const specialConditions = [];
    if (estimate.items_filled_water) specialConditions.push('Items filled with water');
    if (estimate.items_filled_oil_fuel) specialConditions.push('Items filled with oil/fuel');
    if (estimate.hazardous_materials) specialConditions.push('Hazardous materials present');
    if (estimate.items_tied_bags) specialConditions.push('Items tied in bags');
    if (estimate.oversized_items) specialConditions.push('Oversized items');
    if (estimate.mold_present) specialConditions.push('Mold present');
    if (estimate.pests_present) specialConditions.push('Pests present');
    if (estimate.sharp_objects) specialConditions.push('Sharp objects');
    if (estimate.heavy_lifting_required) specialConditions.push('Heavy lifting required');
    if (estimate.disassembly_required) specialConditions.push('Disassembly required');

    if (specialConditions.length > 0) {
      yPosition = addText('Special Conditions', 20, yPosition, undefined, 14);
      yPosition += 5;
      specialConditions.forEach(condition => {
        yPosition = addText(`• ${condition}`, 25, yPosition);
      });
      yPosition = addLine(yPosition + 5);
    }

    // Additional Services
    const additionalServices = [];
    if (estimate.request_donation_pickup) additionalServices.push('Donation pickup requested');
    if (estimate.request_demolition_addon) additionalServices.push('Demolition add-on requested');

    if (additionalServices.length > 0) {
      yPosition = addText('Additional Services', 20, yPosition, undefined, 14);
      yPosition += 5;
      additionalServices.forEach(service => {
        yPosition = addText(`• ${service}`, 25, yPosition);
      });
      yPosition = addLine(yPosition + 5);
    }

    // Quote Information
    if (estimate.quote_amount) {
      yPosition = addText('Quote Information', 20, yPosition, undefined, 14);
      yPosition += 5;
      yPosition = addText(`Quote Amount: $${parseFloat(estimate.quote_amount).toLocaleString()}`, 20, yPosition, undefined, 16);
      
      if (estimate.quote_notes) {
        yPosition += 5;
        yPosition = addText(`Quote Notes: ${estimate.quote_notes}`, 20, yPosition, pageWidth - 40);
      }
      
      yPosition = addLine(yPosition + 5);
    }

    // Additional Notes
    if (estimate.additional_notes) {
      yPosition = addText('Additional Notes', 20, yPosition, undefined, 14);
      yPosition += 5;
      yPosition = addText(estimate.additional_notes, 20, yPosition, pageWidth - 40);
      yPosition = addLine(yPosition + 5);
    }

    // How did you hear about us
    if (estimate.how_did_you_hear) {
      yPosition = addText(`How did you hear about us: ${estimate.how_did_you_hear}`, 20, yPosition);
    }

    // Check if we need a new page
    if (yPosition > pageHeight - 50) {
      doc.addPage();
      yPosition = 20;
    }

    // Footer
    const footerY = pageHeight - 20;
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 20, footerY);
    doc.text(`Estimate #${estimate.id}`, pageWidth - 50, footerY);

    // Terms and Conditions
    yPosition = footerY - 30;
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    yPosition = addText('Terms and Conditions:', 20, yPosition, undefined, 10);
    yPosition += 2;
    const terms = [
      '• This estimate is valid for 30 days from the date of issue.',
      '• Final pricing may vary based on actual conditions and accessibility.',
      '• Payment is due upon completion of services.',
      '• We reserve the right to refuse service for safety reasons.',
      '• Customer is responsible for ensuring safe access to items.'
    ];
    
    terms.forEach(term => {
      yPosition = addText(term, 25, yPosition, pageWidth - 45, 8);
    });

    // Download the PDF
    const fileName = `Estimate_${estimate.id}_${customerName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    console.log('💾 Downloading PDF:', fileName);
    doc.save(fileName);
    console.log('✅ PDF download completed');
  }

  /**
   * Generate a simple quote PDF with just the essential information
   */
  async generateSimpleQuotePDF(data: PDFEstimateData): Promise<void> {
    const { estimate, businessInfo = this.defaultBusinessInfo } = data;
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 20;

    // Header
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, pageWidth, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text(businessInfo.name, 20, 20);
    
    doc.setTextColor(0, 0, 0);
    yPosition = 50;

    // Quote Title
    doc.setFontSize(16);
    doc.text('JUNK REMOVAL QUOTE', 20, yPosition);
    yPosition += 20;

    // Customer Info
    const customerName = estimate.is_new_client ? estimate.full_name : estimate.existing_customer_name || 'N/A';
    doc.setFontSize(12);
    doc.text(`Customer: ${customerName}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Address: ${estimate.service_address}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Date: ${new Date(estimate.created_at).toLocaleDateString()}`, 20, yPosition);
    yPosition += 20;

    // Quote Amount
    if (estimate.quote_amount) {
      doc.setFontSize(20);
      doc.setTextColor(34, 197, 94); // Green color
      doc.text(`QUOTE AMOUNT: $${parseFloat(estimate.quote_amount).toLocaleString()}`, 20, yPosition);
      yPosition += 30;
    }

    // Service Details
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text('Service Details:', 20, yPosition);
    yPosition += 10;
    doc.setFontSize(10);
    doc.text(`• Volume: ${estimate.approximate_volume}`, 20, yPosition);
    yPosition += 8;
    doc.text(`• Location: ${estimate.location_on_property}`, 20, yPosition);
    yPosition += 8;
    
    if (estimate.material_types && estimate.material_types.length > 0) {
      doc.text(`• Materials: ${estimate.material_types.join(', ')}`, 20, yPosition);
      yPosition += 8;
    }

    // Quote Notes
    if (estimate.quote_notes) {
      yPosition += 10;
      doc.setFontSize(10);
      doc.text('Notes:', 20, yPosition);
      yPosition += 8;
      const lines = doc.splitTextToSize(estimate.quote_notes, pageWidth - 40);
      doc.text(lines, 20, yPosition);
    }

    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 20;
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Quote #${estimate.id} | Generated ${new Date().toLocaleDateString()}`, 20, footerY);

    // Download
    const fileName = `Quote_${estimate.id}_${customerName.replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);
  }
}

export const pdfService = new PDFService();
