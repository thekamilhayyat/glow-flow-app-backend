import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CurrentSalon } from '../common/decorators/current-salon.decorator';
import { SuccessResponseDto } from '../common/dto/success-response.dto';

@ApiTags('Payments')
@Controller('payments')
@ApiBearerAuth()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-intent')
  @ApiOperation({ summary: 'Create payment intent' })
  @ApiResponse({ status: 201, type: PaymentResponseDto })
  async createPaymentIntent(
    @CurrentSalon() salonId: string,
    @CurrentUser() user: any,
    @Body() createDto: CreatePaymentIntentDto,
  ): Promise<SuccessResponseDto<any>> {
    const result = await this.paymentsService.createPaymentIntent(
      salonId,
      user.userId,
      createDto,
    );
    return { data: result };
  }

  @Post('confirm')
  @ApiOperation({ summary: 'Confirm payment' })
  @ApiResponse({ status: 200, type: PaymentResponseDto })
  async confirmPayment(
    @CurrentSalon() salonId: string,
    @Body() confirmDto: ConfirmPaymentDto,
  ): Promise<SuccessResponseDto<PaymentResponseDto>> {
    const result = await this.paymentsService.confirmPayment(salonId, confirmDto);
    return { data: result };
  }
}
