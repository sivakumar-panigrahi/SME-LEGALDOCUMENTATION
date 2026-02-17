

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
}

const handler = async (req: Request): Promise<Response> => {
  console.log('Email function called with method:', req.method);

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
      documentType
    }: EmailRequest = requestBody;

    if (!documentId || !recipientEmail || !recipientName || !companyName || !documentType) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Verify document ownership using the authenticated client
    const { data: docCheck, error: docCheckError } = await authSupabase
      .from('documents')
      .select('user_id')
      .eq('id', documentId)
      .single();

    if (docCheckError || !docCheck) {
      console.error('Document lookup failed:', docCheckError);
      return new Response(
        JSON.stringify({ error: 'Unable to process request' }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (docCheck.user_id !== userId) {
      return new Response(
        JSON.stringify({ error: 'Unable to process request' }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Use service role for token creation (needs to bypass RLS)
    const serviceSupabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: tokenData, error: tokenError } = await serviceSupabase
      .from('document_access_tokens')
      .insert({
        document_id: documentId,
        recipient_email: recipientEmail,
        purpose: 'signing'
      })
      .select('token')
      .single();

    if (tokenError || !tokenData) {
      console.error('Error creating access token:', tokenError);
      return new Response(
        JSON.stringify({ error: 'Unable to process request' }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const appUrl = Deno.env.get("APP_URL") || req.headers.get("origin") || "http://localhost:8080";
    const signatureLink = `${appUrl}/sign-document/${documentId}?token=${tokenData.token}`;

    console.log('Sending email to:', recipientEmail);

    const emailResponse = await resend.emails.send({
      from: `Legal Documents <${SENDER_EMAIL}>`,
      to: [recipientEmail],
      subject: `Document Ready for Signature - ${escapeHtml(documentType)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; color: white; text-align: center; margin-bottom: 30px;">
            <h1 style="margin: 0; font-size: 28px;">Document Ready for Your Signature</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
            <h2 style="color: #333; margin-top: 0;">Hello ${escapeHtml(recipientName)},</h2>
            <p style="color: #666; line-height: 1.6; font-size: 16px;">
              ${escapeHtml(companyName)} has prepared a <strong>${escapeHtml(documentType)}</strong> document that requires your electronic signature.
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${signatureLink}" 
               style="background: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 16px;">
              Sign Document Now
            </a>
          </div>

          <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h3 style="color: #1976d2; margin-top: 0;">Next Steps:</h3>
            <ul style="color: #666; line-height: 1.6;">
              <li>Click the "Sign Document Now" button above</li>
              <li>Review the document carefully</li>
              <li>Add your electronic signature</li>
              <li>Download your copy once completed</li>
            </ul>
          </div>

          <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
            <p style="color: #999; font-size: 14px; text-align: center;">
              This document was sent by ${escapeHtml(companyName)}. If you have any questions, please contact them directly.
            </p>
          </div>
        </div>
      `,
    });

    console.log('Email sent successfully:', emailResponse);

    const { error: logError } = await serviceSupabase
      .from('email_logs')
      .insert({
        document_id: documentId,
        recipient_email: recipientEmail,
        email_type: 'esign_request',
        status: 'sent'
      });

    if (logError) {
      console.error('Error logging email:', logError);
    }

    return new Response(JSON.stringify({
      success: true,
      emailId: emailResponse.data?.id,
      message: 'Email sent successfully',
      signatureLink: signatureLink
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-document-email function:", error);

    return new Response(
      JSON.stringify({ error: 'Internal server error', success: false }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
