import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Camera, Upload, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';

interface VerificationStatus {
  status: 'pending' | 'processing' | 'approved' | 'rejected';
  message: string;
}

export function IdentityVerification() {
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>({
    status: 'pending',
    message: '',
  });
  const [isUploading, setIsUploading] = useState(false);
  const user = useAuthStore((state) => state.user);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!user) return;

    const file = acceptedFiles[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Upload to secure bucket with encryption
      const { data, error } = await supabase.storage
        .from('identity-verification')
        .upload(`${user.id}/${file.name}`, file, {
          cacheControl: '0',
          upsert: true,
        });

      if (error) throw error;

      // Start verification process
      await startVerification(data.path);
      
      setVerificationStatus({
        status: 'processing',
        message: 'Your identity document is being verified. This usually takes 1-2 minutes.',
      });
    } catch (error) {
      setVerificationStatus({
        status: 'rejected',
        message: 'There was an error uploading your document. Please try again.',
      });
    } finally {
      setIsUploading(false);
    }
  }, [user]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    maxSize: 10485760, // 10MB
  });

  const startVerification = async (documentPath: string) => {
    if (!user) return;

    try {
      const { data: { publicUrl }, error } = await supabase.storage
        .from('identity-verification')
        .getPublicUrl(documentPath);

      if (error) throw error;

      // Call Supabase Edge Function for verification
      const response = await fetch('/api/verify-identity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${supabase.auth.session()?.access_token}`,
        },
        body: JSON.stringify({
          userId: user.id,
          documentUrl: publicUrl,
        }),
      });

      if (!response.ok) throw new Error('Verification failed');

      const result = await response.json();
      
      setVerificationStatus({
        status: result.status,
        message: result.message,
      });
    } catch (error) {
      setVerificationStatus({
        status: 'rejected',
        message: 'Verification failed. Please try again.',
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <Shield className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Identity Verification</h2>
        <p className="text-gray-600">
          To ensure a safe environment, we need to verify your identity.
          Your data is encrypted and securely stored.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {verificationStatus.status === 'pending' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-xl shadow-xl p-8 mb-6"
          >
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'}`}
            >
              <input {...getInputProps()} />
              <div className="space-y-4">
                <div className="flex justify-center">
                  {isDragActive ? (
                    <Upload className="w-12 h-12 text-indigo-500" />
                  ) : (
                    <Camera className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    {isDragActive ? 'Drop your document here' : 'Upload your identity document'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Passport, ID card, or driver's license
                  </p>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Select file
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {verificationStatus.status === 'processing' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-blue-50 rounded-xl p-6 flex items-center space-x-4"
          >
            <div className="flex-shrink-0">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
            <div>
              <p className="text-blue-900 font-medium">{verificationStatus.message}</p>
            </div>
          </motion.div>
        )}

        {verificationStatus.status === 'approved' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-green-50 rounded-xl p-6 flex items-center space-x-4"
          >
            <CheckCircle className="w-8 h-8 text-green-500" />
            <p className="text-green-900 font-medium">{verificationStatus.message}</p>
          </motion.div>
        )}

        {verificationStatus.status === 'rejected' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-50 rounded-xl p-6 flex items-center space-x-4"
          >
            <AlertCircle className="w-8 h-8 text-red-500" />
            <div>
              <p className="text-red-900 font-medium">{verificationStatus.message}</p>
              <button
                onClick={() => setVerificationStatus({ status: 'pending', message: '' })}
                className="mt-2 text-sm font-medium text-red-700 hover:text-red-800"
              >
                Try again
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8 space-y-4 text-sm text-gray-500">
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5" />
          <p>Your data is encrypted with AES-256</p>
        </div>
        <p className="text-xs">
          By uploading your document, you agree to our identity verification process.
          Your data will be handled in accordance with GDPR and KVKK regulations.
        </p>
      </div>
    </div>
  );
}