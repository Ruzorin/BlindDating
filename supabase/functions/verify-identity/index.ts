import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerificationRequest {
  userId: string;
  documentUrl: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { userId, documentUrl }: VerificationRequest = await req.json();

    // Initialize verification service
    const verificationService = {
      async verifyDocument(url: string) {
        // Here we would integrate with a service like Onfido or Jumio
        // For demo purposes, we'll simulate a verification process
        await new Promise(resolve => setTimeout(resolve, 2000));
        return {
          success: true,
          verified: true,
          age: 25,
          documentType: 'passport',
        };
      }
    };

    // Verify the document
    const verificationResult = await verificationService.verifyDocument(documentUrl);

    if (verificationResult.verified) {
      // Update user profile with verification status
      const { error: updateError } = await supabaseClient
        .from('profiles')
        .update({
          is_verified: true,
          last_verified: new Date().toISOString(),
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      return new Response(
        JSON.stringify({
          status: 'approved',
          message: 'Your identity has been verified successfully!',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } else {
      throw new Error('Verification failed');
    }
  } catch (error) {
    return new Response(
      JSON.stringify({
        status: 'rejected',
        message: 'Identity verification failed. Please try again.',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});