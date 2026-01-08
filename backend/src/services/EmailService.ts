import { Resend } from 'resend';
import { MemberRole } from '../types/timeline';

interface InvitationEmailData {
  to: string;
  inviterName: string;
  timelineName: string;
  role: MemberRole;
  inviteLink: string;
}

export class EmailService {
  private resend: Resend | null = null;
  private frontendUrl: string;
  private fromAddress: string;

  constructor() {
    this.frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    this.fromAddress = process.env.EMAIL_FROM || 'Festival Timeline <onboarding@resend.dev>';
    this.initializeResend();
  }

  private initializeResend(): void {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      console.warn('EmailService: No RESEND_API_KEY configured. Emails will be logged but not sent.');
      return;
    }

    this.resend = new Resend(apiKey);
    console.log('EmailService: Resend initialized successfully');
  }

  /**
   * Generate the invitation URL
   */
  generateInviteLink(token: string): string {
    return `${this.frontendUrl}/invite/${token}`;
  }

  /**
   * Send an invitation email
   */
  async sendInvitation(data: InvitationEmailData): Promise<boolean> {
    const { to, inviterName, timelineName, role, inviteLink } = data;

    const subject = `You've been invited to collaborate on "${timelineName}"`;

    const textContent = this.generateTextEmail(inviterName, timelineName, role, inviteLink);
    const htmlContent = this.generateHtmlEmail(inviterName, timelineName, role, inviteLink);

    // If no Resend client, log the email for development
    if (!this.resend) {
      console.log('==== EMAIL (DEV MODE - NOT SENT) ====');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Invite Link: ${inviteLink}`);
      console.log('=====================================');
      return true;
    }

    try {
      const { data: result, error } = await this.resend.emails.send({
        from: this.fromAddress,
        to: [to],
        subject,
        text: textContent,
        html: htmlContent,
      });

      if (error) {
        console.error('Failed to send invitation email:', error);
        return false;
      }

      console.log(`Invitation email sent to ${to}. Message ID: ${result?.id}`);
      return true;
    } catch (error) {
      console.error('Failed to send invitation email:', error);
      return false;
    }
  }

  private generateTextEmail(
    inviterName: string,
    timelineName: string,
    role: MemberRole,
    inviteLink: string
  ): string {
    return `Hi,

${inviterName} has invited you to join "${timelineName}" as ${this.formatRole(role)}.

Click the link below to accept the invitation:
${inviteLink}

This invitation expires in 7 days.

If you don't recognize this invitation, you can safely ignore this email.

— The Festival Timeline Team`;
  }

  private generateHtmlEmail(
    inviterName: string,
    timelineName: string,
    role: MemberRole,
    inviteLink: string
  ): string {
    // Using inline styles for maximum email client compatibility
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>Timeline Invitation</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
  <div style="background-color: #f3f4f6; border-radius: 12px; padding: 32px;">
    <div style="text-align: center; margin-bottom: 24px;">
      <h1 style="color: #111827; font-size: 28px; font-weight: 700; margin: 0;">Timeline Invitation</h1>
    </div>
    <div style="background-color: #ffffff; border-radius: 8px; padding: 28px; margin-bottom: 24px; border: 1px solid #e5e7eb;">
      <p style="margin: 0 0 16px 0; color: #374151; font-size: 16px;">Hi,</p>
      <p style="margin: 0 0 16px 0; color: #374151; font-size: 16px;"><strong style="color: #111827;">${this.escapeHtml(inviterName)}</strong> has invited you to join:</p>
      <p style="font-size: 22px; font-weight: 700; color: #111827; margin: 0 0 20px 0;">
        "${this.escapeHtml(timelineName)}"
      </p>
      <p style="margin: 0 0 24px 0; color: #374151; font-size: 16px;">
        Your role: <span style="display: inline-block; padding: 6px 14px; border-radius: 20px; font-size: 14px; font-weight: 600; background-color: #dbeafe; color: #1e40af;">${this.formatRole(role)}</span>
      </p>
      <div style="text-align: center; margin: 28px 0;">
        <!--[if mso]>
        <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${inviteLink}" style="height:48px;v-text-anchor:middle;width:220px;" arcsize="10%" stroke="f" fillcolor="#2563eb">
          <w:anchorlock/>
          <center style="color:#ffffff;font-family:sans-serif;font-size:16px;font-weight:bold;">Accept Invitation</center>
        </v:roundrect>
        <![endif]-->
        <!--[if !mso]><!-->
        <a href="${inviteLink}" target="_blank" style="display: inline-block; padding: 14px 36px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.3);">Accept Invitation</a>
        <!--<![endif]-->
      </div>
      <p style="color: #6b7280; font-size: 13px; margin: 20px 0 0 0; text-align: center;">This invitation expires in 7 days.</p>
    </div>
    <div style="text-align: center; font-size: 14px; color: #6b7280;">
      <p style="margin: 0 0 8px 0;">If you don't recognize this invitation, you can safely ignore this email.</p>
      <p style="margin: 0; color: #9ca3af;">— The Festival Timeline Team</p>
    </div>
  </div>
</body>
</html>`;
  }

  private formatRole(role: MemberRole): string {
    switch (role) {
      case 'Admin':
        return 'an Admin';
      case 'Editor':
        return 'an Editor';
      case 'Viewer':
        return 'a Viewer';
      default:
        return role;
    }
  }

  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, char => map[char]);
  }

  /**
   * Verify the Resend connection (useful for health checks)
   */
  async verifyConnection(): Promise<boolean> {
    if (!this.resend) {
      return false;
    }
    // Resend doesn't have a verify method, but we can check if the client exists
    return true;
  }
}

export default new EmailService();
