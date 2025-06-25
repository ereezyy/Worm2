import React from 'react';
import { Check, Loader2 } from 'lucide-react';
import { StripeProduct } from '../../stripe-config';

interface PricingCardProps {
  product: StripeProduct;
  onPurchase: (priceId: string, mode: 'payment' | 'subscription') => void;
  loading?: boolean;
  isPopular?: boolean;
  currentSubscription?: string | null;
}

export function PricingCard({ product, onPurchase, loading = false, isPopular = false, currentSubscription }: PricingCardProps) {
  const handlePurchase = () => {
    onPurchase(product.priceId, product.mode);
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  const isCurrentPlan = currentSubscription === product.priceId;

  return (
    <div className={`relative bg-white rounded-lg shadow-lg border-2 ${isPopular ? 'border-blue-500' : 'border-gray-200'} p-6`}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            Most Popular
          </span>
        </div>
      )}

      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{product.name}</h3>
        <div className="mb-4">
          <span className="text-3xl font-bold text-gray-900">
            {formatPrice(product.price, product.currency)}
          </span>
          {product.mode === 'subscription' && (
            <span className="text-gray-600 ml-1">/month</span>
          )}
        </div>
        <p className="text-gray-600 text-sm mb-6">{product.description}</p>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center">
          <Check className="h-5 w-5 text-green-500 mr-2" />
          <span className="text-sm text-gray-700">
            {product.mode === 'subscription' ? 'Monthly billing' : 'One-time purchase'}
          </span>
        </div>
        <div className="flex items-center">
          <Check className="h-5 w-5 text-green-500 mr-2" />
          <span className="text-sm text-gray-700">Instant access</span>
        </div>
        <div className="flex items-center">
          <Check className="h-5 w-5 text-green-500 mr-2" />
          <span className="text-sm text-gray-700">24/7 support</span>
        </div>
      </div>

      <button
        onClick={handlePurchase}
        disabled={loading || isCurrentPlan}
        className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
          isPopular
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-gray-900 hover:bg-gray-800 text-white'
        } disabled:opacity-50 disabled:cursor-not-allowed ${
          isCurrentPlan ? 'bg-green-600' : ''
        }`}
      >
        {isCurrentPlan ? (
          'Current Plan'
        ) : loading ? (
          <div className="flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Processing...
          </div>
        ) : (
          `${product.mode === 'subscription' ? 'Subscribe' : 'Purchase'} Now`
        )}
      </button>
    </div>
  );
}