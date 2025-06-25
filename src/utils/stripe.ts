import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default stripePromise;

export function formatPrice(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatSubscriptionStatus(status: string): string {
  switch (status) {
    case 'active':
      return 'Active';
    case 'trialing':
      return 'Trial';
    case 'past_due':
      return 'Past Due';
    case 'canceled':
      return 'Canceled';
    case 'incomplete':
      return 'Incomplete';
    case 'incomplete_expired':
      return 'Expired';
    case 'unpaid':
      return 'Unpaid';
    case 'paused':
      return 'Paused';
    case 'not_started':
      return 'Not Started';
    default:
      return status;
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'active':
    case 'trialing':
      return 'text-green-600 bg-green-100';
    case 'past_due':
    case 'incomplete':
    case 'unpaid':
      return 'text-yellow-600 bg-yellow-100';
    case 'canceled':
    case 'incomplete_expired':
      return 'text-red-600 bg-red-100';
    case 'paused':
      return 'text-gray-600 bg-gray-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}