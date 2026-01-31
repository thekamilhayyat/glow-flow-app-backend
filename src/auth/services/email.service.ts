import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const smtpHost = this.configService.get<string>('SMTP_HOST');
    const smtpPort = this.configService.get<number>('SMTP_PORT');
    const smtpUser = this.configService.get<string>('SMTP_USER');
    const smtpPass = this.configService.get<string>('SMTP_PASS');

    if (smtpHost && smtpPort && smtpUser && smtpPass) {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
    }
  }

  /**
   * Send verification email with timeout protection.
   * This method NEVER throws - it always returns a result.
   * Used in fire-and-forget pattern to avoid blocking requests.
   * HARD TIMEOUT: Maximum 3 seconds - will abort after that.
   */
  async sendVerificationEmail(email: string, token: string, firstName?: string): Promise<{ sent: boolean; reason?: string }> {
    const isDevelopment = this.configService.get<string>('NODE_ENV') === 'development';

    // Check if SMTP is configured - exit early if not
    const transporter = this.transporter;
    if (!transporter) {
      if (isDevelopment) {
        console.warn('[EmailService] Verification email skipped (SMTP not configured)');
      }
      return Promise.resolve({ sent: false, reason: 'Email service not configured' });
    }

    // Wrap entire email sending in timeout protection
    return new Promise((resolve) => {
      // HARD TIMEOUT: Resolve after 3 seconds no matter what
      const timeoutId = setTimeout(() => {
        if (isDevelopment) {
          console.warn('[EmailService] Email send timeout after 3 seconds - aborting');
        }
        resolve({ sent: false, reason: 'Email send timeout after 3 seconds' });
      }, 3000);

      // Prepare email content
      const appUrl = this.configService.get<string>('APP_URL') || 'http://localhost:3000';
      const verificationUrl = `${appUrl}/verify-email?token=${token}`;
      const from = this.configService.get<string>('SMTP_FROM') || 'noreply@glowflow.com';

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Email</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #007bff;">Welcome to Glow Flow!</h1>
              <p>Hi ${firstName || 'there'},</p>
              <p>Thank you for signing up! Please verify your email address by clicking the button below:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" 
                   style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  Verify Email Address
                </a>
              </div>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
              <p>This link will expire in 30 minutes.</p>
              <p>If you didn't create an account, please ignore this email.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              <p style="color: #666; font-size: 12px;">© ${new Date().getFullYear()} Glow Flow. All rights reserved.</p>
            </div>
          </body>
        </html>
      `;

      // Send email with timeout protection
      // Use local variable 'transporter' which TypeScript knows is not null
      transporter.sendMail({
        from,
        to: email,
        subject: 'Verify Your Email Address - Glow Flow',
        html,
      })
        .then(() => {
          clearTimeout(timeoutId);
          if (isDevelopment) {
            console.log('[EmailService] Verification email sent successfully');
          }
          resolve({ sent: true });
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          if (isDevelopment) {
            console.warn(`[EmailService] Verification email failed but signup completed: ${errorMessage}`);
          }
          resolve({ sent: false, reason: errorMessage });
        });
    });
  }
}
