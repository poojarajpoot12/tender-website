// services/whatsappService.js
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

const sendWhatsAppMessage = async (toMobile, messageBody) => {
  try {
    const message = await client.messages.create({
      from: 'whatsapp:+14155238886', // Twilio WhatsApp Sandbox Number
      to: `whatsapp:+91${toMobile.replace(/[^0-9]/g, '')}`,
      body: messageBody,
    });
    console.log(`WhatsApp Alert Sent to ${toMobile}: ${message.sid}`);
  } catch (error) {
    console.error(`Error sending WhatsApp to ${toMobile}:`, error);
  }
};

module.exports = { sendWhatsAppMessage };