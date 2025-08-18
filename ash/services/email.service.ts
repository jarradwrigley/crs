interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  static async sendAdminInvite(
    email: string,
    inviteCode: string,
    createdBy: string
  ): Promise<void> {
    // Implement your email service here (SendGrid, AWS SES, etc.)
    const emailOptions: EmailOptions = {
      to: email,
      subject: "Admin Account Invitation",
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <h2 style="color: #2563eb;">Admin Account Invitation</h2>
          <p>You've been invited to create an admin account.</p>
          <p><strong>Invite Code:</strong> <code style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px;">${inviteCode}</code></p>
          <p>This invitation was created by: ${createdBy}</p>
          <p>Click the link below to register:</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/register?invite=${inviteCode}" 
             style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Create Admin Account
          </a>
          <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
            This invitation will expire in 7 days. If you didn't expect this invitation, please ignore this email.
          </p>
        </div>
      `,
    };

    // Implement actual email sending logic here
    console.log("Sending admin invite email:", emailOptions);
  }

  static async sendWelcomeEmail(
    email: string,
    username: string,
    role: string
  ): Promise<void> {
    const emailOptions: EmailOptions = {
      to: email,
      subject: "Welcome to Admin Portal",
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <h2 style="color: #059669;">Welcome to the Admin Portal!</h2>
          <p>Hello ${username},</p>
          <p>Your admin account has been successfully created with <strong>${role}</strong> privileges.</p>
          <p>You can now access the admin dashboard to manage user verifications and system settings.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/login" 
             style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Access Admin Dashboard
          </a>
          <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
            Keep your login credentials secure and do not share them with anyone.
          </p>
        </div>
      `,
    };

    console.log("Sending welcome email:", emailOptions);
  }
}
