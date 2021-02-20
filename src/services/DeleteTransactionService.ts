import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request{
  transaction_id: string;
}

class DeleteTransactionService {
  public async execute({transaction_id}:Request): Promise<void> {
    const transactionRepository = getCustomRepository(TransactionsRepository)
    const transaction = await transactionRepository.findOne({id: transaction_id})

    if(!transaction){
      throw new AppError('transaction not found')
    }

    await transactionRepository.delete(transaction.id)
  }
}

export default DeleteTransactionService;
