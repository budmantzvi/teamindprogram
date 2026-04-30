# TEAMIND Project

This project is built with React (Vite) and includes a backend for Vercel deployment.

## Project Structure

- `src/`: Frontend React code.
- `api/`: Serverless functions for Vercel (Contact form, Payment integration).
- `public/`: Static assets (images, videos).
- `vercel.json`: Configuration for Vercel deployment.
- `server.ts`: Local Express server for development.

## Deployment to Vercel

1. Push this code to your GitHub repository.
2. Import the project in Vercel.
3. **CRITICAL CONFIGURATION ON VERCEL**:
   - **Framework Preset**: You MUST select `Vite`.
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. **MIME Type Error Fix**: If you see a "Failed to load module script" error, it means Vercel is not serving your `dist` folder. Ensure the "Output Directory" in Vercel settings is set to `dist` and that the build command `npm run build` is successful.
5. **Admin Portal Access**: The admin portal is located at `/teamind-secure-portal-2024-v2`. If this returns 404, check that your `vercel.json` is correctly pushed to your repository.
6. Set the following Environment Variables in Vercel:
   - `GEMINI_API_KEY`: Your Google Gemini API key.
   - `RESEND_API_KEY`: Your Resend API key.
   - `CONTACT_EMAIL`: The email address where you want to receive notifications.
   - `BLOB_READ_WRITE_TOKEN`: Required for file uploads (Vercel Blob).
   - `MAKE_PAYMENT_WEBHOOK_URL`: Your Make.com webhook URL.

## Payment Integration (Make.com)

The payment button sends the following fields to your Make.com webhook:
- `amount`
- `customer_name`
- `email`
- `phone`
- `customer_phone` (Added for easier mapping in Grow)
- `product_name`

To map the phone number in Make.com, look for the `customer_phone` field in the incoming JSON.
