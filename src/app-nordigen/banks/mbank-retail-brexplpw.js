import { printIban, amountToInteger } from '../utils.js';

/** @type {import('./bank.interface.js').IBank} */
export default {
  institutionId: 'MBANK_RETAIL_BREXPLPW',

  normalizeAccount(account) {
    return {
      account_id: account.id,
      institution: account.institution,
      mask: account.iban.slice(-4),
      name: [account.displayName, printIban(account)].join(' '),
      official_name: account.product,
      type: 'checking'
    };
  },

  sortTransactions(transactions = []) {
    return transactions.sort(
      (a, b) => Number(b.transactionId) - Number(a.transactionId)
    );
  },

  /**
   *  For MBANK_RETAIL_BREXPLPW we don't know what balance was
   *  after each transaction so we have to calculate it by getting
   *  current balance from the account and subtract all the transactions
   *
   *  As a current balance we use `interimBooked` balance type because
   *  it includes transaction placed during current day
   */
  calculateStartingBalance(sortedTransactions = [], balances = []) {
    const currentBalance = balances.find(
      (balance) => 'interimBooked' === balance.balanceType
    );

    return sortedTransactions.reduce((total, trans) => {
      return total - amountToInteger(trans.transactionAmount.amount);
    }, amountToInteger(currentBalance.balanceAmount.amount));
  }
};
