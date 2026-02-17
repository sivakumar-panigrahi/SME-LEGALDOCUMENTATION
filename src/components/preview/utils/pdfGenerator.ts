
import DOMPurify from 'dompurify';

const sanitize = (input: string): string => {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
};

export const generatePDFContent = (document: any, documentStatus: string, companySignature: string) => {
  const formData = document.formData || {};
  const currentDate = new Date().toLocaleDateString();
  const currentDateTime = new Date().toLocaleString();
  
  const companySignDate = document.created_at ? new Date(document.created_at).toLocaleString() : currentDateTime;
  const clientSignDate = document.updated_at && documentStatus === 'fully_signed' 
    ? new Date(document.updated_at).toLocaleString() 
    : '';

  return `
    <div style="max-width: 800px; margin: 0 auto; padding: 40px; font-family: 'Times New Roman', serif; line-height: 1.6; color: #333;">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 40px; border-bottom: 2px solid #333; padding-bottom: 20px;">
        <h1 style="font-size: 24px; font-weight: bold; margin: 0; text-transform: uppercase;">
          ${sanitize(document.template?.name || 'Legal Document')}
        </h1>
        <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">
          Document ID: ${sanitize(document.id || 'DRAFT')} | Generated: ${sanitize(currentDate)}
        </p>
      </div>

      <!-- Document Status Badge -->
      <div style="margin-bottom: 30px;">
        <span style="background: ${getStatusColor(documentStatus)}; color: white; padding: 8px 16px; border-radius: 4px; font-size: 12px; text-transform: uppercase; font-weight: bold;">
          ${sanitize(documentStatus.replace('_', ' '))}
        </span>
      </div>

      <!-- Main Content -->
      <div style="margin-bottom: 40px;">
        <h2 style="font-size: 18px; margin-bottom: 20px; color: #333;">Agreement Details</h2>
        
        <div style="margin-bottom: 20px;">
          <strong>Employee Name:</strong> ${sanitize(formData.employeeName || '[Employee Name]')}
        </div>
        <div style="margin-bottom: 20px;">
          <strong>Company Name:</strong> ${sanitize(formData.companyName || '[Company Name]')}
        </div>
        <div style="margin-bottom: 20px;">
          <strong>Position:</strong> ${sanitize(formData.position || '[Position]')}
        </div>
        <div style="margin-bottom: 20px;">
          <strong>Start Date:</strong> ${sanitize(formData.startDate || '[Start Date]')}
        </div>
        <div style="margin-bottom: 20px;">
          <strong>Salary:</strong> ${sanitize(formData.salary || '[Salary]')}
        </div>
        <div style="margin-bottom: 20px;">
          <strong>Employee Email:</strong> ${sanitize(formData.employeeEmail || '[Employee Email]')}
        </div>
      </div>

      <!-- Terms and Conditions -->
      <div style="margin-bottom: 40px;">
        <h3 style="font-size: 16px; margin-bottom: 15px;">Terms and Conditions</h3>
        <div style="background: #f9f9f9; padding: 20px; border-left: 4px solid #ccc;">
          <p style="margin: 0;">
            This agreement constitutes a legally binding contract between the parties mentioned above. 
            All terms and conditions outlined herein are agreed upon by both parties and shall be 
            governed by applicable laws and regulations.
          </p>
        </div>
      </div>

      <!-- Signatures Section -->
      <div style="margin-top: 60px; border-top: 1px solid #ccc; padding-top: 30px;">
        <h3 style="font-size: 16px; margin-bottom: 30px;">Electronic Signatures</h3>
        
        <!-- Company Signature -->
        <div style="display: flex; justify-content: space-between; margin-bottom: 40px;">
          <div style="width: 45%;">
            <div style="border-bottom: 1px solid #333; margin-bottom: 10px; min-height: 40px; display: flex; align-items: end; padding-bottom: 5px;">
              ${sanitize(companySignature || (documentStatus === 'draft' ? '[Company Signature Required]' : ''))}
            </div>
            <div style="font-size: 12px; color: #666;">
              <strong>Company Representative</strong><br>
              ${sanitize(formData.companyName || '[Company Name]')}
              ${companySignature ? `<br>Signed: ${sanitize(companySignDate)}` : ''}
            </div>
          </div>
          
          <!-- Client Signature -->
          <div style="width: 45%;">
            <div style="border-bottom: 1px solid #333; margin-bottom: 10px; min-height: 40px; display: flex; align-items: end; padding-bottom: 5px;">
              ${sanitize(document.client_signature || (documentStatus === 'fully_signed' ? '[Client Signature]' : documentStatus === 'sent_for_signature' ? '[Awaiting Client Signature]' : ''))}
            </div>
            <div style="font-size: 12px; color: #666;">
              <strong>Client</strong><br>
              ${sanitize(formData.employeeName || '[Employee Name]')}
              ${document.client_signature && clientSignDate ? `<br>Signed: ${sanitize(clientSignDate)}` : ''}
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; text-align: center; font-size: 12px; color: #666;">
        <p>This document was generated electronically and is valid without physical signatures.</p>
        <p>Last updated: ${sanitize(currentDateTime)}</p>
      </div>
    </div>
  `;
};

function getStatusColor(status: string): string {
  switch (status) {
    case 'draft': return '#6b7280';
    case 'company_signed': return '#3b82f6';
    case 'sent_for_signature': return '#f59e0b';
    case 'fully_signed': return '#10b981';
    default: return '#6b7280';
  }
}
