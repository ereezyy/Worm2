export interface StripeProduct {
  priceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
  price: number;
  currency: string;
}

export const STRIPE_PRODUCTS: StripeProduct[] = [
  {
    priceId: 'price_1RdFkwAa8g8lb2HOYMe3M3Qb',
    name: 'Subscription',
    description: 'Priority Support: Get faster responses from our dedicated customer support team, and access to advanced tools and customization options tailored for premium users.',
    mode: 'subscription',
    price: 2.99,
    currency: 'USD'
  },
  {
    priceId: 'price_1RdFNpAa8g8lb2HOCiGRI7wy',
    name: 'add-on',
    description: 'Additional Services',
    mode: 'payment',
    price: 0.99,
    currency: 'USD'
  },
  {
    priceId: 'price_1RdFMdAa8g8lb2HOK62ENFuS',
    name: 'Premium Service',
    description: 'Upgraded service',
    mode: 'payment',
    price: 10.99,
    currency: 'USD'
  }
];

export function getProductByPriceId(priceId: string): StripeProduct | undefined {
  return STRIPE_PRODUCTS.find(product => product.priceId === priceId);
}

export function getSubscriptionProducts(): StripeProduct[] {
  return STRIPE_PRODUCTS.filter(product => product.mode === 'subscription');
}

export function getOneTimeProducts(): StripeProduct[] {
  return STRIPE_PRODUCTS.filter(product => product.mode === 'payment');
}