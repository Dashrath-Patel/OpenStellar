import React from 'react';
import { useCustomWallet } from '../contexts/WalletContext';

/**
 * Example component showing how to use wallet balance in your bounty creation
 * This demonstrates checking if user has enough balance before creating a bounty
 */
const CreateBountyWithBalance = () => {
    const { 
        isConnected, 
        balance, 
        balanceLoading, 
        connectWallet,
        networkConfig 
    } = useCustomWallet();

    const [bountyAmount, setBountyAmount] = React.useState('');
    const [canAfford, setCanAfford] = React.useState(true);

    // Check if user can afford the bounty
    React.useEffect(() => {
        if (bountyAmount && balance && !balanceLoading) {
            const amount = parseFloat(bountyAmount);
            const userBalance = parseFloat(balance);
            
            // Reserve 2 XLM for fees and minimum balance
            const availableBalance = userBalance - 2;
            
            setCanAfford(amount <= availableBalance && availableBalance > 0);
        }
    }, [bountyAmount, balance, balanceLoading]);

    const handleCreateBounty = () => {
        if (!isConnected) {
            alert('Please connect your wallet first');
            return;
        }

        if (!canAfford) {
            alert(`Insufficient balance! You need ${bountyAmount} XLM but only have ${balance} XLM available.`);
            return;
        }

        // Proceed with bounty creation
        console.log('Creating bounty with amount:', bountyAmount);
        alert(`Bounty creation would proceed with ${bountyAmount} XLM`);
    };

    return (
        <div style={{
            backgroundColor: '#1a1a2e',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '600px',
            margin: '20px auto',
        }}>
            <h2 style={{ color: '#fff', marginBottom: '20px' }}>
                Create Bounty
            </h2>

            {!isConnected ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <p style={{ color: '#888', marginBottom: '20px' }}>
                        Connect your wallet to create bounties
                    </p>
                    <button
                        onClick={connectWallet}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: '#4CAF50',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: '600',
                        }}
                    >
                        Connect Wallet
                    </button>
                </div>
            ) : (
                <>
                    {/* Balance Display */}
                    <div style={{
                        backgroundColor: '#16213e',
                        borderRadius: '8px',
                        padding: '16px',
                        marginBottom: '20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}>
                        <div>
                            <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>
                                Your Balance on {networkConfig.networkName}
                            </div>
                            <div style={{ fontSize: '24px', color: '#4CAF50', fontWeight: '700' }}>
                                {balanceLoading ? 'Loading...' : `${balance} XLM`}
                            </div>
                        </div>
                        <div style={{
                            fontSize: '48px',
                        }}>
                            💰
                        </div>
                    </div>

                    {/* Bounty Amount Input */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            color: '#fff',
                            marginBottom: '8px',
                            fontSize: '14px',
                            fontWeight: '500',
                        }}>
                            Bounty Amount (XLM)
                        </label>
                        <input
                            type="number"
                            value={bountyAmount}
                            onChange={(e) => setBountyAmount(e.target.value)}
                            placeholder="Enter amount in XLM"
                            min="0"
                            step="0.01"
                            style={{
                                width: '100%',
                                padding: '12px',
                                backgroundColor: '#16213e',
                                border: `2px solid ${!canAfford && bountyAmount ? '#e94560' : '#0f3460'}`,
                                borderRadius: '6px',
                                color: '#fff',
                                fontSize: '16px',
                            }}
                        />
                        {!canAfford && bountyAmount && (
                            <div style={{
                                marginTop: '8px',
                                padding: '8px',
                                backgroundColor: '#e94560',
                                color: '#fff',
                                borderRadius: '4px',
                                fontSize: '13px',
                            }}>
                                ⚠️ Insufficient balance! Available: {Math.max(0, parseFloat(balance) - 2).toFixed(2)} XLM
                                (2 XLM reserved for fees)
                            </div>
                        )}
                    </div>

                    {/* Create Button */}
                    <button
                        onClick={handleCreateBounty}
                        disabled={!bountyAmount || !canAfford || balanceLoading}
                        style={{
                            width: '100%',
                            padding: '14px',
                            backgroundColor: (!bountyAmount || !canAfford) ? '#555' : '#4CAF50',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: (!bountyAmount || !canAfford) ? 'not-allowed' : 'pointer',
                            fontSize: '16px',
                            fontWeight: '600',
                            opacity: (!bountyAmount || !canAfford) ? 0.5 : 1,
                        }}
                    >
                        {balanceLoading ? 'Checking Balance...' : 'Create Bounty'}
                    </button>

                    {/* Help Text */}
                    <div style={{
                        marginTop: '16px',
                        padding: '12px',
                        backgroundColor: '#0f3460',
                        borderRadius: '6px',
                        fontSize: '13px',
                        color: '#aaa',
                    }}>
                        💡 <strong>Note:</strong> 2 XLM will be reserved for transaction fees and minimum balance requirements.
                    </div>
                </>
            )}
        </div>
    );
};

export default CreateBountyWithBalance;
