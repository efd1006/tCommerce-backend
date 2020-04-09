import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { CustomerService } from '../customer.service';
import { ClientRegisterDto } from '../../shared/dtos/client/register.dto';
import { FastifyReply } from 'fastify';
import { ServerResponse } from 'http';
import { LoginDto } from '../../shared/dtos/shared-dtos/login.dto';
import { Customer } from '../models/customer.model';
import { plainToClass } from 'class-transformer';
import { ClientCustomerDto } from '../../shared/dtos/client/customer.dto';
import { AuthService } from '../../auth/services/auth.service';
import { ResponseDto } from '../../shared/dtos/shared-dtos/response.dto';
import { ResetPasswordDto } from '../../shared/dtos/client/reset-password.dto';
import { ClientDetailedCustomerDto } from '../../shared/dtos/client/detailed-customer.dto';
import { ClientUpdateCustomerDto } from '../../shared/dtos/client/update-customer.dto';
import { DocumentType } from '@typegoose/typegoose';
import { ClientUpdatePasswordDto } from '../../shared/dtos/client/update-password.dto';
import { ShippingAddressDto } from '../../shared/dtos/shared-dtos/shipping-address.dto';
import { CustomerJwtGuard } from '../../auth/services/guards/customer-jwt.guard';
import { CustomerLocalGuard } from '../../auth/services/guards/customer-local.guard';

@UsePipes(new ValidationPipe({ transform: true }))
@UseInterceptors(ClassSerializerInterceptor)
@Controller('customer')
export class ClientCustomerController {

  constructor(private customerService: CustomerService,
              private authService: AuthService) {
  }

  @Get()
  async getInfo(@Req() req): Promise<ResponseDto<ClientCustomerDto | null>> {
    const customer: Customer = await this.authService.getCustomerFromReq(req);
    const dto = customer ? plainToClass(ClientCustomerDto, customer, { excludeExtraneousValues: true }) : null;

    return {
      data: dto
    };
  }

  @UseGuards(CustomerJwtGuard)
  @Get('details')
  async getAccount(@Req() req): Promise<ResponseDto<ClientDetailedCustomerDto>> {
    const customer: DocumentType<Customer> = req.user;

    return {
      data: plainToClass(ClientDetailedCustomerDto, customer, { excludeExtraneousValues: true })
    };
  }

  /**
   * @returns ResponseDto<ClientCustomerDto>
   */
  @UseGuards(CustomerJwtGuard)
  @Post('password')
  async updatePassword(@Req() req, @Body() dto: ClientUpdatePasswordDto, @Res() res: FastifyReply<ServerResponse>) {
    const customer: DocumentType<Customer> = req.user;
    const updated = await this.customerService.updatePassword(customer, dto);
    const customerDto = plainToClass(ClientCustomerDto, updated, { excludeExtraneousValues: true });

    return this.authService.loginCustomer(customerDto, res);
  }

  /**
   * @returns ResponseDto<ClientCustomerDto>
   */
  @Post('register')
  async register(@Body() registerDto: ClientRegisterDto, @Res() res: FastifyReply<ServerResponse>) {
    const customer = await this.customerService.clientRegisterCustomer(registerDto);
    const customerDto = plainToClass(ClientCustomerDto, customer, { excludeExtraneousValues: true });

    return this.authService.loginCustomer(customerDto, res);
  }

  /**
   * @returns ResponseDto<ClientCustomerDto>
   */
  @UseGuards(CustomerLocalGuard)
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Req() req, @Res() res: FastifyReply<ServerResponse>) {
    const customer: DocumentType<Customer> = req.user;
    this.customerService.updateLastLoggedIn(customer.id);
    const customerDto = plainToClass(ClientCustomerDto, customer, { excludeExtraneousValues: true });

    return this.authService.loginCustomer(customerDto, res);
  }

  @Post('reset')
  resetPassword(@Body() resetDto: ResetPasswordDto) {
    return this.customerService.resetPasswordByDto(resetDto);
  }

  @Post('logout')
  async logout(@Res() res: FastifyReply<ServerResponse>) {
    return this.authService.logoutCustomer(res);
  }

  @UseGuards(CustomerJwtGuard)
  @Post('send-confirm-email')
  async sendEmailConfirmationEmail(@Req() req): Promise<ResponseDto<boolean>> {
    const customer: DocumentType<Customer> = req.user;
    await this.customerService.sendEmailConfirmationEmail(customer);

    return { data: true };
  }

  @UseGuards(CustomerJwtGuard)
  @Post('address')
  async addShippingAddress(@Req() req, @Body() addressDto: ShippingAddressDto): Promise<ResponseDto<ClientDetailedCustomerDto>> {
    const customer: DocumentType<Customer> = req.user;
    const updated = await this.customerService.addShippingAddress(customer, addressDto);

    return {
      data: plainToClass(ClientDetailedCustomerDto, updated, { excludeExtraneousValues: true })
    };
  }

  @UseGuards(CustomerJwtGuard)
  @Put('address/:id')
  async editShippingAddress(@Req() req, @Param('id') addressId: string, @Body() addressDto: ShippingAddressDto): Promise<ResponseDto<ClientDetailedCustomerDto>> {
    const customer: DocumentType<Customer> = req.user;
    const updated = await this.customerService.editShippingAddress(customer, addressId, addressDto);

    return {
      data: plainToClass(ClientDetailedCustomerDto, updated, { excludeExtraneousValues: true })
    };
  }

  @UseGuards(CustomerJwtGuard)
  @Patch()
  async updateCustomer(@Req() req, @Body() dto: ClientUpdateCustomerDto): Promise<ResponseDto<ClientCustomerDto>> {
    const customer: DocumentType<Customer> = req.user;
    const updated = await this.customerService.updateCustomerByClientDto(customer, dto);

    return {
      data: plainToClass(ClientCustomerDto, updated, { excludeExtraneousValues: true })
    }
  }
}