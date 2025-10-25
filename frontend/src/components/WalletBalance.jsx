import React from 'react';
import { useCustomWallet } from '../contexts/WalletContext';

const WalletBalance = () => {
    const { 
        isConnected, 
        walletAddress, 
        balance, 
        balanceLoading, 
        fetchBalance,
        networkConfig,
        disconnectWallet 
    } = useCustomWallet();

    if (!isConnected) {
        return null;
    }

    return (
        <div style={{
            backgroundColor: '#1a1a2e',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #0f3460',
            maxWidth: '500px',
            margin: '20px auto',
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
            }}>
                <h3 style={{
                    color: '#fff',
                    margin: 0,
                    fontSize: '18px',
                    fontWeight: '600',
                }}>
                    💼 Wallet Connected
                </h3>
                <button
                    onClick={disconnectWallet}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#e94560',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                    }}
                >
                    Disconnect
                </button>
            </div>

            {/* Network Badge */}
            <div style={{
                display: 'inline-block',
                backgroundColor: '#16213e',
                padding: '6px 12px',
                borderRadius: '6px',
                marginBottom: '16px',
                fontSize: '13px',
                color: '#4fc3f7',
            }}>
                🌐 {networkConfig.networkName}
            </div>

            {/* Balance Section */}
            <div style={{
                backgroundColor: '#16213e',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '16px',
            }}>
                <div style={{
                    fontSize: '12px',
                    color: '#888',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                }}>
                    Balance
                </div>
                {balanceLoading ? (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#4fc3f7',
                    }}>
                        <div style={{
                            width: '16px',
                            height: '16px',
                            border: '2px solid #4fc3f7',
                            borderTopColor: 'transparent',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                        }}></div>
                        <span style={{ fontSize: '14px' }}>Loading balance...</span>
                    </div>
                ) : (
                    <div style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: '8px',
                    }}>
                        <span style={{
                            fontSize: '32px',
                            fontWeight: '700',
                            color: '#4CAF50',
                            fontFamily: 'monospace',
                        }}>
                            {balance}
                        </span>
                        <span style={{
                            fontSize: '20px',
                            color: '#888',
                            fontWeight: '500',
                        }}>
                            XLM
                        </span>
                    </div>
                )}
                
                {/* Refresh Balance Button */}
                <button
                    onClick={() => fetchBalance(walletAddress)}
                    disabled={balanceLoading}
                    style={{
                        marginTop: '12px',
                        padding: '8px 12px',
                        backgroundColor: '#0f3460',
                        color: '#4fc3f7',
                        border: '1px solid #16213e',
                        borderRadius: '6px',
                        cursor: balanceLoading ? 'not-allowed' : 'pointer',
                        fontSize: '12px',
                        opacity: balanceLoading ? 0.5 : 1,
                    }}
                >
                    🔄 Refresh Balance
                </button>
            </div>

            {/* Address Section */}
            <div style={{
                backgroundColor: '#0f1419',
                borderRadius: '8px',
                padding: '12px',
                border: '1px solid #253340',
            }}>
                <div style={{
                    fontSize: '12px',
                    color: '#888',
                    marginBottom: '6px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                }}>
                    Account Address
                </div>
                <div style={{
                    fontFamily: 'monospace',
                    fontSize: '13px',
                    color: '#4fc3f7',
                    wordBreak: 'break-all',
                    lineHeight: '1.5',
                }}>
                    {walletAddress}
                </div>
                <button
                    onClick={() => {
                        navigator.clipboard.writeText(walletAddress);
                        alert('Address copied to clipboard!');
                    }}
                    style={{
                        marginTop: '8px',
                        fontSize: '12px',
                        color: '#4fc3f7',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        textDecoration: 'underline',
                    }}
                >
                    📋 Copy Address
                </button>
            </div>

            {/* Info Message if balance looks low */}
            {!balanceLoading && parseFloat(balance) < 10 && parseFloat(balance) >= 0 && (
                <div style={{
                    marginTop: '16px',
                    padding: '12px',
                    backgroundColor: '#fff3cd',
                    color: '#856404',
                    borderRadius: '6px',
                    fontSize: '13px',
                    lineHeight: '1.5',
                }}>
                    ⚠️ <strong>Low Balance:</strong> You may need to fund your account to create bounties. 
                    For testnet, use the <a 
                        href="https://laboratory.stellar.org/#account-creator?network=test" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ color: '#856404', textDecoration: 'underline' }}
                    >
                        Stellar Laboratory
                    </a> to get test XLM.
                </div>
            )}

            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default WalletBalance;
