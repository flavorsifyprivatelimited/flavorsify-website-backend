import nodemailer from "nodemailer";
import { env } from "../config/env.js";

export async function sendEnquiryEmail(enquiry) {
  if (!env.SMTP_USER || !env.SMTP_APP_PASSWORD) {
    console.warn(
      "Email notification skipped: SMTP credentials are not configured."
    );
    return;
  }

  /*
   * Gmail SMTP
   *
   * Port 587 uses STARTTLS.
   * We explicitly configure the connection instead of
   * using Nodemailer's `service: "gmail"` shortcut.
   */
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,

    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_APP_PASSWORD,
    },

    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000,
  });

  const submittedAt = enquiry.createdAt
    ? new Date(enquiry.createdAt).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
      })
    : new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
      });

  await transporter.sendMail({
    from: `"Flavorsify Website" <${env.SMTP_USER}>`,

    to: env.ENQUIRY_NOTIFY_EMAIL,

    replyTo: enquiry.email,

    subject: `New Website Enquiry: ${
      enquiry.product || "General Enquiry"
    }`,

    text: `
A new enquiry has been submitted through the Flavorsify website.

Name: ${enquiry.name}
Company: ${enquiry.company || "Not provided"}
Email: ${enquiry.email}
Phone: ${enquiry.phone}
Product: ${enquiry.product || "Not specified"}
Quantity: ${enquiry.quantity || "Not specified"}

Message:
${enquiry.message}

Received: ${submittedAt}
Enquiry ID: ${enquiry._id}
    `.trim(),
  });

  console.log(
    `Enquiry email notification sent for ${enquiry._id}`
  );
}
