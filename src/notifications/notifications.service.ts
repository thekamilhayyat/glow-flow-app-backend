import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as nodemailer from 'nodemailer';
import twilio from 'twilio';

@Injectable()
export class NotificationsService {
  private emailTransporter: nodemailer.Transporter | null = null;
  private twilioClient: twilio.Twilio | null = null;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.initializeEmail();
    this.initializeSms();
  }

  private initializeEmail() {
    const smtpHost = this.configService.get<string>('SMTP_HOST');
    const smtpPort = this.configService.get<number>('SMTP_PORT');
    const smtpUser = this.configService.get<string>('SMTP_USER');
    const smtpPass = this.configService.get<string>('SMTP_PASS');

    if (smtpHost && smtpPort && smtpUser && smtpPass) {
      this.emailTransporter = nodemailer.createTransport({
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

  private initializeSms() {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');

    if (accountSid && authToken) {
      this.twilioClient = twilio(accountSid, authToken);
    }
  }

  async getNotificationSettings(salonId: string) {
    const settings = await this.prisma.salonSettings.findUnique({
      where: { salonId },
      select: {
        emailNotifications: true,
        smsNotifications: true,
        businessEmail: true,
        businessPhone: true,
      },
    });

    return settings;
  }

  async sendEmail(
    salonId: string,
    to: string,
    subject: string,
    html: string,
    notificationType: string,
  ) {
    const settings = await this.getNotificationSettings(salonId);

    if (!settings?.emailNotifications) {
      return { sent: false, reason: 'Email notifications not configured' };
    }

    const emailSettings = settings.emailNotifications as any;
    if (emailSettings[notificationType] === false) {
      return { sent: false, reason: 'Notification type disabled' };
    }

    if (!this.emailTransporter) {
      return { sent: false, reason: 'Email service not configured' };
    }

    try {
      const from = this.configService.get<string>('SMTP_FROM') || settings.businessEmail || 'noreply@glowflow.com';

      await this.emailTransporter.sendMail({
        from,
        to,
        subject,
        html,
      });

      return { sent: true };
    } catch (error) {
      return { sent: false, reason: error.message };
    }
  }

  async sendSms(
    salonId: string,
    to: string,
    message: string,
    notificationType: string,
  ) {
    const settings = await this.getNotificationSettings(salonId);

    if (!settings?.smsNotifications) {
      return { sent: false, reason: 'SMS notifications not configured' };
    }

    const smsSettings = settings.smsNotifications as any;
    if (smsSettings[notificationType] === false) {
      return { sent: false, reason: 'Notification type disabled' };
    }

    if (!this.twilioClient) {
      return { sent: false, reason: 'SMS service not configured' };
    }

    try {
      const from = this.configService.get<string>('TWILIO_PHONE_NUMBER');
      if (!from) {
        return { sent: false, reason: 'Twilio phone number not configured' };
      }

      await this.twilioClient.messages.create({
        body: message,
        from,
        to,
      });

      return { sent: true };
    } catch (error) {
      return { sent: false, reason: error.message };
    }
  }

  async notifyBookingCreated(salonId: string, appointmentId: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        client: true,
        salon: {
          include: { settings: true },
        },
      },
    });

    if (!appointment) {
      return;
    }

    const client = appointment.client;
    const salon = appointment.salon;

    if (client.email) {
      await this.sendEmail(
        salonId,
        client.email,
        'Appointment Confirmed',
        `
        <h2>Your appointment has been confirmed</h2>
        <p>Hello ${client.firstName},</p>
        <p>Your appointment at ${salon.name} has been confirmed.</p>
        <p><strong>Date:</strong> ${appointment.startTime.toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${appointment.startTime.toLocaleTimeString()}</p>
        `,
        'appointmentConfirmation',
      );
    }

    if (client.phone) {
      await this.sendSms(
        salonId,
        client.phone,
        `Your appointment at ${salon.name} is confirmed for ${appointment.startTime.toLocaleDateString()} at ${appointment.startTime.toLocaleTimeString()}`,
        'appointmentConfirmation',
      );
    }
  }

  async notifyBookingCancelled(salonId: string, appointmentId: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        client: true,
        salon: true,
      },
    });

    if (!appointment) {
      return;
    }

    const client = appointment.client;

    if (client.email) {
      await this.sendEmail(
        salonId,
        client.email,
        'Appointment Cancelled',
        `
        <h2>Appointment Cancelled</h2>
        <p>Hello ${client.firstName},</p>
        <p>Your appointment at ${appointment.salon.name} has been cancelled.</p>
        `,
        'appointmentCancellation',
      );
    }
  }

  async scheduleBookingReminder(salonId: string, appointmentId: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        client: true,
        salon: true,
      },
    });

    if (!appointment) {
      return;
    }

    const reminderTime = new Date(appointment.startTime);
    reminderTime.setHours(reminderTime.getHours() - 24);

    if (reminderTime > new Date()) {
      return { scheduled: false, reason: 'Reminder time not reached' };
    }

    const client = appointment.client;

    if (client.email) {
      await this.sendEmail(
        salonId,
        client.email,
        'Appointment Reminder',
        `
        <h2>Reminder: You have an appointment tomorrow</h2>
        <p>Hello ${client.firstName},</p>
        <p>This is a reminder that you have an appointment at ${appointment.salon.name} tomorrow.</p>
        <p><strong>Time:</strong> ${appointment.startTime.toLocaleTimeString()}</p>
        `,
        'appointmentReminder',
      );
    }

    if (client.phone) {
      await this.sendSms(
        salonId,
        client.phone,
        `Reminder: You have an appointment at ${appointment.salon.name} tomorrow at ${appointment.startTime.toLocaleTimeString()}`,
        'appointmentReminder',
      );
    }

    return { scheduled: true };
  }
}
