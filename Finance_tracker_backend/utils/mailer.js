const nodemailer = require("nodemailer");
const logger = require("./logger");
const CONFIG = require("../config/config");

const transporter = nodemailer.createTransport({
  host: CONFIG.email.host,
  port: CONFIG.email.port,
  secure: CONFIG.email.port === 465,
  auth: {
    user: CONFIG.email.user,
    pass: CONFIG.email.pass,
  },
});

const sendMail = async ({ to, subject, html }) => {
  //skip send email as the email may not be valid
  if (CONFIG.isTest) {
    logger.info(`📧 Testing: Email would be sent to: ${to}`);
    return true;
  }
  return transporter.sendMail({
    from: CONFIG.email.user,
    to,
    subject,
    html,
  });
};

module.exports = { sendMail };
