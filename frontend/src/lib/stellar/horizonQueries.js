/**
 * @module stellar/horizonQueries
 * @description A collection of functions that help query various information
 * from the Horizon API. This allows us to abstract and simplify some interactions.
 */

import * as StellarSdk from '@stellar/stellar-sdk';

/**
 * Creates a Horizon server instance for the given network configuration
 * @param {Object} networkConfig Network configuration object
 * @param {string} networkConfig.horizonUrl Horizon server URL (for accounts/balances)
 * @returns {StellarSdk.Horizon.Server} Configured Horizon server instance
 */
export function createServer(networkConfig) {
    const serverOptions = {};
    
    // Use horizonUrl for Horizon API, fallback to rpcUrl for backwards compatibility
    const horizonUrl = networkConfig.horizonUrl || networkConfig.rpcUrl;
    
    // Allow insecure connections for local development
    if (horizonUrl.startsWith('http://')) {
        serverOptions.allowHttp = true;
    }
    
    return new StellarSdk.Horizon.Server(horizonUrl, serverOptions);
}

/**
 * Fetches and returns details about an account on the Stellar network.
 * @async
 * @function fetchAccount
 * @param {StellarSdk.Horizon.Server} server Horizon server instance
 * @param {string} publicKey Public Stellar address to query information about
 * @returns {Promise<Object>} Object containing account details
 * @throws {Error} Will throw an error if the account is not funded on the Stellar network, or if an invalid public key was provided.
 */
export async function fetchAccount(server, publicKey) {
    if (StellarSdk.StrKey.isValidEd25519PublicKey(publicKey)) {
        try {
            const account = await server.accounts().accountId(publicKey).call();
            return account;
        } catch (err) {
            if (err.response?.status === 404) {
                throw new Error('Account not funded on network');
            } else {
                throw new Error(
                    `${err.response?.title || 'Error'} - ${err.response?.detail || err.message}`
                );
            }
        }
    } else {
        throw new Error('Invalid public key');
    }
}

/**
 * Fetches and returns balance details for an account on the Stellar network.
 * @async
 * @function fetchAccountBalances
 * @param {StellarSdk.Horizon.Server} server Horizon server instance
 * @param {string} publicKey Public Stellar address holding balances to query
 * @returns {Promise<Array>} Array containing balance information for each asset the account holds
 */
export async function fetchAccountBalances(server, publicKey) {
    const account = await fetchAccount(server, publicKey);
    return account.balances;
}

/**
 * Fetches the native XLM balance for an account
 * @async
 * @function fetchNativeBalance
 * @param {StellarSdk.Horizon.Server} server Horizon server instance
 * @param {string} publicKey Public Stellar address to query
 * @returns {Promise<string>} Native XLM balance as a string
 */
export async function fetchNativeBalance(server, publicKey) {
    const balances = await fetchAccountBalances(server, publicKey);
    
    // Find native XLM balance
    const nativeBalance = balances.find(
        (balance) => balance.asset_type === 'native'
    );
    
    if (nativeBalance) {
        return parseFloat(nativeBalance.balance).toFixed(2);
    }
    
    return '0.00';
}

/**
 * Fetches and returns recent payment operations for an account
 * @async
 * @function fetchRecentPayments
 * @param {StellarSdk.Horizon.Server} server Horizon server instance
 * @param {string} publicKey Public Stellar address to query recent payment operations to/from
 * @param {number} [limit=10] Number of operations to request from the server
 * @returns {Promise<Array>} Array containing details for each recent payment
 */
export async function fetchRecentPayments(server, publicKey, limit = 10) {
    const { records } = await server
        .payments()
        .forAccount(publicKey)
        .limit(limit)
        .order('desc')
        .call();
    return records;
}

/**
 * Submits a Stellar transaction to the network for inclusion in the ledger.
 * @async
 * @function submit
 * @param {StellarSdk.Horizon.Server} server Horizon server instance
 * @param {StellarSdk.Transaction} transaction Built transaction to submit to the network
 * @returns {Promise<Object>} Transaction submission result
 * @throws {Error} Will throw an error if the transaction is not submitted successfully.
 */
export async function submit(server, transaction) {
    try {
        const result = await server.submitTransaction(transaction);
        return result;
    } catch (err) {
        throw new Error(
            `${err.response?.title || 'Transaction failed'} - ${
                err.response?.data?.extras?.result_codes || err.message
            }`
        );
    }
}
