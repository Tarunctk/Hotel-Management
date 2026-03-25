const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  auth: {
    user: process.env.USER,
    pass: process.env.PASS
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

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      html: content
    });

    console.log("Email sent successfully");

  } catch (err) {
    console.error("Email error:", err);
  }
};

module.exports = sendEmail;