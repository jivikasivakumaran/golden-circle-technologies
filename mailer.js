/**
 * mailer.js
 * Nodemailer setup using Gmail SMTP
 */

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gsmtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,   // your gmail
    pass: process.env.GMAIL_PASS    // your gmail app password
  }
});

// Verify connection on startup
transporter.verify((err, success) => {
  if (err) console.error('❌ Mailer error:', err.message);
  else console.log('✅ Mailer ready');
});

// ── 1. Email to USER who filled the form ─────────────────────────────────────
const sendUserEmail = (to, firstName, service) => {
  return transporter.sendMail({
    from: `"GoldenCircle Technologies" <${process.env.GMAIL_USER}>`,
    to,
    subject: 'Thank you for contacting GoldenCircle Technologies!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
      </head>
      <body style="margin:0;padding:0;background:#080808;font-family:'Segoe UI',sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#080808;padding:40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background:#141414;border:1px solid rgba(212,168,39,0.2);border-radius:4px;overflow:hidden;max-width:600px;width:100%;">
                
                <!-- Header -->
                <tr>
                  <td style="background:#0f0f0f;padding:32px 40px;border-bottom:2px solid #D4A827;text-align:center;">
                    <h1 style="margin:0;font-family:Georgia,serif;font-size:28px;font-weight:400;background:linear-gradient(180deg,#f9e090,#c8891a,#f0c040,#7a4e0e,#e8b830);-webkit-background-clip:text;-webkit-text-fill-color:transparent;color:#D4A827;">
                      GoldenCircle Technologies
                    </h1>
                    <p style="margin:6px 0 0;font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#7a7060;">Ideas That Run</p>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:40px;">
                    <p style="color:#D4A827;font-size:11px;letter-spacing:3px;text-transform:uppercase;margin:0 0 16px;">Message Received</p>
                    <h2 style="color:#e8e2d5;font-family:Georgia,serif;font-size:26px;font-weight:300;margin:0 0 20px;">
                      Thank you, ${firstName}!
                    </h2>
                    <p style="color:#9a9080;font-size:15px;line-height:1.8;margin:0 0 20px;">
                      We've received your enquiry${service ? ` about <strong style="color:#D4A827;">${service}</strong>` : ''} and our team will get back to you within <strong style="color:#e8e2d5;">24 business hours</strong>.
                    </p>
                    <p style="color:#9a9080;font-size:15px;line-height:1.8;margin:0 0 32px;">
                      While you wait, feel free to explore our services or connect with us on social media.
                    </p>

                    <!-- Divider -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
                      <tr>
                        <td style="border-top:1px solid rgba(212,168,39,0.2);"></td>
                      </tr>
                    </table>

                    <!-- Contact Info -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:0 0 12px;">
                          <span style="color:#7a7060;font-size:12px;letter-spacing:1px;text-transform:uppercase;">Phone</span><br/>
                          <a href="tel:+919597324637" style="color:#D4A827;text-decoration:none;font-size:14px;">+91 95973 24637</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:0 0 12px;">
                          <span style="color:#7a7060;font-size:12px;letter-spacing:1px;text-transform:uppercase;">Email</span><br/>
                          <a href="mailto:goldencircletechnologies123@gmail.com" style="color:#D4A827;text-decoration:none;font-size:14px;">goldencircletechnologies123@gmail.com</a>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <span style="color:#7a7060;font-size:12px;letter-spacing:1px;text-transform:uppercase;">Location</span><br/>
                          <span style="color:#e8e2d5;font-size:14px;">Kanyakumari, Tamil Nadu, India</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background:#0f0f0f;padding:24px 40px;border-top:1px solid rgba(212,168,39,0.15);text-align:center;">
                    <p style="color:#5a5040;font-size:12px;margin:0;">
                      © 2025 GoldenCircle Technologies · Kanyakumari, India
                    </p>
                    <p style="color:#5a5040;font-size:11px;margin:8px 0 0;">
                      This is an automated confirmation email. Please do not reply to this email.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  });
};

// ── 2. Notification email to ADMIN (you) ─────────────────────────────────────
const sendAdminEmail = (data) => {
  return transporter.sendMail({
    from: `"GoldenCircle Form" <${process.env.GMAIL_USER}>`,
    to: process.env.GMAIL_USER,
    replyTo: data.email,
    subject: `🔔 New Contact Form Submission — ${data.firstName} ${data.lastName || ''}`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;background:#080808;font-family:'Segoe UI',sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#080808;padding:40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background:#141414;border:1px solid rgba(212,168,39,0.2);border-radius:4px;max-width:600px;width:100%;">

                <!-- Header -->
                <tr>
                  <td style="background:#0f0f0f;padding:24px 40px;border-bottom:2px solid #D4A827;">
                    <h2 style="margin:0;color:#D4A827;font-family:Georgia,serif;font-weight:400;font-size:22px;">
                      🔔 New Form Submission
                    </h2>
                    <p style="margin:4px 0 0;color:#7a7060;font-size:12px;">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</p>
                  </td>
                </tr>

                <!-- Details -->
                <tr>
                  <td style="padding:32px 40px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      ${[
                        ['Name',    `${data.firstName} ${data.lastName || ''}`],
                        ['Email',   `<a href="mailto:${data.email}" style="color:#D4A827;">${data.email}</a>`],
                        ['Phone',   data.phone   || '—'],
                        ['Company', data.company || '—'],
                        ['Service', data.service || '—'],
                      ].map(([label, value]) => `
                        <tr>
                          <td style="padding:10px 0;border-bottom:1px solid rgba(212,168,39,0.1);width:120px;vertical-align:top;">
                            <span style="color:#7a7060;font-size:11px;letter-spacing:1px;text-transform:uppercase;">${label}</span>
                          </td>
                          <td style="padding:10px 0 10px 16px;border-bottom:1px solid rgba(212,168,39,0.1);">
                            <span style="color:#e8e2d5;font-size:14px;">${value}</span>
                          </td>
                        </tr>
                      `).join('')}
                      <tr>
                        <td style="padding:16px 0 0;vertical-align:top;">
                          <span style="color:#7a7060;font-size:11px;letter-spacing:1px;text-transform:uppercase;">Message</span>
                        </td>
                        <td style="padding:16px 0 0 16px;">
                          <p style="margin:0;color:#e8e2d5;font-size:14px;line-height:1.7;background:#0f0f0f;padding:16px;border-left:3px solid #D4A827;border-radius:2px;">
                            ${data.message || '—'}
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- CTA -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px;">
                      <tr>
                        <td>
                          <a href="mailto:${data.email}" style="display:inline-block;background:#D4A827;color:#080808;text-decoration:none;padding:12px 28px;font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:600;border-radius:2px;">
                            Reply to ${data.firstName}
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background:#0f0f0f;padding:20px 40px;border-top:1px solid rgba(212,168,39,0.15);text-align:center;">
                    <p style="color:#5a5040;font-size:12px;margin:0;">GoldenCircle Technologies Admin Notification</p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  });
};

module.exports = { sendUserEmail, sendAdminEmail };