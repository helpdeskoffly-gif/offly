# Email Service Setup Guide

## Current Status
The feedback forms are now connected and working with a **mailto fallback** system. Users can send feedback which will open their default email client with a pre-filled message to `helpdesk.offly@gmail.com`.

## How it works right now:
1. User fills out feedback form
2. Clicks "Send Feedback"
3. Their default email client opens with:
   - **To:** helpdesk.offly@gmail.com
   - **Subject:** Offly Feedback: [Type]
   - **Body:** Pre-filled with their message and user details

## Future Upgrade Options

### Option 1: EmailJS (Client-side, No Backend Required)

1. **Sign up at [EmailJS](https://www.emailjs.com/)**
2. **Create a service** (Gmail, Outlook, etc.)
3. **Create email templates**
4. **Get your credentials:**
   - Service ID
   - Template ID
   - Public Key

5. **Add to your `.env` file:**
   ```env
   REACT_APP_EMAILJS_SERVICE_ID=service_xxxxxxx
   REACT_APP_EMAILJS_TEMPLATE_ID=template_xxxxxxx
   REACT_APP_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxx
   ```

6. **Uncomment the EmailJS code** in `src/services/emailService.js`

### Option 2: Backend API (More Reliable)

Create a simple backend endpoint that sends emails via a service like:
- Nodemailer + Gmail SMTP
- SendGrid
- AWS SES
- Resend
- Postmark

### Option 3: Supabase Edge Functions (Recommended)

Since you're already using Supabase, you can create an Edge Function:

```sql
-- Create a feedback table to store submissions
CREATE TABLE feedback (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  message text NOT NULL,
  user_email text,
  user_name text,
  feedback_type text DEFAULT 'general',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to insert their own feedback
CREATE POLICY "Users can insert their own feedback" ON feedback
FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);
```

## Current Implementation Details

### Files Modified:
- ✅ `src/services/emailService.js` - Email service with mailto fallback
- ✅ `src/components/Navbar.jsx` - Updated feedback form with email integration
- ✅ `src/components/Dashboard.jsx` - Updated feedback form with email integration

### Features Added:
- ✅ Loading states during submission
- ✅ Success/error status messages
- ✅ Form validation
- ✅ User information pre-filled in emails
- ✅ Professional email templates
- ✅ Graceful fallbacks

### Next Steps:
1. **Test the current implementation** - feedback forms should open email client
2. **Choose upgrade path** (EmailJS, Backend API, or Supabase Edge Functions)
3. **Configure email service** based on chosen option
4. **Update environment variables**
5. **Enable the enhanced email sending**

The system is designed to be easily upgradeable while providing immediate functionality!
