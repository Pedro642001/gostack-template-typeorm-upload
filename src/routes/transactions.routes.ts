import { Router } from 'express';
import { getCustomRepository } from 'typeorm';
import multer from 'multer'

import TransactionsRepository from '../repositories/TransactionsRepository';
import uploadConfig from '../config/upload'
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';


const transactionsRouter = Router();
const upload = multer(uploadConfig)

transactionsRouter.get('/', async (request, response) => {
   const transactionRepository = getCustomRepository(TransactionsRepository)
   const transactions = await transactionRepository.find({relations: ['category']})
   const balance = await transactionRepository.getBalance()

   return response.json({transactions,balance})
});

transactionsRouter.post('/', async (request, response) => {
  const {title, value, type, category } = request.body
  
  const createTransactionService = new CreateTransactionService()

  const transaction = await createTransactionService.execute({title, value, category ,type})
  
  return response.json(transaction)
});

transactionsRouter.delete('/:id', async (request, response) => {
  const {id} = request.params
  const deleteTransactionService = new DeleteTransactionService()
  await deleteTransactionService.execute({transaction_id: id})

  return response.status(204).send()
});

transactionsRouter.post('/import',upload.single('file'), async (request, response) => {
  const importTransactionService = new ImportTransactionsService()
  
  const transactions = await importTransactionService.execute(request.file.path)

  return response.json(transactions)
});

export default transactionsRouter;
