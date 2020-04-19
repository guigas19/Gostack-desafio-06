// import AppError from '../errors/AppError';
import { getCustomRepository, getRepository } from 'typeorm';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionRepository from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const categoryRepository = getRepository(Category);
    const transactionRepository = getCustomRepository(TransactionRepository);
    const transactions = await transactionRepository.find();
    const balance = await transactionRepository.getBalance(transactions);

    if (type === 'outcome') {
      if (value > balance.total)
        throw new AppError('Saldo insuficiente na conta para essa transação');
    }

    const categoryExists = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!categoryExists) {
      const newCategory = categoryRepository.create({
        title: category,
      });
      await categoryRepository.save(newCategory);
      const categoryId = newCategory.id;
      const transaction = transactionRepository.create({
        title,
        value,
        type,
        category_id: categoryId,
      });
      await transactionRepository.save(transaction);
      return transaction;
    }
    const categoryId = categoryExists.id;
    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category_id: categoryId,
    });
    await transactionRepository.save(transaction);
    return transaction;
  }
}

export default CreateTransactionService;
