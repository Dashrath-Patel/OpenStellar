import { walletConnector } from '../wallet';
import { Server, TransactionBuilder, Account } from 'stellar-sdk';

class StellarService {
  async loadAccount(publicKey: string): Promise<Account> {
    const server = walletConnector.getServer();
    if (!server) throw new Error('Wallet not connected');

    try {
      return await server.loadAccount(publicKey);
    } catch (error) {
      console.error('Failed to load account:', error);
      throw new Error('Network request failed');
    }
  }

  async fetchBalance(accountId: string): Promise<string[]> {
    const account = await this.loadAccount(accountId);
    return account.balances
      .filter(b => b.asset_type !== 'native')
      .map(b => b.balance);
  }

  createTransaction(sourceAccount: Account, operations: any[]) {
    const server = walletConnector.getServer();
    const networkPassphrase = walletConnector.getNetworkPassphrase();
    
    if (!server || !networkPassphrase) throw new Error('Wallet not connected');

    return new TransactionBuilder(sourceAccount, {
      fee: 100,
      networkPassphrase
    }).addOperations(operations).setTimeout(30).build();
  }
}

export const stellarService = new StellarService();
