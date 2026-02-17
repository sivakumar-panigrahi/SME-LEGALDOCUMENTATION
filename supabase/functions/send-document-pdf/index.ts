
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SENDER_EMAIL = "onboarding@resend.dev";

const escapeHtml = (text: string): string => {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, (m) => map[m]);
};

interface EmailRequest {
  documentId: string;
  recipientEmail: string;
  recipientName: string;
  companyName: string;
  documentType: string;
  documentContent: string;
}

const generatePDFContent = (document: any, status: string, companySignature: string) => {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${escapeHtml(document.template_name || 'Document')}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .header { text-align: center; margin-bottom: 30px; }
        .content { margin-bottom: 30px; }
        .signature-section { margin-top: 50px; }
        .signature-block { margin: 30px 0; padding: 20px; border: 1px solid #ddd; }
        .footer { margin-top: 50px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${escapeHtml(document.template_name || 'Legal Document')}</h1>
        <p>Document ID: ${escapeHtml(document.id)}</p>
        <p>Status: ${escapeHtml(status)}</p>
    </div>
    
    <div class="content">
        ${document.form_data ? Object.entries(document.form_data).map(([key, value]) => 
          `<p><strong>${escapeHtml(key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()))}:</strong> ${escapeHtml(String(value))}</p>`
        ).join('') : ''}
    </div>
    
    <div class="signature-section">
        <h3>Signatures</h3>
        
        ${companySignature ? `
        <div class="signature-block">
            <h4>Company Signature</h4>
            <p>${escapeHtml(companySignature)}</p>
            <p>Date: ${escapeHtml(new Date().toLocaleDateString())}</p>
        </div>
        ` : ''}
        
        ${status === 'fully_signed' && document.client_signature ? `
        <div class="signature-block">
            <h4>Client Signature</h4>
            <p>${escapeHtml(document.client_signature)}</p>
            <p>Date: ${escapeHtml(new Date(document.updated_at).toLocaleDateString())}</p>
        </div>
        ` : `
        <div class="signature-block">
            <h4>Client Signature</h4>
            <p><em>Pending signature...</em></p>
        </div>
        `}
    </div>
    
    <div class="footer">
        <p>This document was generated electronically and is valid without a physical signature.</p>
        <p>Generated on: ${escapeHtml(new Date().toLocaleString())}</p>
    </div>
</body>
</html>`;
};

const handler = async (req: Request): Promise<Response> => {
  console.log('PDF email function called with method:', req.method);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the caller
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const authSupabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await authSupabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    const userId = claimsData.claims.sub;

    const requestBody = await req.json();
    const { 
      documentId, 
      recipientEmail, 
      recipientName, 
      companyName, 
      documentType,
    }: EmailRequest = requestBody;

    if (!documentId || !recipientEmail || !recipientName || !companyName || !documentType) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Fetch document and verify ownership using the authenticated client
    const { data: document, error: docError } = await authSupabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (docError || !document) {
      console.error('Document lookup failed:', docError);
      return new Response(
        JSON.stringify({ error: 'Unable to process request' }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (document.user_id !== userId) {
      return new Response(
        JSON.stringify({ error: 'Unable to process request' }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const pdfContent = generatePDFContent(document, document.status, document.company_signature || "");

    console.log('Sending PDF email to:', recipientEmail);

    const emailResponse = await resend.emails.send({
      from: `Legal Documents <${SENDER_EMAIL}>`,
      to: [recipientEmail],
      subject: `Document - ${escapeHtml(documentType)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; color: white; text-align: center; margin-bottom: 30px;">
            <h1 style="margin: 0; font-size: 28px;">Document from ${escapeHtml(companyName)}</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
            <h2 style="color: #333; margin-top: 0;">Hello ${escapeHtml(recipientName)},</h2>
            <p style="color: #666; line-height: 1.6; font-size: 16px;">
              ${escapeHtml(companyName)} has sent you a <strong>${escapeHtml(documentType)}</strong> document.
            </p>
          </div>

          <div style="border: 1px solid #ddd; padding: 20px; margin: 20px 0; border-radius: 8px;">
            ${pdfContent}
          </div>

          <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
            <p style="color: #999; font-size: 14px; text-align: center;">
              This document was sent by ${escapeHtml(companyName)}.
            </p>
          </div>
        </div>
      `,
    });

    console.log('PDF email sent successfully:', emailResponse);

    // Log email using service role for insert
    const serviceSupabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error: logError } = await serviceSupabase
      .from('email_logs')
      .insert({
        document_id: documentId,
        recipient_email: recipientEmail,
        email_type: 'document_pdf',
        status: 'sent'
      });

    if (logError) {
      console.error('Error logging email:', logError);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      emailId: emailResponse.data?.id,
      message: 'Document email sent successfully'
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-document-pdf function:", error);
    
    return new Response(
      JSON.stringify({ error: 'Internal server error', success: false }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
