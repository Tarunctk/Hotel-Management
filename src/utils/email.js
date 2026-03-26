const nodemailer = require("nodemailer");

// Create transporter
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASS
  }
});

const sendEmail = async (to, bookingCode, type) => {
  try {
    let subject = "";
    let content = "";

    if (type === "CONFIRM") {
      subject = "Booking Confirmation";
      content = `
        <h2>Booking Confirmation</h2>
        <p>Your booking is confirmed.</p>
        <p><b>Booking Code:</b> ${bookingCode}</p>
      `;
    } else if (type === "COMPLETE") {
      subject = "Thank You";
      content = `
        <h2>Thank You!</h2>
        <p>We hope you enjoyed your stay.</p>
        <p><b>Booking Code:</b> ${bookingCode}</p>
      `;
    }

    // Send email
    const info = await transporter.sendMail({
      from: `"Hotel Management" <${process.env.EMAIL_FROM}>`,
      to: to,
      subject: subject,
      html: content
    });
  } catch (err) {
    console.error(" Email error:", err);
  }
};

module.exports = sendEmail;