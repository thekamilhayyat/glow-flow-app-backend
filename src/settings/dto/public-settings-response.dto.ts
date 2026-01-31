import { ApiProperty } from '@nestjs/swagger';

export class PublicSettingsResponseDto {
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
  allowOnlineBooking?: boolean;

  @ApiProperty({ required: false })
  bookingAdvanceDays?: number;

  @ApiProperty({ required: false })
  bookingCancellationHours?: number;

  @ApiProperty({ required: false })
  bufferTimeMinutes?: number;

  @ApiProperty({ required: false })
  primaryColor?: string;

  @ApiProperty({ required: false })
  secondaryColor?: string;

  @ApiProperty({ required: false })
  logoUrl?: string;

  @ApiProperty({ required: false })
  faviconUrl?: string;
}
