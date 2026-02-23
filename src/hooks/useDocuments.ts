import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export const useDocuments = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchDocuments = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Error",
        description: "Failed to load documents from the database.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const deleteDocument = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setDocuments(prev => prev.filter(doc => doc.id !== id));
      toast({
        title: "Success",
        description: "Document deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: "Error",
        description: "Failed to delete the document.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const updateDocumentStatus = useCallback(async (id: string, status: string, signature?: string) => {
    try {
      const updateData: any = { 
        status, 
        updated_at: new Date().toISOString() 
      };
      
      if (signature) {
        // Logic for adding signature based on status
        if (status === 'company_signed' || status === 'sent_for_signature') {
          updateData.company_signature = signature;
        } else if (status === 'fully_signed') {
          updateData.client_signature = signature;
        }
      }

      const { error } = await supabase
        .from('documents')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      
      await fetchDocuments(); // Refresh the list
      return true;
    } catch (error) {
      console.error('Error updating document:', error);
      return false;
    }
  }, [fetchDocuments]);

  const signDocumentByToken = useCallback(async (token: string, signature: string) => {
    try {
      const { data, error } = await supabase.rpc('sign_document_by_token', {
        access_token: token,
        signature_text: signature
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error signing by token:', error);
      return false;
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return { 
    documents, 
    loading, 
    deleteDocument, 
    updateDocumentStatus,
    signDocumentByToken,
    refetch: fetchDocuments 
  };
};