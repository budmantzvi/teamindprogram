/**
 * Grow Payment API Integration
 * 
 * To use this in production:
 * 1. Get your API Key and Terminal ID from Grow.
 * 2. Set them in your environment variables.
 * 3. Update the server-side logic to handle the actual API requests.
 */

export interface GrowPaymentRequest {
  pageCode: string; // Terminal ID / Page Code
  userId: string; // Unique user ID
  sum: number; // Amount
  description: string; // Order description
  fullName: string;
  email: string;
  phone: string;
  successUrl: string;
  failureUrl: string;
}

export const createGrowPayment = async (request: GrowPaymentRequest) => {
  // In a real implementation, this should be a server-side call to avoid exposing API keys.
  // The server would then call Grow's API and return the payment URL.
  
  console.log('Initiating Grow Payment:', request);
  
  // Mocking the API response
  // In production, you would fetch('/api/grow/create-payment', ...)
  
  return {
    url: `https://grow.co.il/purchase?page_code=${request.pageCode}&sum=${request.sum}&description=${encodeURIComponent(request.description)}&full_name=${encodeURIComponent(request.fullName)}&email=${encodeURIComponent(request.email)}&phone=${request.phone}`,
    success: true
  };
};
