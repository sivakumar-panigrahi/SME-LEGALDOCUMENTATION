import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { validateTestingEmail, getTestingMessage, IS_TESTING } from '@/config/env';

export interface Document {
  id?: string;
  template_name: string;
  form_data: any;
  status: 'draft' | 'company_signed' | 'sent_for_signature' | 'fully_signed';
  company_signature?: string;
  client_signature?: string;
  signed_document_url?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  can_sign?: boolean;
}

export const useDocuments = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const saveDocument = async (document: Document): Promise<string | null> => {
    setLoading(true);
    try {
      // Ensure user_id is set from current auth user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('User must be authenticated to save documents');
      }

      const documentToSave = {
        ...document,
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('documents')
        .insert(documentToSave)
        .select('id')
        .single();

      if (error) throw error;

      toast({
        title: "Document Saved",
        description: "Document has been saved successfully.",
      });

      return data.id;
    } catch (error: any) {
      console.error('Error saving document:', error);
      toast({
        title: "Error",
        description: "Failed to save document: " + error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateDocumentStatus = async (
    documentId: string, 
    status: Document['status'],
    signature?: string
  ): Promise<boolean> => {
    setLoading(true);
    try {
      const updateData: any = { 
        status, 
        updated_at: new Date().toISOString() 
      };

      if (signature) {
        if (status === 'company_signed') {
          updateData.company_signature = signature;
        } else if (status === 'fully_signed') {
          updateData.client_signature = signature;
        }
      }

      console.log('Updating document with data:', updateData);

      const { error } = await supabase
        .from('documents')
        .update(updateData)
        .eq('id', documentId);

      if (error) throw error;

      const statusMessages = {
        'company_signed': 'Document signed by company successfully.',
        'sent_for_signature': 'Document sent for client signature.',
        'fully_signed': 'Document fully executed by both parties.'
      };

      toast({
        title: "Document Updated",
        description: statusMessages[status] || "Document status updated successfully.",
      });

      return true;
    } catch (error: any) {
      console.error('Error updating document:', error);
      toast({
        title: "Error",
        description: "Failed to update document: " + error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const sendDocumentForSignature = async (
    documentId: string,
    recipientEmail: string,
    recipientName: string,
    companyName: string,
    documentType: string
  ): Promise<boolean> => {
    // Validate email in testing mode
    if (IS_TESTING && !validateTestingEmail(recipientEmail)) {
      toast({
        title: "Email Restriction",
        description: getTestingMessage(),
        variant: "destructive"
      });
      return false;
    }

    setLoading(true);
    try {
      console.log('Sending document for signature:', {
        documentId,
        recipientEmail,
        recipientName,
        companyName,
        documentType,
        isTesting: IS_TESTING
      });

      const { data, error } = await supabase.functions.invoke('send-document-email', {
        body: {
          documentId,
          recipientEmail,
          recipientName,
          companyName,
          documentType,
          isTesting: IS_TESTING,
        },
      });

      console.log('Email function response:', { data, error });

      if (error) throw error;

      if (data?.success) {
        await updateDocumentStatus(documentId, 'sent_for_signature');
        
        toast({
          title: "Email Sent Successfully",
          description: IS_TESTING 
            ? `Test email sent to ${recipientEmail} for signature.`
            : `Document sent to ${recipientEmail} for signature.`,
        });
        return true;
      } else {
        throw new Error(data?.error || 'Failed to send email');
      }
    } catch (error: any) {
      console.error('Error sending document for signature:', error);
      toast({
        title: "Email Send Failed",
        description: "Failed to send document: " + (error.message || 'Unknown error'),
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getDocument = async (documentId: string): Promise<Document | null> => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (error) throw error;
      
      return {
        ...data,
        status: data.status as Document['status']
      };
    } catch (error: any) {
      console.error('Error fetching document:', error);
      return null;
    }
  };

  const getDocumentByToken = async (token: string): Promise<Document | null> => {
    try {
      const { data, error } = await supabase
        .rpc('get_document_by_token', { access_token: token });

      if (error) throw error;
      
      if (!data || data.length === 0) {
        return null;
      }

      const doc = data[0];
      return {
        id: doc.document_id,
        template_name: doc.template_name,
        form_data: doc.form_data,
        status: doc.status as Document['status'],
        company_signature: doc.company_signature,
        client_signature: doc.client_signature,
        created_at: doc.created_at,
        updated_at: doc.updated_at,
        can_sign: doc.can_sign
      };
    } catch (error: any) {
      console.error('Error fetching document by token:', error);
      return null;
    }
  };

  const signDocumentByToken = async (token: string, signature: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .rpc('sign_document_by_token', { 
          access_token: token, 
          signature_data: signature 
        });

      if (error) throw error;
      
      return data === true;
    } catch (error: any) {
      console.error('Error signing document by token:', error);
      return false;
    }
  };

  const createAccessToken = async (documentId: string, recipientEmail?: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('document_access_tokens')
        .insert({
          document_id: documentId,
          recipient_email: recipientEmail,
          purpose: 'signing'
        })
        .select('token')
        .single();

      if (error) throw error;
      
      return data.token;
    } catch (error: any) {
      console.error('Error creating access token:', error);
      return null;
    }
  };

  return {
    loading,
    saveDocument,
    updateDocumentStatus,
    sendDocumentForSignature,
    getDocument,
    getDocumentByToken,
    signDocumentByToken,
    createAccessToken,
  };
};
