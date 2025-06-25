import React from 'react';
import { Crown, Calendar, CreditCard, AlertTriangle, CheckCircle } from 'lucide-react';
import { useSubscription } from '../../hooks/useSubscription';
import { getProductByPriceId } from '../../stripe-config';

export function SubscriptionStatus() {
  const { subscription, loading, error, isActiveSubscription } = useSubscription();

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-gray-200 h-10 w-10"></div>
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
          <p className="text-red-700">Error loading subscription: {error}</p>
        </div>
      </div>
    );
  }

  const product = subscription?.price_id ? getProductByPriceId(subscription.price_id) : null;
  const isActive = isActiveSubscription();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          {isActive ? (
            <Crown className="h-6 w-6 text-yellow-500 mr-2" />
          ) : (
            <CreditCard className="h-6 w-6 text-gray-400 mr-2" />
          )}
          <h3 className="text-lg font-semibold text-gray-900">
            {product?.name || 'Free Plan'}
          </h3>
        </div>
        <div className="flex items-center">
          {isActive ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <div className="h-2 w-2 bg-gray-400 rounded-full" />
          )}
          <span className={`ml-2 text-sm ${isActive ? 'text-green-600' : 'text-gray-500'}`}>
            {subscription?.subscription_status || 'Free'}
          </span>
        </div>
      </div>

      {subscription && (
        <div className="space-y-3">
          {product && (
            <div>
              <p className="text-sm text-gray-600">{product.description}</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                ${product.price}/{product.mode === 'subscription' ? 'month' : 'one-time'}
              </p>
            </div>
          )}

          {subscription.current_period_end && (
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              <span>
                {subscription.cancel_at_period_end ? 'Cancels on' : 'Renews on'}{' '}
                {new Date(subscription.current_period_end * 1000).toLocaleDateString()}
              </span>
            </div>
          )}

          {subscription.payment_method_last4 && (
            <div className="flex items-center text-sm text-gray-600">
              <CreditCard className="h-4 w-4 mr-2" />
              <span>
                {subscription.payment_method_brand?.toUpperCase()} •••• {subscription.payment_method_last4}
              </span>
            </div>
          )}
        </div>
      )}

      {!isActive && (
        <div className="mt-4 p-4 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-700">
            Upgrade to access premium features and priority support.
          </p>
          <div className="mt-2">
            <a
              href="/pricing"
              className="inline-block text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              View Plans →
            </a>
          </div>
        </div>
      )}
      
      {subscription?.cancel_at_period_end && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2" />
            <p className="text-sm text-yellow-700">
              Your subscription will be canceled at the end of the current billing period.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}