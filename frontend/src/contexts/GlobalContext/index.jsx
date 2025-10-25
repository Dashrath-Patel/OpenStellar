import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { networkConfig } from '../WalletContext/config';


export const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
    const [chainIndex, setChainIndex] = useState(1);
    const [chainId, setChainId] = useState(2007); // Default to Futurenet chainId

    useEffect(() => {
        if (networkConfig) {
            let keys = Object.keys(networkConfig);
            if (keys[chainIndex] && networkConfig[keys[chainIndex]]) {
                setChainId(parseInt(networkConfig[keys[chainIndex]].chainId, 16));
            }
        }
    }, [chainIndex]);
    
    const refreshPage = () => {
        window.location.reload();
    };

    return (
        <React.StrictMode>
            <GlobalContext.Provider value={{ refreshPage, chainId, setChainIndex }}>
                {children}
            </GlobalContext.Provider>
        </React.StrictMode>
    );
};

export const useGlobal = () => {
    const globalManager = useContext(GlobalContext);
    return globalManager || [{}, async () => { }];
};
