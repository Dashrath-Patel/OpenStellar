/**
 * Manual Test Script for Stellar Network Switching
 * Run with: node src/stellar/test-network-switching.js
 */

const { 
    getNetworkConfig, 
    getServerForNetwork, 
    getBalance, 
    accountExists,
    getTransaction
} = require('./payment');

const chalk = require('chalk');

const TESTNET_ACCOUNT = 'GBHES2I2JSDSY4H34Y2MF4GIBOU7S2Y6ZVTN4EVG4XVU7HEHX6BEG2C2';

console.log(chalk.bold('\nStarting Stellar Network Switching Tests...\n'));

async function runTests() {
    let passed = 0;
    let failed = 0;

    console.log(chalk.cyan('Test 1: Network Configuration'));
    try {
        const mainnetConfig = getNetworkConfig('mainnet');
        const testnetConfig = getNetworkConfig('testnet');
        
        if (mainnetConfig.name === 'mainnet' && 
            mainnetConfig.horizonUrl === 'https://horizon.stellar.org' &&
            testnetConfig.name === 'testnet' &&
            testnetConfig.horizonUrl === 'https://horizon-testnet.stellar.org') {
            console.log(chalk.green('PASSED: Network configuration correct'));
            passed++;
        } else {
            console.log(chalk.red('FAILED: Network configuration incorrect'));
            failed++;
        }
    } catch (error) {
        console.log(chalk.red('FAILED:'), error.message);
        failed++;
    }

    console.log(chalk.cyan('\nTest 2: Server Instance Creation'));
    try {
        const mainnetInfo = getServerForNetwork('mainnet');
        const testnetInfo = getServerForNetwork('testnet');
        
        const mainnetUrl = String(mainnetInfo.server.serverURL);
        const testnetUrl = String(testnetInfo.server.serverURL);
        
        console.log(`   Mainnet URL: ${mainnetUrl}`);
        console.log(`   Testnet URL: ${testnetUrl}`);
        
        if (mainnetUrl.includes('horizon.stellar.org') &&
            testnetUrl.includes('horizon-testnet.stellar.org')) {
            console.log(chalk.green('PASSED: Server instances created with correct URLs'));
            passed++;
        } else {
            console.log(chalk.red('FAILED: Server URLs incorrect'));
            console.log(`   Mainnet: ${mainnetUrl}`);
            console.log(`   Testnet: ${testnetUrl}`);
            failed++;
        }
    } catch (error) {
        console.log(chalk.red('FAILED:'), error.message);
        failed++;
    }

    console.log(chalk.cyan('\nTest 3: Network Passphrases'));
    try {
        const mainnetInfo = getServerForNetwork('mainnet');
        const testnetInfo = getServerForNetwork('testnet');
        
        console.log(`   Mainnet Passphrase: ${mainnetInfo.passphrase.substring(0, 40)}...`);
        console.log(`   Testnet Passphrase: ${testnetInfo.passphrase.substring(0, 40)}...`);
        
        if (mainnetInfo.passphrase !== testnetInfo.passphrase) {
            console.log(chalk.green('PASSED: Passphrases are different for each network'));
            passed++;
        } else {
            console.log(chalk.red('FAILED: Passphrases are the same'));
            failed++;
        }
    } catch (error) {
        console.log(chalk.red('FAILED:'), error.message);
        failed++;
    }

    console.log(chalk.cyan('\nTest 4: Testnet Network Connection'));
    try {
        const testnetInfo = getServerForNetwork('testnet');
        
        console.log(`   Connecting to: ${testnetInfo.server.serverURL}`);
        console.log(chalk.green('PASSED: Successfully created testnet server'));
        passed++;
    } catch (error) {
        console.log(chalk.red('FAILED:'), error.message);
        failed++;
    }

    console.log(chalk.cyan('\nTest 5: Network Switching (Query both networks)'));
    try {
        console.log('   Querying testnet...');
        const testnetInfo = getServerForNetwork('testnet');
        console.log(`   Testnet URL: ${testnetInfo.server.serverURL}`);
        
        console.log('   Querying mainnet...');
        const mainnetInfo = getServerForNetwork('mainnet');
        console.log(`   Mainnet URL: ${mainnetInfo.server.serverURL}`);
        
        if (testnetInfo.server.serverURL !== mainnetInfo.server.serverURL) {
            console.log(chalk.green('PASSED: Successfully switched between networks'));
            passed++;
        } else {
            console.log(chalk.red('FAILED: Same server used for both networks'));
            failed++;
        }
    } catch (error) {
        console.log(chalk.red('FAILED:'), error.message);
        failed++;
    }

    console.log(chalk.cyan('\nTest 6: Fresh Server Instances for Each Network'));
    try {
        const server1 = getServerForNetwork('mainnet');
        const server2 = getServerForNetwork('testnet');
        const server3 = getServerForNetwork('mainnet');
        
        if (server1 !== server3) {
            console.log(chalk.green('PASSED: Creating fresh server instances'));
            passed++;
        } else {
            console.log(chalk.red('FAILED: Reusing server instances'));
            failed++;
        }
    } catch (error) {
        console.log(chalk.red('FAILED:'), error.message);
        failed++;
    }

    console.log(chalk.cyan('\nTest 7: Mainnet Connection'));
    try {
        const mainnetInfo = getServerForNetwork('mainnet');
        
        console.log(`   Connecting to: ${mainnetInfo.server.serverURL}`);
        console.log(chalk.green('PASSED: Successfully created mainnet server'));
        passed++;
    } catch (error) {
        console.log(chalk.red('FAILED:'), error.message);
        failed++;
    }

    console.log(chalk.bold('\nTest Summary'));
    console.log(chalk.green(`Passed: ${passed}`));
    if (failed > 0) {
        console.log(chalk.red(`Failed: ${failed}`));
    }
    console.log(chalk.bold(`\nTotal: ${passed + failed} tests\n`));

    if (failed === 0) {
        console.log(chalk.bold.green('All tests passed. Network switching is working correctly.\n'));
    } else {
        console.log(chalk.bold.yellow('Some tests failed. Please review the errors above.\n'));
    }
}

runTests().catch(error => {
    console.error(chalk.red('\nTest suite error:'), error);
    process.exit(1);
});

