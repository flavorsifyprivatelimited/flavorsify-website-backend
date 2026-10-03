import { Resend } from "resend";
import { env } from "../config/env.js";

const resend = new Resend(env.RESEND_API_KEY);

export async function sendEnquiryEmail(enquiry) {
  const submittedAt = enquiry.createdAt
    ? new Date(enquiry.createdAt).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
      })
    : new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
      });

  const subject = `New Website Enquiry: ${
    enquiry.product || "General Enquiry"
  }`;

  const text = `
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
  `.trim();

  const { data, error } = await resend.emails.send({
    from: "Flavorsify Website <onboarding@resend.dev>",
    to: [env.ENQUIRY_NOTIFY_EMAIL],
    replyTo: enquiry.email,
    subject,
    text,
  });

  if (error) {
    console.error("Resend email notification failed:", error);

    throw new Error(
      error.message || "Failed to send enquiry email."
    );
  }

  console.log(
    `Enquiry email notification sent for ${enquiry._id}. Resend ID: ${data?.id}`
  );

  return data;
}
