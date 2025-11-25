// const useTwilio = !!process.env.TWILIO_SID;

// if (useTwilio) {
//   const twilio = require('twilio')(
//     process.env.TWILIO_SID,
//     process.env.TWILIO_AUTH_TOKEN
//   );
//   module.exports.sendSMS = async (to, body) => {
//     return twilio.messages.create({
//       body,
//       from: process.env.TWILIO_PHONE_NUMBER,
//       to, // e.g. +919xxxxxxxxx
//     });
//   };
// } else {
//   module.exports.sendSMS = async (to, body) => {
//     console.log(`SMS to ${to}: ${body}`);
//     return Promise.resolve({ sid: 'dev-logged' });
//   };
// }

exports.sendSMS = async (phone, message) => {
  console.log(`SMS to ${phone}: ${message}`);
  return true;
};