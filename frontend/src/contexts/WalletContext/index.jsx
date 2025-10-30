import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { StellarWalletsKit, WalletNetwork, allowAllModules, FREIGHTER_ID } from '@creit.tech/stellar-wallets-kit';
import * as StellarSdk from '@stellar/stellar-sdk';
import { useGlobal } from '../GlobalContext';
import { networkConfig, DEFAULT_NETWORK_ID } from './config';
import { 
    createServer, 
    fetchNativeBalance, 
    fetchAccountBalances 
} from '../../lib/stellar/horizonQueries';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8888';
import { linkStellarWallet, getAuthToken } from '../../utils/auth';


export const WalletContext = createContext();

export const WalletProvider = (props) => {
    const { chainId } = useGlobal();
    const [isConnected, setIsConnected] = useState(false);
    const [walletAddress, setWalletAddress] = useState('');
    const [currentNetwork, setCurrentNetwork] = useState(DEFAULT_NETWORK_ID);
    const [balance, setBalance] = useState('0');
    const [balanceLoading, setBalanceLoading] = useState(false);
    
    // Get network configuration
    const activeNetworkConfig = networkConfig[currentNetwork] || networkConfig[DEFAULT_NETWORK_ID];
    
    // Create Stellar Server instance for the current network using proper helper
    const server = useMemo(() => {
        return createServer(activeNetworkConfig);
    }, [activeNetworkConfig]);
    
    // Create kit instance with configurable network
    const kit = useMemo(() => {
        try {
            console.log('🌐 Initializing wallet with network:', activeNetworkConfig.networkName);
            const walletKit = new StellarWalletsKit({
                network: activeNetworkConfig.walletNetwork,
                selectedWalletId: undefined, // Don't auto-select any wallet
                modules: allowAllModules(),
            });
            console.log('✅ StellarWalletsKit initialized successfully');
            console.log('📡 Network:', activeNetworkConfig.networkName);
            console.log('🔗 Network Passphrase:', activeNetworkConfig.networkPassphrase);
            return walletKit;
        } catch (error) {
            console.error('❌ Failed to initialize StellarWalletsKit:', error);
            return null;
        }
    }, [currentNetwork, activeNetworkConfig]);

    const setSelectedWallet = (walletId) => {
        window.localStorage.setItem('selectedWallet', walletId);
    };

    const getSelectedWallet = () => {
        return window.localStorage.getItem('selectedWallet');
    }
    
    // Wallet object for legacy compatibility
    const [walletObj, setWalletObj] = useState({
        isConnected: async() => {
            return isConnected;
        },

        isAllowed: async() => {
            return true;
        },

        getUserInfo: async() => {
            try {
                if (!kit) {
                    console.error('Kit not initialized');
                    return '';
                }
                const { address } = await kit.getAddress();
                return address;
            } catch (error) {
                console.error('getUserInfo error:', error);
                return '';
            }
        },

        signTransaction: async(xdr, opts) => {
            try {
                if (!kit) {
                    throw new Error('Kit not initialized');
                }
                
                // Use the official API with correct network passphrase
                const { signedTxXdr } = await kit.signTransaction(xdr, {
                    address: opts?.accountToSign,
                    networkPassphrase: opts?.networkPassphrase || activeNetworkConfig.networkPassphrase,
                });
                
                return signedTxXdr;
            } catch (error) {
                console.error('signTransaction error:', error);
                throw error;
            }
        }
    });

    // Function to fetch account balance from backend API (uses real Stellar network data)
    const fetchBalance = async (address) => {
        if (!address) {
            console.log('No address provided for balance fetch');
            return;
        }
        
        setBalanceLoading(true);
        try {
            console.log('💰 Fetching balance for:', address);
            
            // Fetch balance from our backend API which queries Stellar network
            const response = await fetch(`${API_BASE_URL}/api/stellar/balance/${address}`);
            const data = await response.json();
            
            if (data.success && data.exists) {
                const formattedBalance = parseFloat(data.balance).toFixed(2);
                setBalance(formattedBalance);
                console.log('✅ Balance fetched:', formattedBalance, 'XLM');
            } else {
                console.log('⚠️ Account not found - may need funding on', activeNetworkConfig.networkName);
                setBalance('0.00');
            }
        } catch (error) {
            console.error('❌ Error fetching balance:', error);
            
            // Fallback to Horizon API if backend fails
            try {
                console.log('🔄 Trying Horizon API fallback...');
                const nativeBalance = await fetchNativeBalance(server, address);
                setBalance(nativeBalance);
                console.log('✅ Balance fetched from Horizon:', nativeBalance, 'XLM');
            } catch (horizonError) {
                console.error('❌ Horizon fallback failed:', horizonError);
                setBalance('Error loading balance');
            }
        } finally {
            setBalanceLoading(false);
        }
    };

    useEffect(() => {
        setWalletObj((prevState) => ({
            ...prevState,
            isConnected: async() => {
                return isConnected;
            }
        }));
    }, [isConnected]);

    // Connect wallet function following official documentation
    const connectWallet = async () => {
        try {
            if (!kit) {
                console.error('Kit not initialized');
                alert('Wallet kit failed to initialize. Please refresh the page.');
                return;
            }

            // Try to close any existing modal first
            try {
                const existingModal = document.querySelector('stellar-wallets-modal');
                if (existingModal) {
                    console.log('Found existing modal, attempting to remove...');
                    existingModal.remove();
                }
            } catch (e) {
                console.log('No existing modal to close');
            }

            console.log('Opening wallet modal...');
            console.log('Kit state:', kit);
            console.log('Available modules:', kit.modules);
            
            // Following official documentation pattern exactly
            await kit.openModal({
                onWalletSelected: async (option) => {
                    try {
                        console.log('🎉 Wallet selected callback triggered!');
                        console.log('Selected option:', option);
                        console.log('Option ID:', option.id);
                        console.log('Option name:', option.name);
                        
                        // Set the wallet first
                        console.log('Setting wallet...');
                        await kit.setWallet(option.id);
                        console.log('✅ Wallet set to:', option.id);
                        
                        // Get the address using official API
                        console.log('Getting address...');
                        const { address } = await kit.getAddress();
                        console.log('✅ Address retrieved:', address);
                        
                        // Update state
                        setSelectedWallet(option.id);
                        setIsConnected(true);
                        setWalletAddress(address);
                        
                        // Fetch balance after connecting
                        await fetchBalance(address);
                        
                        // Link wallet to user profile if authenticated
                        const authToken = getAuthToken();
                        if (authToken) {
                            try {
                                console.log('🔗 Linking wallet to user profile...');
                                await linkStellarWallet(address);
                                console.log('✅ Wallet linked to user profile successfully');
                            } catch (linkError) {
                                console.error('⚠️ Failed to link wallet to user profile:', linkError);
                                // Don't block wallet connection if linking fails
                                // User can still use the wallet, but payment release might not work
                            }
                        } else {
                            console.log('⚠️ User not authenticated - wallet not linked to profile');
                        }
                        
                        console.log('🚀 Wallet connected successfully!');
                        alert(`Wallet connected: ${address.substring(0, 10)}...`);
                    } catch (error) {
                        console.error('❌ Error in onWalletSelected:', error);
                        alert(`Failed to connect: ${error.message}`);
                    }
                },
                onClosed: (error) => {
                    if (error) {
                        console.error('Modal closed with error:', error);
                    } else {
                        console.log('Modal closed by user (no wallet selected)');
                    }
                },
                modalTitle: 'Connect Your Wallet',
                notAvailableText: 'Not installed'
            });
            
            console.log('Modal setup complete');
        } catch (error) {
            console.error('connectWallet error:', error);
            
            // If modal is already open, try to find and show it
            if (error.message.includes('already open')) {
                console.log('Modal already open, trying to bring it to front...');
                const modal = document.querySelector('stellar-wallets-modal');
                if (modal) {
                    modal.style.display = 'block';
                    modal.style.zIndex = '999999';
                    modal.style.position = 'fixed';
                    console.log('Modal should now be visible');
                }
            } else {
                alert(`Error opening wallet modal: ${error.message}`);
            }
        }
    }

    const disconnectWallet = async () => {
        try {
            const selectedWallet = getSelectedWallet();
            console.log('Disconnecting wallet:', selectedWallet);

            // Clear state
            setSelectedWallet(null);
            setIsConnected(false);
            setWalletAddress('');
            setBalance('0');
            
            window.localStorage.removeItem('selectedWallet');
            console.log('Wallet disconnected successfully');
        } catch (error) {
            console.error('disconnectWallet error:', error);
        }
    }
    
    // Function to switch networks
    const switchNetwork = (networkId) => {
        if (networkConfig[networkId]) {
            console.log('🔄 Switching to network:', networkConfig[networkId].networkName);
            
            // Disconnect if currently connected
            if (isConnected) {
                disconnectWallet();
            }
            
            // Update network
            setCurrentNetwork(networkId);
            window.localStorage.setItem('selectedNetwork', networkId.toString());
            
            alert(`Switched to ${networkConfig[networkId].networkName}. Please reconnect your wallet.`);
        } else {
            console.error('Invalid network ID:', networkId);
        }
    };

    // Auto-reconnect on page load if wallet was previously connected
    useEffect(() => {
        // Load saved network preference
        const savedNetwork = window.localStorage.getItem('selectedNetwork');
        if (savedNetwork && networkConfig[parseInt(savedNetwork)]) {
            setCurrentNetwork(parseInt(savedNetwork));
        }
        
        const autoConnect = async () => {
            try {
                const selectedWallet = getSelectedWallet();
                
                if (selectedWallet && kit) {
                    console.log('Auto-connecting to:', selectedWallet);
                    
                    await kit.setWallet(selectedWallet);
                    const { address } = await kit.getAddress();
                    
                    setIsConnected(true);
                    setWalletAddress(address);
                    
                    // Fetch balance on auto-reconnect
                    await fetchBalance(address);
                    
                    // Link wallet to user profile if authenticated (in case it wasn't linked before)
                    const authToken = getAuthToken();
                    if (authToken) {
                        try {
                            console.log('🔗 Auto-linking wallet to user profile...');
                            await linkStellarWallet(address);
                            console.log('✅ Wallet auto-linked to user profile successfully');
                        } catch (linkError) {
                            console.error('⚠️ Failed to auto-link wallet:', linkError);
                            // Don't block if linking fails - it might already be linked
                        }
                    }
                    
                    console.log('Auto-connected successfully');
                }
            } catch (error) {
                console.error('Auto-connect failed:', error);
                // Clear invalid stored wallet
                window.localStorage.removeItem('selectedWallet');
            }
        };

        if (kit) {
            autoConnect();
        }
    }, [kit]);

    // Auto-refresh balance every 30 seconds when connected
    useEffect(() => {
        if (!isConnected || !walletAddress) {
            return;
        }

        console.log('⏱️ Setting up auto-refresh for balance...');
        
        // Refresh immediately
        fetchBalance(walletAddress);

        // Set up interval to refresh every 30 seconds
        const refreshInterval = setInterval(() => {
            console.log('🔄 Auto-refreshing balance...');
            fetchBalance(walletAddress);
        }, 30000); // 30 seconds

        // Cleanup interval on unmount or when wallet disconnects
        return () => {
            console.log('⏹️ Stopping balance auto-refresh');
            clearInterval(refreshInterval);
        };
    }, [isConnected, walletAddress]);

    return (
        <WalletContext.Provider value={{ 
            connectWallet, 
            disconnectWallet, 
            isConnected, 
            walletAddress, 
            balance,
            balanceLoading,
            fetchBalance,
            walletObj,
            currentNetwork,
            networkConfig: activeNetworkConfig,
            switchNetwork,
            availableNetworks: networkConfig,
        }}>
            {props.children}
        </WalletContext.Provider>
    );
}

export const useCustomWallet = () => {
    const context = useContext(WalletContext);
    if (!context) {
        console.warn('useCustomWallet must be used within WalletProvider');
        return {
            connectWallet: async () => {},
            disconnectWallet: async () => {},
            isConnected: false,
            walletAddress: '',
            walletObj: {}
        };
    }
    return context;
}
