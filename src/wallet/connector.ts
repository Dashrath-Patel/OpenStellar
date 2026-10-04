import { Server, Networks } from 'stellar-sdk';

interface WalletState {
  server: Server | null;
  network: 'testnet' | 'mainnet' | null;
  networkPassphrase: string | null;
}

class WalletConnector {
  private state: WalletState;

  constructor() {
    this.state = {
      server: null,
      network: null,
      networkPassphrase: null
    };
  }

  public connect(network: 'testnet' | 'mainnet'): Server {
    // Reset previous connection
    this.state.server = null;
    this.state.network = null;
    this.state.networkPassphrase = null;

    const config = this.getNetworkConfig(network);
    this.state.network = network;
    this.state.networkPassphrase = config.passphrase;
    
    // Create new server instance
    this.state.server = new Server(config.url, {
      allowHttp: false,
      timeout: 30000
    });

    // Set global network for transaction signing
    Networks.setNetwork(config.passphrase);

    return this.state.server;
  }

  public getServer(): Server | null {
    return this.state.server;
  }

  public getNetwork(): 'testnet' | 'mainnet' | null {
    return this.state.network;
  }

  public getNetworkPassphrase(): string | null {
    return this.state.networkPassphrase;
  }

  private getNetworkConfig(network: 'testnet' | 'mainnet') {
    return network === 'testnet'
      ? {
          url: 'https://horizon-testnet.stellar.org',
          passphrase: Networks.testnet()
        }
      : {
          url: 'https://horizon.stellar.org',
          passphrase: Networks.mainnet()
        };
  }
}

export const walletConnector = new WalletConnector();
