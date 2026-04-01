/**
 * WhatsApp Integration Service using Evolution API
 */

const EVO_API_URL = import.meta.env.VITE_EVO_API_URL;
const EVO_API_KEY = import.meta.env.VITE_EVO_API_KEY;
const EVO_INSTANCE = import.meta.env.VITE_EVO_INSTANCE;

/**
 * Formats a phone number for Evolution API
 * @param phone The raw phone number or JID
 * @returns Formatted number string or JID
 */
const formatPhoneNumber = (phone: string): string => {
  // If it's already a JID (contains @), return as is
  if (phone.includes('@')) {
    return phone;
  }
  
  const digits = phone.replace(/\D/g, '');
  // If it doesn't start with 55 (Brazil) and has 10-11 digits, prepend it
  if (digits.length >= 10 && digits.length <= 11 && !digits.startsWith('55')) {
    return `55${digits}`;
  }
  return digits;
};

/**
 * Sends a text message via Evolution API
 * @param to Recipient phone number
 * @param text Message content
 */
export const sendWhatsAppMessage = async (to: string, text: string): Promise<boolean> => {
  if (!EVO_API_URL || !EVO_API_KEY || !EVO_INSTANCE) {
    console.warn('WhatsApp service not configured. Check environment variables.');
    return false;
  }

  const formattedNumber = formatPhoneNumber(to);
  
  if (formattedNumber === 'test@s.whatsapp.net') {
    console.log('whatsappService: Skipping message to test JID.');
    return true;
  }

  const url = `${EVO_API_URL}/message/sendText/${EVO_INSTANCE}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': EVO_API_KEY,
      },
      body: JSON.stringify({
        number: formattedNumber,
        text: `${text}\u200B`, // Add Zero Width Space to prevent loops
        linkPreview: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Evolution API Error:', errorData);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to send WhatsApp message:', error);
    return false;
  }
};
