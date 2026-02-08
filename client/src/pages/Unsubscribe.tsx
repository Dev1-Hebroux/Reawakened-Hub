import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { motion } from "framer-motion";
import { Mail, CheckCircle, XCircle, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";

export function UnsubscribePage() {
  const [, params] = useRoute("/unsubscribe/:token");
  const token = params?.token;
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'resubscribed'>('loading');
  const [email, setEmail] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('Invalid unsubscribe link');
      return;
    }

    const unsubscribe = async () => {
      try {
        const response = await fetch(`/api/unsubscribe/${token}`);
        const data = await response.json();
        
        if (response.ok) {
          setStatus('success');
          setEmail(data.email || '');
        } else {
          setStatus('error');
          setErrorMessage(data.message || 'Failed to unsubscribe');
        }
      } catch (error) {
        setStatus('error');
        setErrorMessage('Something went wrong. Please try again.');
      }
    };

    unsubscribe();
  }, [token]);

  const handleResubscribe = async () => {
    if (!token) return;

    setStatus('loading');
    try {
      const { apiFetchJson } = await import('@/lib/apiFetch');
      const data = await apiFetchJson(`/api/resubscribe/${token}`, { method: 'POST' });
      setStatus('resubscribed');
    } catch (error: any) {
      setStatus('error');
      setErrorMessage(error.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#1a2744]">
      <Navbar />
      
      <main className="pt-28 pb-32 px-4">
        <div className="max-w-md mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#FAF8F5] dark:bg-[#243656] rounded-3xl p-8 shadow-xl border-2 border-gray-200 dark:border-[#4A7C7C]/30"
          >
            {status === 'loading' && (
              <>
                <div className="h-16 w-16 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                </div>
                <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-2">
                  Processing...
                </h1>
                <p className="text-gray-600 dark:text-[#7C9A8E]">
                  Please wait while we update your preferences.
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="h-16 w-16 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
                <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-2">
                  Unsubscribed Successfully
                </h1>
                <p className="text-gray-600 dark:text-[#7C9A8E] mb-6">
                  {email ? `${email} has been ` : 'You have been '}removed from our mailing list. 
                  We're sorry to see you go!
                </p>
                <Button
                  onClick={handleResubscribe}
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-white"
                  data-testid="button-resubscribe"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Changed your mind? Resubscribe
                </Button>
              </>
            )}

            {status === 'resubscribed' && (
              <>
                <div className="h-16 w-16 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-2">
                  Welcome Back!
                </h1>
                <p className="text-gray-600 dark:text-[#7C9A8E]">
                  You've been resubscribed to our mailing list. 
                  We're glad to have you back!
                </p>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="h-16 w-16 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
                  <XCircle className="h-8 w-8 text-red-500" />
                </div>
                <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-2">
                  Something Went Wrong
                </h1>
                <p className="text-gray-600 dark:text-[#7C9A8E]">
                  {errorMessage}
                </p>
              </>
            )}
          </motion.div>

          <p className="mt-6 text-sm text-gray-500 dark:text-[#7C9A8E]">
            Need help? Contact us at{' '}
            <a href="mailto:hello@reawakened.app" className="text-primary hover:underline">
              hello@reawakened.app
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}

export default UnsubscribePage;
