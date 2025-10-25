import { useState } from 'react';

const WalletModal = ({ isOpen, onClose, onSelectWallet }) => {
  const wallets = [
    { id: 'freighter', name: 'Freighter', icon: '🦅' },
    { id: 'xbull', name: 'xBull Wallet', icon: '🐂' },
    { id: 'albedo', name: 'Albedo', icon: '⭐' },
    { id: 'rabet', name: 'Rabet', icon: '🐰' },
    { id: 'lobstr', name: 'Lobstr', icon: '🦞' },
    { id: 'hana', name: 'Hana', icon: '🌸' },
  ];

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Connect Wallet</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-2">
          {wallets.map((wallet) => (
            <button
              key={wallet.id}
              onClick={() => onSelectWallet(wallet.id)}
              className="w-full flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-blue-500 transition-all"
            >
              <span className="text-3xl mr-4">{wallet.icon}</span>
              <span className="text-lg font-medium">{wallet.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WalletModal;
