/**
 * @module stellar/utils
 * @description Utility functions for working with Stellar assets and formatting
 */

import * as StellarSdk from '@stellar/stellar-sdk';

/**
 * Formats a Stellar amount to a human-readable string with fixed decimal places
 * @param {string|number} amount The amount to format
 * @param {number} [decimals=2] Number of decimal places
 * @returns {string} Formatted amount
 */
export function formatAmount(amount, decimals = 2) {
    return parseFloat(amount).toFixed(decimals);
}

/**
 * Formats a Stellar public key to a shortened version for display
 * @param {string} publicKey The full public key
 * @param {number} [prefixLength=4] Length of the prefix to show
 * @param {number} [suffixLength=4] Length of the suffix to show
 * @returns {string} Shortened public key (e.g., "GABC...XYZ")
 */
export function shortenAddress(publicKey, prefixLength = 4, suffixLength = 4) {
    if (!publicKey) return '';
    if (publicKey.length <= prefixLength + suffixLength) return publicKey;
    
    return `${publicKey.substring(0, prefixLength)}...${publicKey.substring(
        publicKey.length - suffixLength
    )}`;
}

/**
 * Validates a Stellar public key
 * @param {string} publicKey The public key to validate
 * @returns {boolean} True if valid, false otherwise
 */
export function isValidPublicKey(publicKey) {
    return StellarSdk.StrKey.isValidEd25519PublicKey(publicKey);
}

/**
 * Creates an asset object from asset code and issuer
 * @param {string} assetCode Asset code (e.g., "USDC")
 * @param {string} [assetIssuer] Asset issuer public key (omit for native XLM)
 * @returns {StellarSdk.Asset} Stellar Asset object
 */
export function createAsset(assetCode, assetIssuer) {
    if (!assetIssuer || assetCode === 'XLM' || assetCode === 'native') {
        return StellarSdk.Asset.native();
    }
    return new StellarSdk.Asset(assetCode, assetIssuer);
}

/**
 * Parses an asset string in format "CODE:ISSUER" or "native"
 * @param {string} assetString Asset string to parse
 * @returns {StellarSdk.Asset} Stellar Asset object
 */
export function parseAssetString(assetString) {
    if (assetString === 'native' || assetString === 'XLM') {
        return StellarSdk.Asset.native();
    }
    
    const [code, issuer] = assetString.split(':');
    return new StellarSdk.Asset(code, issuer);
}

/**
 * Formats an asset to a display string
 * @param {Object} asset Asset object with asset_type, asset_code, and asset_issuer
 * @returns {string} Formatted asset string (e.g., "XLM" or "USDC:GABC...")
 */
export function formatAsset(asset) {
    if (asset.asset_type === 'native') {
        return 'XLM';
    }
    return `${asset.asset_code}:${shortenAddress(asset.asset_issuer)}`;
}

/**
 * Calculates the minimum balance reserve for an account
 * @param {number} numSubentries Number of subentries (trustlines, offers, signers, etc.)
 * @param {number} [baseReserve=0.5] Base reserve in XLM (0.5 for mainnet/testnet)
 * @returns {number} Minimum balance required in XLM
 */
export function calculateMinimumBalance(numSubentries, baseReserve = 0.5) {
    // Minimum balance = (2 + numSubentries) * baseReserve
    return (2 + numSubentries) * baseReserve;
}

/**
 * Calculates available balance after accounting for minimum reserve
 * @param {string|number} balance Total balance
 * @param {number} numSubentries Number of subentries
 * @param {number} [baseReserve=0.5] Base reserve in XLM
 * @returns {string} Available balance formatted to 2 decimals
 */
export function calculateAvailableBalance(balance, numSubentries, baseReserve = 0.5) {
    const totalBalance = parseFloat(balance);
    const minBalance = calculateMinimumBalance(numSubentries, baseReserve);
    const available = Math.max(0, totalBalance - minBalance);
    return formatAmount(available, 2);
}

/**
 * Converts stroops to XLM
 * @param {string|number} stroops Amount in stroops
 * @returns {string} Amount in XLM
 */
export function stroopsToXlm(stroops) {
    return formatAmount(parseFloat(stroops) / 10000000, 7);
}

/**
 * Converts XLM to stroops
 * @param {string|number} xlm Amount in XLM
 * @returns {string} Amount in stroops
 */
export function xlmToSroops(xlm) {
    return Math.floor(parseFloat(xlm) * 10000000).toString();
}

/**
 * Copies text to clipboard
 * @param {string} text Text to copy
 * @returns {Promise<boolean>} True if successful
 */
export async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Failed to copy:', err);
        return false;
    }
}

/**
 * Gets the network passphrase for a given network
 * @param {string} network Network identifier ('testnet', 'mainnet', 'futurenet', 'standalone')
 * @returns {string} Network passphrase
 */
export function getNetworkPassphrase(network) {
    const passphrases = {
        mainnet: StellarSdk.Networks.PUBLIC,
        testnet: StellarSdk.Networks.TESTNET,
        futurenet: StellarSdk.Networks.FUTURENET,
        standalone: StellarSdk.Networks.STANDALONE,
    };
    
    return passphrases[network.toLowerCase()] || StellarSdk.Networks.TESTNET;
}
