// import AppError from '../errors/AppError';

import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Category from '../models/Category';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request{
  title: string;
  value:number;
  category : string;
  type: 'income' | 'outcome';
  }

class CreateTransactionService {
  public async execute({title, value, type, category }: Request): Promise<Transaction> {

    const transactionRepository = getCustomRepository(TransactionsRepository)
    const CategoriesRepository = getRepository(Category)


    const {total} = await transactionRepository.getBalance()
    
    if((type == 'outcome') && (total < value) ){
      throw new AppError('transaction is invalid, limit value exceeded',400)
    }

    let transactionCategory = await CategoriesRepository.findOne({where: {title: category}}) 

    if(!transactionCategory){
      transactionCategory = CategoriesRepository.create({title: category,})
      await CategoriesRepository.save(transactionCategory)
    }
  
    
    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category: transactionCategory
    })

    await transactionRepository.save(transaction)

    return transaction
  }
}

export default CreateTransactionService
