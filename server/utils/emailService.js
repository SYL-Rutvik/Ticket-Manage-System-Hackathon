const nodemailer = require('nodemailer');

// A flexible email service that attempts to use real SMTP if provided,
// but safely falls back to standard console logging for hackathons/dev environments.
const transporterOpts = process.env.SMTP_USER ? {
  service: process.env.SMTP_SERVICE || 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
} : {
  streamTransport: true, // Use stream transport to just print to console securely
  newline: 'windows',
};

const transporter = nodemailer.createTransport(transporterOpts);

const sendCredentials = async (email, name, plainTextPassword) => {
  const mailOptions = {
    from: process.env.SMTP_FROM || '"IT Support" <no-reply@ticketsystem.local>',
    to: email,
    subject: 'Welcome to the Support Portal - Your Login Credentials',
    text: `Hello ${name},\n\nAn administrator has created an account for you.\n\nYour Login Credentials:\nEmail: ${email}\nPassword: ${plainTextPassword}\n\nPlease log in and change your password immediately from your Profile Settings.\n\nBest regards,\nIT Service Desk`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2>Welcome to the Support Portal, ${name}!</h2>
        <p>An administrator has created an account for you.</p>
        <div style="background-color: #f4f4f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Login Credentials:</strong></p>
          <p>Email: <b>${email}</b></p>
          <p>Password: <b style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${plainTextPassword}</b></p>
        </div>
        <p style="color: #ef4444; font-size: 14px;"><strong>Action Required:</strong> Please log in and change your password immediately from your Profile Settings.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
        <p style="font-size: 12px; color: #6b7280;">Best regards,<br>IT Service Desk</p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    
    // In dev mode (streamTransport), we log it to console to prove it works
    if (!process.env.SMTP_HOST) {
      console.log('=============================================');
      console.log('📬 [DEV MODE] EMAIL DISPATCHED SUCCESSFULLY');
      console.log(`To: ${email}`);
      console.log(`Password: ${plainTextPassword}`);
      console.log('=============================================');
    }
    return true;
  } catch (err) {
    console.error('Failed to send email:', err);
    return false;
  }
};

const sendTicketUpdateEmail = async (email, name, ticketId, newStatus) => {
  const mailOptions = {
    from: process.env.SMTP_FROM || '"IT Support" <no-reply@ticketsystem.local>',
    to: email,
    subject: `Update on your Support Ticket #${ticketId}`,
    text: `Hello ${name},\n\nYour support ticket #${ticketId} has been updated to: ${newStatus.toUpperCase()}.\n\nPlease log in to the portal to view the latest updates.\n\nBest regards,\nIT Service Desk`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2>Ticket Update: #${ticketId}</h2>
        <p>Hello ${name},</p>
        <div style="background-color: #f4f4f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p>The status of your support ticket has been updated to:</p>
          <p><strong style="font-size: 18px; color: #4f46e5; text-transform: uppercase;">${newStatus}</strong></p>
        </div>
        <p>Please log in to your Support Portal to view agent notes or provide additional information.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
        <p style="font-size: 12px; color: #6b7280;">Best regards,<br>IT Service Desk</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    if (!process.env.SMTP_HOST) {
      console.log('📬 [DEV] TICKET UPDATE EMAIL SENT');
      console.log(`To: ${email} | Ticket ID: ${ticketId} | Status: ${newStatus}`);
    }
    return true;
  } catch (err) {
    console.error('Failed to send ticket email:', err);
    return false;
  }
};

module.exports = { sendCredentials, sendTicketUpdateEmail };
