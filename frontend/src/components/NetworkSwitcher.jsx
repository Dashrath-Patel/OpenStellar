import React from 'react';
import { useCustomWallet } from '../contexts/WalletContext';

const NetworkSwitcher = () => {
    const { currentNetwork, networkConfig, switchNetwork, availableNetworks, isConnected } = useCustomWallet();

    const handleNetworkChange = (e) => {
        const networkId = parseInt(e.target.value);
        switchNetwork(networkId);
    };

    return (
        <div className="network-switcher" style={{
            padding: '10px',
            backgroundColor: '#1a1a2e',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
        }}>
            <label style={{ color: '#fff', fontWeight: '500' }}>
                Network:
            </label>
            <select 
                value={currentNetwork} 
                onChange={handleNetworkChange}
                style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    backgroundColor: '#16213e',
                    color: '#fff',
                    border: '1px solid #0f3460',
                    cursor: 'pointer',
                    outline: 'none',
                }}
            >
                {Object.entries(availableNetworks).map(([id, config]) => (
                    <option key={id} value={id}>
                        {config.networkName}
                    </option>
                ))}
            </select>
            
            {isConnected && (
                <span style={{
                    fontSize: '12px',
                    color: '#ffa500',
                    marginLeft: '10px',
                }}>
                    ⚠️ Disconnect wallet to switch networks
                </span>
            )}
            
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                marginLeft: 'auto',
            }}>
                <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: isConnected ? '#4CAF50' : '#888',
                }}></span>
                <span style={{ color: '#fff', fontSize: '12px' }}>
                    {networkConfig.networkName}
                </span>
            </div>
        </div>
    );
};

export default NetworkSwitcher;
