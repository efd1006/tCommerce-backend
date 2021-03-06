import { forwardRef, Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { AdminCustomerController } from './controllers/admin-customer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Customer, CustomerModel } from './models/customer.model';
import { ClientCustomerController } from './controllers/client-customer.controller';
import { AuthModule } from '../auth/auth.module';
import { EmailModule } from '../email/email.module';
import { CartController } from './controllers/cart.controller';
import { OrderModule } from '../order/order.module';

const customerModel = {
  name: CustomerModel.modelName,
  schema: CustomerModel.schema,
  collection: Customer.collectionName
};

@Module({
  imports: [
    MongooseModule.forFeature([customerModel]),
    forwardRef(() => AuthModule),
    forwardRef(() => EmailModule),
    forwardRef(() => OrderModule)
  ],
  providers: [CustomerService],
  controllers: [AdminCustomerController, ClientCustomerController, CartController],
  exports: [CustomerService]
})
export class CustomerModule {}
