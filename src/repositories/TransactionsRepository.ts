import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(transactions: Transaction[]): Promise<Balance> {
    const income = transactions.reduce(
      (total, transaction) =>
        transaction.type === 'income' ? total + transaction.value : total,
      0,
    );
    const outcome = transactions.reduce(
      (total, transaction) =>
        transaction.type === 'outcome' ? total + transaction.value : total,
      0,
    );

    const total = income - outcome;

    return {
      income,
      outcome,
      total,
    };
  }
}

export default TransactionsRepository;
