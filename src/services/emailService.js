/**
 * Email Service for sending feedback and contact forms
 * Provides multiple methods including mailto fallback
 */

import emailjs from '@emailjs/browser';

// EmailJS configuration (optional - can be configured later)
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_offly';
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_feedback';
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';

// Initialize EmailJS if keys are provided
if (EMAILJS_PUBLIC_KEY) {
  emailjs.init(EMAILJS_PUBLIC_KEY);
}

/**
 * Send feedback email to helpdesk
 * Uses EmailJS as primary method, mailto as fallback
 * @param {Object} feedbackData - The feedback data
 * @returns {Promise<Object>} Result of email sending
 */
export const sendFeedbackEmail = async (feedbackData) => {
  try {
    console.log('Sending feedback:', feedbackData);
    console.log('EmailJS Config:', {
      SERVICE_ID: EMAILJS_SERVICE_ID,
      TEMPLATE_ID: EMAILJS_TEMPLATE_ID,
      PUBLIC_KEY: EMAILJS_PUBLIC_KEY ? 'SET' : 'NOT SET'
    });
    
    // Try EmailJS first if configured
    if (EMAILJS_PUBLIC_KEY && EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID) {
      console.log('Using EmailJS to send feedback...');
      
      const templateParams = {
        from_name: feedbackData.userName || 'Anonymous User',
        from_email: feedbackData.userEmail || 'no-reply@offly.app',
        subject: `Feedback: ${feedbackData.type || 'General'}`,
        message: feedbackData.message,
        sent_date: new Date().toLocaleDateString(),
        sent_time: new Date().toLocaleTimeString(),
        user_agent: navigator.userAgent,
      };

      // Add attachment information if present
      if (feedbackData.attachment) {
        templateParams.attachment_name = feedbackData.attachment.name;
        templateParams.attachment_size = (feedbackData.attachment.size / 1024).toFixed(2) + ' KB';
        templateParams.attachment_type = feedbackData.attachment.type;
        
        // Convert file to base64 for EmailJS
        try {
          const base64 = await fileToBase64(feedbackData.attachment);
          templateParams.attachment_data = base64;
        } catch (error) {
          console.warn('Could not convert attachment to base64:', error);
          templateParams.attachment_note = `File attached: ${feedbackData.attachment.name} (${templateParams.attachment_size})`;
        }
      }

      console.log('Template params being sent:', templateParams);

      const result = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams
      );

      console.log('EmailJS success:', result);
      return {
        success: true,
        message: 'Feedback sent successfully!',
        data: result,
        method: 'emailjs'
      };
    } else {
      console.log('EmailJS not configured, using mailto fallback...');
      // Fallback to mailto
      openMailtoFallback(feedbackData);
      return {
        success: true,
        message: 'Opening your email client to send feedback...',
        method: 'mailto'
      };
    }

  } catch (error) {
    console.error('Failed to send email:', error);
    
    // Try mailto fallback on error
    try {
      openMailtoFallback(feedbackData);
      return {
        success: true,
        message: 'Opening your email client to send feedback...',
        method: 'mailto_fallback'
      };
    } catch (fallbackError) {
      return {
        success: false,
        message: 'Failed to send feedback. Please contact us directly at helpdesk.offly@gmail.com',
        error: error
      };
    }
  }
};

/**
 * Send contact form email
 * @param {Object} contactData - The contact form data
 * @returns {Promise<Object>} Result of email sending
 */
export const sendContactEmail = async (contactData) => {
  try {
    const templateParams = {
      to_email: 'helpdesk.offly@gmail.com',
      from_name: contactData.name,
      from_email: contactData.email,
      subject: contactData.subject || 'Contact Form Submission',
      message: contactData.message,
      timestamp: new Date().toLocaleString(),
    };

    const result = await emailjs.send(
      EMAILJS_SERVICE_ID,
      'template_contact', // Different template for contact forms
      templateParams
    );

    return {
      success: true,
      message: 'Message sent successfully!',
      data: result
    };

  } catch (error) {
    console.error('Failed to send contact email:', error);
    return {
      success: false,
      message: 'Failed to send message. Please try again.',
      error: error
    };
  }
};

/**
 * Alternative method using Supabase to store feedback (recommended)
 * This stores feedback in database and can trigger email notifications
 */
export const storeFeedbackInDatabase = async (feedbackData) => {
  try {
    // Import Supabase client
    const { supabase } = await import('../supabase');
    
    // Store feedback in database
    const { data, error } = await supabase
      .from('feedback')
      .insert({
        message: feedbackData.message,
        user_email: feedbackData.userEmail,
        user_name: feedbackData.userName,
        feedback_type: feedbackData.type,
        user_id: feedbackData.userId || null,
        metadata: {
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
          page: window.location.pathname,
          attachment_name: feedbackData.attachment?.name || null
        }
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    console.log('Feedback stored in database:', data);
    
    // Also try to send via mailto as backup
    openMailtoFallback(feedbackData);
    
    return {
      success: true,
      message: 'Feedback submitted successfully! We\'ll get back to you soon.',
      data: data,
      method: 'database'
    };

  } catch (error) {
    console.error('Failed to store feedback in database:', error);
    
    // Fallback to mailto
    openMailtoFallback(feedbackData);
    return {
      success: true,
      message: 'Opening your email client to send feedback...',
      method: 'mailto_fallback'
    };
  }
};

/**
 * Simple mailto fallback for when other methods fail
 * @param {Object} feedbackData - The feedback data
 */
export const openMailtoFallback = (feedbackData) => {
  const subject = encodeURIComponent(`Offly Feedback: ${feedbackData.type || 'General'}`);
  const body = encodeURIComponent(`
Hello Offly Team,

${feedbackData.message}

---
Best regards,
${feedbackData.userName || 'Anonymous User'}

Details:
- From: ${feedbackData.userEmail || 'Not provided'}
- Sent: ${new Date().toLocaleString()}
- Page: ${window.location.pathname}
- User Agent: ${navigator.userAgent.slice(0, 100)}...
  `);

  const mailtoLink = `mailto:helpdesk.offly@gmail.com?subject=${subject}&body=${body}`;
  
  // Try to open mailto link
  try {
    window.open(mailtoLink, '_blank');
  } catch (error) {
    // If window.open fails, try location.href
    console.warn('Failed to open mailto with window.open, trying location.href');
    window.location.href = mailtoLink;
  }
};

/**
 * Convert file to base64 string
 * @param {File} file - The file to convert
 * @returns {Promise<string>} Base64 string
 */
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

export default {
  sendFeedbackEmail,
  sendContactEmail,
  storeFeedbackInDatabase,
  openMailtoFallback
};
