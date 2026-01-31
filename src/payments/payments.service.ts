import { Injectable, NotFoundException, BadRequestException, ConflictException, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import Stripe from 'stripe';
import { PaymentStatus, NotificationType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { InAppNotificationsService } from '../notifications/in-app-notifications.service';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    @Inject(forwardRef(() => InAppNotificationsService))
    private notificationsService: InAppNotificationsService,
  ) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is required');
    }
    this.stripe = new Stripe(secretKey, { apiVersion: '2023-10-16' });
  }

  async createPaymentIntent(
    salonId: string,
    userId: string,
    createDto: CreatePaymentIntentDto,
  ) {
    const currency = (createDto.currency || 'usd').toLowerCase();
    const supportedCurrencies = ['usd', 'eur', 'gbp'];

    if (!supportedCurrencies.includes(currency)) {
      throw new BadRequestException({
        code: 'UNSUPPORTED_CURRENCY',
        message: `Currency '${currency}' is not supported. Supported currencies: ${supportedCurrencies.join(', ')}`,
      });
    }

    if (createDto.appointmentId) {
      const appointment = await this.prisma.appointment.findFirst({
        where: {
          id: createDto.appointmentId,
          salonId,
        },
      });

      if (!appointment) {
        throw new NotFoundException('Appointment not found');
      }

      const existingPayment = await this.prisma.payment.findFirst({
        where: {
          appointmentId: createDto.appointmentId,
          status: {
            in: [PaymentStatus.PENDING, PaymentStatus.PROCESSING, PaymentStatus.SUCCEEDED],
          },
        },
      });

      if (existingPayment) {
        throw new ConflictException({
          code: 'PAYMENT_ALREADY_EXISTS',
          message: 'Payment already exists for this appointment',
        });
      }
    }

    const amountInCents = Math.round(createDto.amount * 100);

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amountInCents,
      currency,
      metadata: {
        salonId,
        userId,
        appointmentId: createDto.appointmentId || '',
        ...createDto.metadata,
      },
    });

    const payment = await this.prisma.payment.create({
      data: {
        salonId,
        appointmentId: createDto.appointmentId,
        amount: new Decimal(createDto.amount),
        currency,
        status: PaymentStatus.PENDING,
        stripePaymentIntentId: paymentIntent.id,
        stripeClientSecret: paymentIntent.client_secret,
        metadata: createDto.metadata || {},
      },
    });

    return {
      paymentId: payment.id,
      clientSecret: paymentIntent.client_secret,
      amount: Number(payment.amount),
      currency: payment.currency,
      status: 'PENDING',
    };
  }

  async confirmPayment(salonId: string, confirmDto: ConfirmPaymentDto) {
    const payment = await this.prisma.payment.findFirst({
      where: {
        stripePaymentIntentId: confirmDto.paymentIntentId,
        salonId,
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    const paymentIntent = await this.stripe.paymentIntents.retrieve(
      confirmDto.paymentIntentId,
    );

    let status: PaymentStatus = PaymentStatus.PENDING;

    if (paymentIntent.status === 'succeeded') {
      status = PaymentStatus.SUCCEEDED;
    } else if (paymentIntent.status === 'processing') {
      status = PaymentStatus.PROCESSING;
    } else if (paymentIntent.status === 'requires_payment_method') {
      status = PaymentStatus.FAILED;
    }

    const updatedPayment = await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status,
        paymentMethod: paymentIntent.payment_method_types[0] || null,
      },
    });

    if (status === PaymentStatus.SUCCEEDED) {
      await this.notificationsService.createNotification({
        salonId,
        type: NotificationType.PAYMENT_SUCCEEDED,
        title: 'Payment received',
        message: `Payment of ${updatedPayment.currency.toUpperCase()} ${Number(updatedPayment.amount).toFixed(2)} received`,
        entityId: updatedPayment.id,
      });
    }

    return {
      ...updatedPayment,
      amount: Number(updatedPayment.amount),
      appointmentId: updatedPayment.appointmentId || undefined,
      saleId: updatedPayment.saleId || undefined,
      paymentMethod: updatedPayment.paymentMethod || undefined,
      stripePaymentIntentId: updatedPayment.stripePaymentIntentId || undefined,
    };
  }
}
