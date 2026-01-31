import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsBoolean,
  IsInt,
  IsNumber,
  ValidateNested,
  IsObject,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

class BusinessHoursDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  monday?: { open?: string; close?: string; isClosed?: boolean };

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  tuesday?: { open?: string; close?: string; isClosed?: boolean };

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  wednesday?: { open?: string; close?: string; isClosed?: boolean };

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  thursday?: { open?: string; close?: string; isClosed?: boolean };

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  friday?: { open?: string; close?: string; isClosed?: boolean };

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  saturday?: { open?: string; close?: string; isClosed?: boolean };

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  sunday?: { open?: string; close?: string; isClosed?: boolean };
}

export class UpdateSettingsDto {
  // Business Profile
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  businessName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  businessEmail?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  businessPhone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  businessAddress?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  businessCity?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  businessState?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  businessZip?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  businessCountry?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  businessWebsite?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  businessLogo?: string;

  // Business Hours
  @ApiProperty({ required: false, type: BusinessHoursDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => BusinessHoursDto)
  businessHours?: BusinessHoursDto;

  // Booking Settings
  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  bookingAdvanceDays?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  bookingCancellationHours?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  allowOnlineBooking?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  requireConfirmation?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  autoConfirm?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  bufferTimeMinutes?: number;

  // Tax Settings
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  taxEnabled?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  taxRate?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  taxIncluded?: boolean;

  // Payment Settings
  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  paymentMethods?: Record<string, any>;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  requireDeposit?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  depositAmount?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  depositPercentage?: number;

  // Notification Settings
  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  emailNotifications?: Record<string, any>;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  smsNotifications?: Record<string, any>;

  // Appearance Settings
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  primaryColor?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  secondaryColor?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  faviconUrl?: string;

  // Integration Settings (encrypted)
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  integrationSettings?: string;

  // Additional Settings
  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  additionalSettings?: Record<string, any>;
}
