import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

export async function sendEnquiryEmail(enquiry) {
  if (!env.SMTP_USER || !env.SMTP_APP_PASSWORD) {
    console.warn('Email notification skipped: SMTP credentials are not configured.');
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_APP_PASSWORD,
    },
  });

  const submittedAt = enquiry.createdAt
    ? new Date(enquiry.createdAt).toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
      })
    : new Date().toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
      });

  await transporter.sendMail({
    from: `"Flavorsify Website" <${env.SMTP_USER}>`,
    to: env.ENQUIRY_NOTIFY_EMAIL,
    replyTo: enquiry.email,
    subject: `New Website Enquiry: ${enquiry.product || 'General Enquiry'}`,
    text: `
A new enquiry has been submitted through the Flavorsify website.

Name: ${enquiry.name}
Company: ${enquiry.company || 'Not provided'}
Email: ${enquiry.email}
Phone: ${enquiry.phone}
Product: ${enquiry.product || 'Not specified'}
Quantity: ${enquiry.quantity || 'Not specified'}

Message:
${enquiry.message}

Received: ${submittedAt}
Enquiry ID: ${enquiry._id}
    `.trim(),
  });

  console.log(`Enquiry email notification sent for ${enquiry._id}`);
}