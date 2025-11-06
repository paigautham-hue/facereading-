/**
 * Stripe Products Configuration
 * Define all products and pricing plans here for easy management
 */

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // in cents
  credits: number;
  popular?: boolean;
  savings?: string;
}

export const PRODUCTS: Product[] = [
  {
    id: "1_reading",
    name: "Single Reading",
    description: "Perfect for trying out our AI face reading",
    price: 997, // $9.97
    credits: 1,
  },
  {
    id: "3_readings",
    name: "3 Readings",
    description: "Great for reading family members",
    price: 1997, // $19.97
    credits: 3,
    savings: "Save 33%",
  },
  {
    id: "5_readings",
    name: "5 Readings Pack",
    description: "Best value for multiple readings",
    price: 2997, // $29.97
    credits: 5,
    popular: true,
    savings: "Save 40%",
  },
  {
    id: "10_readings",
    name: "10 Readings Pack",
    description: "Perfect for professionals and enthusiasts",
    price: 4997, // $49.97
    credits: 10,
    savings: "Save 50%",
  },
];

// Helper function to get product by ID
export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find(p => p.id === id);
}

// Helper function to format price
export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

// Helper function to calculate price per reading
export function getPricePerReading(product: Product): string {
  const pricePerReading = product.price / product.credits;
  return formatPrice(pricePerReading);
}

