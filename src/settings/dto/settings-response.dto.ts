import { ApiProperty } from '@nestjs/swagger';

export class SettingsResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  salonId: string;

  @ApiProperty({ required: false })
  businessName?: string;

  @ApiProperty({ required: false })
  businessEmail?: string;

  @ApiProperty({ required: false })
  businessPhone?: string;

  @ApiProperty({ required: false })
  businessAddress?: string;

  @ApiProperty({ required: false })
  businessCity?: string;

  @ApiProperty({ required: false })
  businessState?: string;

  @ApiProperty({ required: false })
  businessZip?: string;

  @ApiProperty({ required: false })
  businessCountry?: string;

  @ApiProperty({ required: false })
  businessWebsite?: string;

  @ApiProperty({ required: false })
  businessLogo?: string;

  @ApiProperty({ required: false })
  businessHours?: any;

  @ApiProperty({ required: false })
  bookingAdvanceDays?: number;

  @ApiProperty({ required: false })
  bookingCancellationHours?: number;

  @ApiProperty({ required: false })
  allowOnlineBooking?: boolean;

  @ApiProperty({ required: false })
  requireConfirmation?: boolean;

  @ApiProperty({ required: false })
  autoConfirm?: boolean;

  @ApiProperty({ required: false })
  bufferTimeMinutes?: number;

  @ApiProperty({ required: false })
  taxEnabled?: boolean;

  @ApiProperty({ required: false })
  taxRate?: number;

  @ApiProperty({ required: false })
  taxIncluded?: boolean;

  @ApiProperty({ required: false })
  paymentMethods?: any;

  @ApiProperty({ required: false })
  requireDeposit?: boolean;

  @ApiProperty({ required: false })
  depositAmount?: number;

  @ApiProperty({ required: false })
  depositPercentage?: number;

  @ApiProperty({ required: false })
  emailNotifications?: any;

  @ApiProperty({ required: false })
  smsNotifications?: any;

  @ApiProperty({ required: false })
  primaryColor?: string;

  @ApiProperty({ required: false })
  secondaryColor?: string;

  @ApiProperty({ required: false })
  logoUrl?: string;

  @ApiProperty({ required: false })
  faviconUrl?: string;

  @ApiProperty({ required: false })
  additionalSettings?: any;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
