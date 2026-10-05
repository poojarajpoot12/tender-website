// cron/dailyAlerts.js
const cron = require('node-cron');
const User = require('../models/User');
const { sendWhatsAppMessage } = require('../services/whatsappService');

// Dummy function to represent tender search from DB
const getMatchingTendersForUser = async (preferences) => {
  // Real DB Query on Tender Collection using preferences.locations & preferences.keywords
  return [
    { title: 'Supply of IT Hardware', location: 'Delhi', deadline: '30-Sept-2026' },
    { title: 'Hospital Beds Procurement', location: 'Karnataka', deadline: '05-Oct-2026' }
  ];
};

const initDailyCron = () => {
  // Cron expression for 8:00 AM every day -> '0 8 * * *'
  cron.schedule('0 8 * * *', async () => {
    console.log('Running daily 8:00 AM WhatsApp alert job...');
    
    try {
      const users = await User.find({
        whatsappAlertsEnabled: true,
        mobileNumber: { $ne: '' }
      });

      for (let user of users) {
        const tenders = await getMatchingTendersForUser(user.alertPreferences);
        
        if (tenders.length > 0) {
          let msg = `*Good Morning ${user.email.split('@')[0]}!* 🌅\nHere are your daily matching tenders:\n\n`;
          tenders.forEach((t, i) => {
            msg += `${i + 1}. *${t.title}*\n📍 Location: ${t.location}\n⏰ Closing: ${t.deadline}\n\n`;
          });
          msg += `Log in to BidEasy to view full details.`;

          await sendWhatsAppMessage(user.mobileNumber, msg);
        }
      }
    } catch (error) {
      console.error('Error in daily WhatsApp cron:', error);
    }
  });
};

module.exports = initDailyCron;