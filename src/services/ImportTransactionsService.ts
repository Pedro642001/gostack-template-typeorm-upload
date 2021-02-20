import Transaction from '../models/Transaction';
import fs from 'fs'
import csvParse from 'csv-parse'
import Category from '../models/Category';
import { getCustomRepository, getRepository, In, } from 'typeorm';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface TransactionDTO{
 title: string;
 type: 'income' | 'outcome';
 value: number;
 category: string;
}


class ImportTransactionsService {
 public async execute(filePath: string): Promise<Transaction[]> {

    const contactsReadStream = fs.createReadStream(filePath)
    const categoriesRepository = getRepository(Category)
    const transactionsRepository = getCustomRepository(TransactionsRepository)

    const parses = csvParse({
      from_line: 2,
    })

    const parseCSV = contactsReadStream.pipe(parses)

    const transactions:TransactionDTO[] = []
    const categories:string[] = []


    parseCSV.on('data',async line =>{ 
      const [title, type, value,category] = line.map((cell: string) =>  cell.trim())
      if( !title || !type || !value ) return;

      categories.push(category)
      transactions.push({title,type,value, category})
    })


    await new Promise(resolve => parseCSV.on('end', resolve))

    const existentCategories = await categoriesRepository.find({
      where: {
        title: In(categories)
    }})
    
    const existentCategoriesTitles = existentCategories.map(
      (category: Category) => category.title
    )
    

    const addCategoryTitles = categories
      .filter(category => !existentCategoriesTitles.includes(category))
      .filter((value,index,self) => self.indexOf(value) === index)
    
    const newCategories = categoriesRepository.create(
      addCategoryTitles.map(title => ({
        title,
      }))
    )

     await categoriesRepository.save(newCategories)    
    
     const finalCategories = [... newCategories, ...existentCategories]
  
     console.log(finalCategories);
     
     const createdTransactions = transactionsRepository.create(
       transactions.map(transaction => ({
         title: transaction.title,
         value: transaction.value,
         type: transaction.type,
         category: finalCategories.find(category => category.title === transaction.category)
       }))
     )

    await transactionsRepository.save(createdTransactions)

    return createdTransactions
    }   
}

export default ImportTransactionsService;
