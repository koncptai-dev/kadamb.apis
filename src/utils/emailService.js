const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

exports.sendResetEmail = async (email, code) => {
  await transporter.sendMail({
    to: email,
    subject: 'Password Reset Code',
    text: `Your password reset code is: ${code}`,
  });
};
