import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  BadRequestException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { CreateTransactionUseCase } from '@/domain/use-cases/create-transaction.use-case';
import { ProcessPaymentUseCase } from '@/domain/use-cases/process-payment.use-case';
import { CreateTransactionDto } from '@/infrastructure/http/dto/create-transaction.dto';
import { ProcessPaymentDto } from '@/infrastructure/http/dto/process-payment.dto';
import {
  TRANSACTION_REPOSITORY_PORT,
  TransactionRepositoryPort,
} from '@/domain/ports/ports';

@Controller('api/v1/transactions')
export class TransactionsController {
  constructor(
    private readonly createTxUseCase: CreateTransactionUseCase,
    private readonly processPaymentUseCase: ProcessPaymentUseCase,
    @Inject(TRANSACTION_REPOSITORY_PORT)
    private readonly transactionRepo: TransactionRepositoryPort,
  ) {}

  @Post()
  async create(@Body() dto: CreateTransactionDto) {
    const result = await this.createTxUseCase.execute(dto);
    if (result.isFailure) {
      throw new BadRequestException({ success: false, error: result.error });
    }
    return { success: true, data: result.getValue() };
  }

  @Post(':id/process')
  async process(@Param('id') id: string, @Body() dto: ProcessPaymentDto) {
    const result = await this.processPaymentUseCase.execute({
      transactionId: id,
      cardToken: dto.cardToken,
      installments: dto.installments,
    });
    if (result.isFailure) {
      throw new BadRequestException({ success: false, error: result.error });
    }
    return { success: true, data: result.getValue() };
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const tx = await this.transactionRepo.findById(id);
    if (!tx)
      throw new NotFoundException({ success: false, error: 'No encontrado' });
    return { success: true, data: tx };
  }
}