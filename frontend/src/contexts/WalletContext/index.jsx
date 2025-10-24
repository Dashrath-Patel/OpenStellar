import { createContext, useContext, useState, useEffect, useMemo } from 'react';
// NOTE: the published repo for `stellar-wallets-kit` contains source files but no built
// `index.mjs` entry. Vite cannot resolve the package main field in that state, so import
// the library entry point directly from the package `src` folder which contains the
// TypeScript/JS exports. Vite will transform these files.
import { StellarWalletsKit, WalletNetwork, WalletType } from 'stellar-wallets-kit/src';
import { useGlobal } from '../GlobalContext';
import { networkConfig } from './config';


export const WalletContext = createContext();

export const WalletProvider = (props) => {
    const { chainId } = useGlobal();
    const configuredChainId = useMemo(() => parseInt(networkConfig[chainId].chainId, 16), [chainId]);
    const [isConnected, setIsConnected] = useState(false);
    const [walletAddress, setWalletAddress] = useState('');
    
    const kit = new StellarWalletsKit({
        network: WalletNetwork.FUTURENET,
        selectedWallet: WalletType.FREIGHTER,
    });

    const setSelectedWallet = (selectedWallet) => {
        window.localStorage.setItem('selectedWallet', selectedWallet);
    };

    const getSelectedWallet = () => {
        return window.localStorage.getItem('selectedWallet');
    }
    
    const [walletObj, setWalletObj] = useState ({
        isConnected: async() => {
            return isConnected;
        },

        isAllowed: async() => {
            return true;
        },

        getUserInfo: async() => {
            return await kit.getPublicKey();
        },

        signTransaction: async(tx, opts) => {
            return await kit.sign({
                xdr: tx,
                network: WalletNetwork.FUTURENET,
                publicKey: opts?.accountToSign ? opts?.accountToSign : await kit.getPublicKey()
            });
        }
    });

    useEffect (() => {
        setWalletObj ((prevState) => {
            return {
                ...prevState,
                isConnected: async() => {
                    return isConnected;
                }
            }
        });
    }, [isConnected]);

    const syncWallet = async (selectedWallet) => {
        let publicKey = '';

        if (selectedWallet === WalletType.WALLET_CONNECT) {
            try {
                await kit.startWalletConnect({
                    name: 'OpenStellar',
                    description: 'OpenStellar WebApp',
                    url: 'https://www.sorobounty.com/',
                    icons: ['URL_OF_ICON'],
                    projectId: 'openstellar-c9d7d',
                });

                const sessions = await kit.getSessions();
                if (sessions.length) {
                    await kit.setSession(sessions[0]?.id);
                } else {
                    await kit.connectWalletConnect();
                }

                publicKey = await kit?.getWalletConnectPublicKey();
            } catch (error) {
                console.error(error);
            }
        } else {
            await kit.setWallet(selectedWallet);
            publicKey = await kit.getPublicKey();
        }

        setSelectedWallet(selectedWallet);
        setIsConnected(true);
        setWalletAddress(publicKey);
    };

    const connectWallet = async () => {
        await kit.openModal({
            onWalletSelected: async (option) => {
                syncWallet(option.type);
            },
        });
    }

    const disconnectWallet = async () => {
        let selectedWallet = getSelectedWallet();

        if (selectedWallet === WalletType.WALLET_CONNECT) {
            const sessions = await kit.getSessions();
            console.log('session:', sessions)

            if (sessions.length) {
                await kit.closeSession(sessions[0]?.id);
            } else {
                console.log('Not connected!');
            }
        }

        setSelectedWallet(null);
        setIsConnected(false);
        setWalletAddress('');
    }

    useEffect(() => {
        let selectedWallet = getSelectedWallet();

        if (selectedWallet !== null) {
            syncWallet(selectedWallet);
        }
    }, []);

    return (
        <WalletContext.Provider value={{ connectWallet, disconnectWallet, isConnected, walletAddress, walletObj }}>
            {props.children}
        </WalletContext.Provider>
    );
}

export const useCustomWallet = () => {
    const dataManager = useContext(WalletContext);
    return dataManager || [{}];
}
