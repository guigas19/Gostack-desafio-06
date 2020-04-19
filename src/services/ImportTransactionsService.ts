import path from 'path';
import fs from 'fs';
import csv from 'csvtojson';

import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

import uploadConfig from '../config/upload';
import AppError from '../errors/AppError';

class ImportTransactionsService {
  async execute(csvFileName: string): Promise<Transaction[]> {
    const csvPath = path.join(uploadConfig.directory, csvFileName);
    const csvExists = await fs.promises.stat(csvPath);
    if (!csvExists) throw new AppError('Arquivo não encontrado!');

    const createTransaction = new CreateTransactionService();

    const parsedTransactions = await csv({
      checkType: true,
    }).fromFile(csvPath);

    const transactions = parsedTransactions.reduce(
      async (acumulador, transaction: Transaction) => {
        await acumulador;
        return createTransaction.execute({
          title: transaction.title,
          type: transaction.type,
          value: transaction.value,
          category: transaction.category.toString(),
        });
      },
      Promise.resolve(),
    );

    await fs.promises.unlink(csvPath);

    return transactions;
  }
}

export default ImportTransactionsService;
