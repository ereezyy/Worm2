import React, { useEffect, useState } from 'react';
import { CheckCircle, ArrowRight, Home, Loader2 } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';
import { getProductByPriceId } from '../stripe-config';

export function SuccessPage() {
  const { subscription, refetch, loading } = useSubscription();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [refetching, setRefetching] = useState(false);

  useEffect(() => {
    // Get session ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const sessionIdParam = urlParams.get('session_id');
    setSessionId(sessionIdParam);

    // Refetch subscription data to get the latest status
    const refetchData = async () => {
      setRefetching(true);
      await refetch();
      setRefetching(false);
    };
    refetchData();
  }, [refetch]);

  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleViewPricing = () => {
    window.location.href = '/pricing';
  };

  const product = subscription?.price_id ? getProductByPriceId(subscription.price_id) : null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          {refetching || loading ? (
            <div className="flex items-center justify-center text-gray-600">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Loading subscription details...
            </div>
          ) : product ? (
            <p className="text-gray-600">
              Thank you for purchasing <strong>{product.name}</strong>. Your payment has been processed successfully.
            </p>
          ) : (
            <p className="text-gray-600">
              Thank you for your purchase. Your payment has been processed successfully.
            </p>
          )}
        </div>

        {sessionId && (
          <div className="mb-6 p-4 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600 mb-1">Session ID:</p>
            <p className="text-xs font-mono text-gray-800 break-all">{sessionId}</p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleGoHome}
            className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
          >
            <Home className="h-5 w-5 mr-2" />
            Go to Game
          </button>
          
          <button
            onClick={handleViewPricing}
            className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md font-medium transition-colors"
          >
            View Pricing
            <ArrowRight className="h-5 w-5 ml-2" />
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            If you have any questions, please contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
}