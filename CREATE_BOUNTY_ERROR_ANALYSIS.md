# OpenStellar - Create Bounty Error Analysis

## Error Details

**Error Location**: `PreviewNewBounty.jsx:92`

**Error Message**:
```
{
  code: -32602,
  message: 'invalid parameters',
  data: 'json: cannot unmarshal array into Go value of type protocol.GetLedgerEntriesRequest'
}
```

---

## Root Cause

The error occurs because the project is using **outdated and deprecated** Stellar/Soroban libraries:

### Current (Problematic) Dependencies:
```json
"soroban-client": "1.0.0-beta.2",  // ⚠️ DEPRECATED
"stellar-sdk": "^10.4.1",          // ⚠️ DEPRECATED
```

These packages have been deprecated and moved to:
- `@stellar/stellar-sdk` (latest version)

The old `soroban-client` is no longer compatible with the current Soroban RPC API endpoints, causing the parameter mismatch error when trying to interact with smart contracts.

---

## The Problem Flow

1. User clicks "Create Bounty" button
2. Frontend calls `createBounty()` function in ContractContext
3. Function calls `executeTransaction()` which:
   - Builds transaction using old `soroban-client`
   - Calls `server.prepareTransaction()` 
   - This makes RPC call to Soroban network
4. **ERROR**: The old library sends requests in a format incompatible with current RPC API
5. Server responds with `-32602` (invalid parameters) error

---

## Solution Options

### Option 1: Update to Latest Stellar SDK (RECOMMENDED)

**Update package.json**:
```json
{
  "dependencies": {
    "@stellar/stellar-sdk": "^13.0.0",  // Latest version
    // Remove old packages:
    // "soroban-client": "1.0.0-beta.2",
    // "stellar-sdk": "^10.4.1",
  }
}
```

**Then update all imports in code**:
```javascript
// Old:
import * as SorobanClient from 'soroban-client';

// New:
import * as StellarSdk from '@stellar/stellar-sdk';
```

**Required Code Changes**:
- Update all `SorobanClient.*` references to `StellarSdk.*`
- Update network configuration
- Update RPC server initialization
- May need to regenerate contract bindings

### Option 2: Use Compatible RPC Endpoint

The old soroban-client might work with older RPC endpoints, but this is not recommended as those endpoints may be deprecated.

### Option 3: Rebuild Smart Contract Bindings

If you update the SDK, you'll need to regenerate the `openstellar_module`:

```bash
cd contracts
cargo build --target wasm32-unknown-unknown --release

soroban contract bindings typescript \
  --wasm target/wasm32-unknown-unknown/release/[contract-name].wasm \
  --output-dir ../frontend/openstellar_module \
  --contract-id <your-contract-id> \
  --rpc-url https://soroban-testnet.stellar.org \
  --network-passphrase "Test SDF Network ; September 2015"
```

---

## Current Backend Status

The backend logs show:
```
Ready to go. listening on port:[8888] on pid:[171658]
Connected To Db
```

**Backend is working fine** - no errors there. The issue is purely on the frontend's interaction with the Stellar/Soroban blockchain.

---

## Quick Fix Steps

1. **Stop Frontend**:
   ```bash
   pkill -f "vite"
   ```

2. **Update Dependencies**:
   ```bash
   cd /path/to/openstellar/frontend
   npm uninstall soroban-client stellar-sdk
   npm install @stellar/stellar-sdk@latest --legacy-peer-deps
   ```

3. **Update Import Statements** in these files:
   - `src/contexts/ContractContext/index.jsx`
   - `src/contexts/WalletContext/index.jsx`
   - Any other files importing soroban-client

4. **Restart Frontend**:
   ```bash
   npm run start
   ```

---

## Alternative: Use Testnet Instead

If updating is too complex, consider deploying to **Stellar Testnet** instead of Futurenet:

- Testnet RPC: `https://soroban-testnet.stellar.org`
- Testnet Passphrase: `Test SDF Network ; September 2015`

Testnet is more stable and has better library support.

---

## Notes

- This is a **breaking change** in the Stellar ecosystem
- The old soroban-client was deprecated months ago
- All production apps should migrate to `@stellar/stellar-sdk`
- The new SDK includes all Soroban functionality built-in

---

## Immediate Action Required

**To fix the "Create Bounty" functionality, you MUST update the Stellar SDK libraries.** The current versions are incompatible with modern Soroban RPC servers.

Would you like me to:
1. Update the dependencies and fix the imports?
2. Help you redeploy the smart contract with new bindings?
3. Set up Testnet instead of Futurenet?
