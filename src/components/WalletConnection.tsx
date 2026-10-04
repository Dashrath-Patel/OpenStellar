import React, { useState, useEffect } from 'react';
import { walletConnector } from '../wallet';
import { stellarService } from '../services/stellar-service';
import { ReconnectionHandler } from '../utils/reconnection-handler';

export const WalletConnection = () => {
  const [network, setNetwork] = useState<'testnet' | 'mainnet'>('testnet');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reconnectionHandler = new ReconnectionHandler();

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      await reconnectionHandler.withRetry(async () => {
        walletConnector.connect(network);
        // Test connection by loading a test account
        await stellarService.loadAccount('GDXX35D7W4I4G5P3V4X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5');
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="wallet-connection">
      <select 
        value={network} 
        onChange={(e) => setNetwork(e.target.value as 'testnet' | 'mainnet')}
        disabled={isConnecting}
      >
        <option value="testnet">Testnet</option>
        <option value="mainnet">Mainnet</option>
      </select>
      <button onClick={handleConnect} disabled={isConnecting}>
        {isConnecting ? 'Connecting...' : 'Connect'}
      </button>
      {error && <div className="error">{error}</div>}
    </div>
  );
};
