import { WalletNetwork } from '@creit.tech/stellar-wallets-kit';

// Network configuration for different Stellar networks
export const networkConfig = {
    169: {
        chainId: '0x0A9',
        networkName: 'Stellar Mainnet',
        explorerUrl: 'https://stellarchain.io',
        rpcUrl: 'https://rpc-mainnet.stellar.org', // For Soroban contracts
        horizonUrl: 'https://horizon.stellar.org', // For accounts/balances
        walletNetwork: WalletNetwork.PUBLIC,
        networkPassphrase: 'Public Global Stellar Network ; September 2015',
    },

    2007: {
        chainId: '0x7D7',
        networkName: 'Stellar Testnet',
        explorerUrl: 'https://testnet.stellarchain.io',
        rpcUrl: 'https://soroban-testnet.stellar.org', // For Soroban contracts
        horizonUrl: 'https://horizon-testnet.stellar.org', // For accounts/balances
        walletNetwork: WalletNetwork.TESTNET,
        networkPassphrase: 'Test SDF Network ; September 2015',
    },

    2008: {
        chainId: '0x7D8',
        networkName: 'Stellar Futurenet',
        explorerUrl: 'https://futurenet.stellarchain.io',
        rpcUrl: 'https://rpc-futurenet.stellar.org', // For Soroban contracts
        horizonUrl: 'https://horizon-futurenet.stellar.org', // For accounts/balances
        walletNetwork: WalletNetwork.FUTURENET,
        networkPassphrase: 'Test SDF Future Network ; October 2022',
    },

    9000: {
        chainId: '0x2328',
        networkName: 'Standalone Network (Local)',
        explorerUrl: 'http://localhost:8000',
        rpcUrl: 'http://localhost:8000/soroban/rpc', // For Soroban contracts
        horizonUrl: 'http://localhost:8000', // For accounts/balances
        walletNetwork: WalletNetwork.STANDALONE,
        networkPassphrase: 'Standalone Network ; February 2017',
    },
};

// Default network (change this to switch networks)
export const DEFAULT_NETWORK_ID = 9000; // Local Standalone (Your custom network with 10000 XLM)
// export const DEFAULT_NETWORK_ID = 2007; // Testnet
// export const DEFAULT_NETWORK_ID = 2008; // Futurenet
// export const DEFAULT_NETWORK_ID = 169; // Mainnet
