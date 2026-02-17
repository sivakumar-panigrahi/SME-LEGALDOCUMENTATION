import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";

export const useSignDocument = (documentId: string | undefined) => {
  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  // Use a ref to track if the fetch has already been initiated
  const hasFetched = useRef(false);

  useEffect(() => {
    // Prevent re-running if we already started fetching for this documentId
    if (hasFetched.current || !documentId) {
      if (!documentId) setLoading(false);
      return;
    }

    hasFetched.current = true;

    const loadDocument = async () => {
      try {
        const token = searchParams.get('token');
        let doc;

        if (token) {
          // Fetch via secure token for external signers
          const { data, error } = await supabase.rpc('get_document_by_token', {
            access_token: token
          });

          if (error) throw error;

          if (data && data.length > 0) {
            const d = data[0];
            doc = {
              id: d.document_id,
              template_name: d.template_name,
              form_data: d.form_data,
              status: d.status,
              company_signature: d.company_signature,
              client_signature: d.client_signature,
              created_at: d.created_at,
              updated_at: d.updated_at,
              can_sign: d.can_sign
            };
          }
        } else {
          // Standard fetch for authenticated internal users
          const { data, error } = await supabase
            .from('documents')
            .select('*')
            .eq('id', documentId)
            .single();

          if (error) throw error;
          doc = data;
        }

        if (doc) {
          setDocument(doc);
        } else {
          toast({
            title: "Document Not Found",
            description: token
              ? "The document link has expired or is invalid."
              : "The requested document could not be found.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error loading document:', error);
        toast({
          title: "Error",
          description: "Failed to load document.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadDocument();
  }, [documentId, searchParams, toast]); // Removed unstable function references

  return { document, setDocument, loading };
};
