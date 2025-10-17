import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailNotificationData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface NotificationEmailData {
  userName: string;
  notificationTitle: string;
  notificationMessage: string;
  mangaTitle?: string;
  chapterTitle?: string;
  appUrl: string;
}

/**
 * Send a notification email to a user
 */
export async function sendNotificationEmail(
  email: string,
  data: NotificationEmailData
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured");
      return { success: false, error: "Email service not configured" };
    }

    const { data: result, error } = await resend.emails.send({
      from: "MangaTrack <onboarding@resend.dev>", // Using Resend's default domain for testing
      to: [email],
      subject: data.notificationTitle,
      html: generateNotificationEmailHTML(data),
      text: generateNotificationEmailText(data),
    });

    if (error) {
      console.error("Failed to send email:", error);
      return { success: false, error: error.message };
    }

    console.log("Email sent successfully:", result?.id);
    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Generate HTML email template for notifications
 */
function generateNotificationEmailHTML(data: NotificationEmailData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${data.notificationTitle}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8f9fa;
        }
        .container {
          background: white;
          border-radius: 8px;
          padding: 30px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
         .header {
           text-align: center;
           margin-bottom: 30px;
           background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
           color: white;
           padding: 20px;
           border-radius: 12px;
           margin: -30px -30px 30px -30px;
         }
         .logo {
           font-size: 28px;
           font-weight: bold;
           color: white;
           margin-bottom: 10px;
           text-shadow: 0 2px 4px rgba(0,0,0,0.3);
         }
         .notification {
           background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
           border-left: 6px solid #f59e0b;
           padding: 20px;
           margin: 20px 0;
           border-radius: 8px;
           box-shadow: 0 2px 8px rgba(0,0,0,0.1);
         }
         .notification-title {
           font-size: 20px;
           font-weight: 700;
           margin-bottom: 10px;
           color: #1e40af;
           text-shadow: 0 1px 2px rgba(0,0,0,0.1);
         }
        .notification-message {
          color: #64748b;
          margin-bottom: 15px;
        }
         .manga-info {
           background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
           border: 2px solid #f59e0b;
           border-radius: 12px;
           padding: 20px;
           margin: 20px 0;
           box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
           position: relative;
           overflow: hidden;
         }
         .manga-info::before {
           content: "✨";
           position: absolute;
           top: 10px;
           right: 15px;
           font-size: 20px;
           opacity: 0.6;
         }
         .manga-title {
           font-weight: 700;
           color: #92400e;
           font-size: 18px;
           text-shadow: 0 1px 2px rgba(0,0,0,0.1);
         }
         .chapter-title {
           color: #a16207;
           font-size: 16px;
           margin-top: 8px;
           font-weight: 500;
         }
         .cta-button {
           display: inline-block;
           background: #2563eb;
           color: white !important;
           padding: 12px 24px;
           text-decoration: none;
           border-radius: 6px;
           font-weight: 500;
           margin: 20px 0;
           box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
           transition: all 0.3s ease;
         }
         .cta-button:hover {
           background: #1d4ed8;
           transform: translateY(-2px);
           box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4);
         }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
          text-align: center;
          color: #64748b;
          font-size: 14px;
        }
        .unsubscribe {
          margin-top: 15px;
          font-size: 12px;
        }
        .unsubscribe a {
          color: #64748b;
        }
      </style>
    </head>
    <body>
      <div class="container">
         <div class="header">
           <div class="logo">🎌 MangaTrack</div>
           <p>🌟 Your ultimate manga reading companion</p>
         </div>

        <p>Hey there, ${data.userName}! 👋</p>

        <div class="notification">
          <div class="notification-title">${data.notificationTitle}</div>
          <div class="notification-message">${data.notificationMessage}</div>
        </div>

        ${
          data.mangaTitle
            ? `
           <div class="manga-info">
             <div class="manga-title">📚 ${data.mangaTitle}</div>
             ${
               data.chapterTitle
                 ? `<div class="chapter-title">📖 Chapter: ${data.chapterTitle}</div>`
                 : ""
             }
           </div>
        `
            : ""
        }

        <div style="text-align: center;">
          <a href="${data.appUrl}" class="cta-button">🚀 Start Reading Now!</a>
        </div>

        <div class="footer">
          <p>This email was sent because you have email notifications enabled.</p>
          <div class="unsubscribe">
            <a href="${
              data.appUrl
            }/settings">Manage your notification preferences</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate plain text email for notifications
 */
function generateNotificationEmailText(data: NotificationEmailData): string {
  return `
MangaTrack Notification

Hi ${data.userName},

${data.notificationTitle}

${data.notificationMessage}

${data.mangaTitle ? `Manga: ${data.mangaTitle}` : ""}
${data.chapterTitle ? `Chapter: ${data.chapterTitle}` : ""}

Open MangaTrack: ${data.appUrl}

---
This email was sent because you have email notifications enabled.
Manage your preferences: ${data.appUrl}/settings
  `.trim();
}

/**
 * Send a test email to verify the email service is working
 */
export async function sendTestEmail(
  email: string
): Promise<{ success: boolean; error?: string }> {
  return sendNotificationEmail(email, {
    userName: "Test User",
    notificationTitle: "Test Email from MangaTrack",
    notificationMessage:
      "This is a test email to verify that the email service is working correctly.",
    appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  });
}
