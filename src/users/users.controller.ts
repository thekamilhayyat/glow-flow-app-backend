import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { SuccessResponseDto } from '../common/dto/success-response.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

@ApiTags('Users')
@Controller('users')
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get users' })
  @ApiResponse({ status: 200 })
  async getUsers(@Query() query: any): Promise<PaginatedResponseDto<any>> {
    return await this.usersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200 })
  async getUser(@Param('id') id: string): Promise<SuccessResponseDto<any>> {
    return await this.usersService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create user' })
  @ApiResponse({ status: 201 })
  async createUser(@Body() body: any): Promise<SuccessResponseDto<any>> {
    return await this.usersService.create(body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200 })
  async updateUser(@Param('id') id: string, @Body() body: any): Promise<SuccessResponseDto<any>> {
    return await this.usersService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: 200 })
  async deleteUser(@Param('id') id: string): Promise<SuccessResponseDto<any>> {
    return await this.usersService.remove(id);
  }
}
