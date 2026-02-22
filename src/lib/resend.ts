// /lib/resend.ts
import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
export const resend = apiKey ? new Resend(apiKey) : null;

// Email data interface
interface EmailData {
  to: string;
  subject: string;
  html: string;
  from?: string;
  cc?: string[];
  bcc?: string[];
  replyTo?: string;
  text?: string;
}

// Post interface for email notifications
interface PostData {
  content: string;
  platform: string;
  user: {
    email: string;
    name?: string;
  };
  publishedAt?: string;
  id?: string;
}

// Generic email sending function
export async function sendEmail(data: EmailData) {
  if (!resend) {
    throw new Error('Email service not configured. Set RESEND_API_KEY.');
  }
  return await resend.emails.send({
    from: data.from || "noreply@goviral.com",
    to: data.to,
    subject: data.subject,
    html: data.html,
    ...(data.cc && { cc: data.cc }),
    ...(data.bcc && { bcc: data.bcc }),
    ...(data.replyTo && { replyTo: data.replyTo }),
    ...(data.text && { text: data.text }),
  });
}

// Email notification helper function
export async function sendPostPublishedEmail(post: PostData) {
  const emailData: EmailData = {
    to: post.user.email,
    subject: `Your post was published`,
    html: `<p>Hello ${post.user.name || 'there'},</p>
           <p>Your post "${post.content.slice(0, 50)}..." was successfully published on ${post.platform}!</p>
           ${post.publishedAt ? `<p>Published at: ${new Date(post.publishedAt).toLocaleString()}</p>` : ''}
           <p>Thank you for using GoViral!</p>`,
  };

  return await sendEmail(emailData);
}