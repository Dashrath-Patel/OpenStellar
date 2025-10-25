import { Buffer } from "buffer";
import { Address, Contract, TransactionBuilder, Networks, BASE_FEE, TimeoutInfinite, Transaction, Keypair, StrKey, xdr, contract, rpc } from '@stellar/stellar-sdk';
import { AssembledTransaction, Client as ContractClient, ClientOptions as ContractClientOptions, MethodOptions, Result, Spec as ContractSpec } from '@stellar/stellar-sdk/contract';
import type { u32, i32, u64 } from '@stellar/stellar-sdk/contract';
export { Address, Contract, TransactionBuilder, Networks, BASE_FEE, TimeoutInfinite, Transaction, Keypair, StrKey, xdr, AssembledTransaction, ContractClient, ContractSpec, Result, MethodOptions, contract, rpc };
export type { ContractClientOptions };
export declare const networks: {
    futurenet: {
        networkPassphrase: string;
        contractId: string;
    };
    testnet: {
        networkPassphrase: string;
        contractId: string;
    };
};
export declare const ErrorCode: {
    0: {
        message: string;
    };
    100: {
        message: string;
    };
    110: {
        message: string;
    };
    111: {
        message: string;
    };
    112: {
        message: string;
    };
    115: {
        message: string;
    };
    120: {
        message: string;
    };
    121: {
        message: string;
    };
    122: {
        message: string;
    };
    123: {
        message: string;
    };
    130: {
        message: string;
    };
    131: {
        message: string;
    };
    132: {
        message: string;
    };
    133: {
        message: string;
    };
    134: {
        message: string;
    };
    135: {
        message: string;
    };
    136: {
        message: string;
    };
    137: {
        message: string;
    };
    138: {
        message: string;
    };
    139: {
        message: string;
    };
    140: {
        message: string;
    };
    141: {
        message: string;
    };
    142: {
        message: string;
    };
    143: {
        message: string;
    };
};
export interface FeeInfo {
    fee_rate: u32;
    fee_wallet: string;
}
export declare enum BountyStatus {
    INIT = 0,
    ACTIVE = 1,
    COMPLETE = 2,
    CANCELLED = 3,
    CLOSED = 4
}
export declare enum WorkStatus {
    INIT = 0,
    APPLIED = 1,
    SUBMITTED = 2,
    APPROVED = 3,
    REJECTED = 4
}
export interface BountyInfo {
    creator: string;
    end_date: u64;
    name: string;
    pay_token: string;
    reward_amount: u64;
    status: BountyStatus;
}
export interface WorkInfo {
    bounty_id: u32;
    participant: string;
    status: WorkStatus;
}
export interface WorkKey {
    bounty_id: u32;
    participant: string;
}
export type DataKey = {
    tag: "ErrorCode";
    values: void;
} | {
    tag: "Admin";
    values: void;
} | {
    tag: "Fee";
    values: void;
} | {
    tag: "BountyCount";
    values: void;
} | {
    tag: "RegBounties";
    values: readonly [u32];
} | {
    tag: "WorkCount";
    values: void;
} | {
    tag: "RegWorks";
    values: readonly [u32];
} | {
    tag: "RegWorkKeys";
    values: readonly [WorkKey];
};
export interface Client {
    /**
     * Construct and simulate a init transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    init: ({ admin }: {
        admin: string;
    }, options?: {
        /**
         * The fee to pay for the transaction. Default: BASE_FEE
         */
        fee?: number;
        /**
         * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
         */
        timeoutInSeconds?: number;
        /**
         * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
         */
        simulate?: boolean;
    }) => Promise<AssembledTransaction<null>>;
    /**
     * Construct and simulate a version transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    version: (options?: {
        /**
         * The fee to pay for the transaction. Default: BASE_FEE
         */
        fee?: number;
        /**
         * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
         */
        timeoutInSeconds?: number;
        /**
         * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
         */
        simulate?: boolean;
    }) => Promise<AssembledTransaction<u32>>;
    /**
     * Construct and simulate a upgrade transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    upgrade: ({ new_wasm_hash }: {
        new_wasm_hash: Buffer;
    }, options?: {
        /**
         * The fee to pay for the transaction. Default: BASE_FEE
         */
        fee?: number;
        /**
         * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
         */
        timeoutInSeconds?: number;
        /**
         * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
         */
        simulate?: boolean;
    }) => Promise<AssembledTransaction<null>>;
    /**
     * Construct and simulate a set_admin transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    set_admin: ({ new_admin }: {
        new_admin: string;
    }, options?: {
        /**
         * The fee to pay for the transaction. Default: BASE_FEE
         */
        fee?: number;
        /**
         * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
         */
        timeoutInSeconds?: number;
        /**
         * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
         */
        simulate?: boolean;
    }) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a get_admin transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_admin: (options?: {
        /**
         * The fee to pay for the transaction. Default: BASE_FEE
         */
        fee?: number;
        /**
         * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
         */
        timeoutInSeconds?: number;
        /**
         * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
         */
        simulate?: boolean;
    }) => Promise<AssembledTransaction<Result<string>>>;
    /**
     * Construct and simulate a set_fee transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    set_fee: ({ fee_rate, fee_wallet }: {
        fee_rate: u32;
        fee_wallet: string;
    }, options?: {
        /**
         * The fee to pay for the transaction. Default: BASE_FEE
         */
        fee?: number;
        /**
         * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
         */
        timeoutInSeconds?: number;
        /**
         * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
         */
        simulate?: boolean;
    }) => Promise<AssembledTransaction<Result<void>>>;
    /**
     * Construct and simulate a get_fee transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_fee: (options?: {
        /**
         * The fee to pay for the transaction. Default: BASE_FEE
         */
        fee?: number;
        /**
         * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
         */
        timeoutInSeconds?: number;
        /**
         * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
         */
        simulate?: boolean;
    }) => Promise<AssembledTransaction<Result<readonly [u32, string]>>>;
    /**
     * Construct and simulate a create_bounty transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    create_bounty: ({ creator, name, reward, pay_token, deadline }: {
        creator: string;
        name: string;
        reward: u64;
        pay_token: string;
        deadline: u64;
    }, options?: {
        /**
         * The fee to pay for the transaction. Default: BASE_FEE
         */
        fee?: number;
        /**
         * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
         */
        timeoutInSeconds?: number;
        /**
         * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
         */
        simulate?: boolean;
    }) => Promise<AssembledTransaction<Result<u32>>>;
    /**
     * Construct and simulate a apply_bounty transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    apply_bounty: ({ participant, bounty_id }: {
        participant: string;
        bounty_id: u32;
    }, options?: {
        /**
         * The fee to pay for the transaction. Default: BASE_FEE
         */
        fee?: number;
        /**
         * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
         */
        timeoutInSeconds?: number;
        /**
         * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
         */
        simulate?: boolean;
    }) => Promise<AssembledTransaction<Result<u32>>>;
    /**
     * Construct and simulate a submit_work transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    submit_work: ({ participant, work_id }: {
        participant: string;
        work_id: u32;
    }, options?: {
        /**
         * The fee to pay for the transaction. Default: BASE_FEE
         */
        fee?: number;
        /**
         * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
         */
        timeoutInSeconds?: number;
        /**
         * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
         */
        simulate?: boolean;
    }) => Promise<AssembledTransaction<Result<i32>>>;
    /**
     * Construct and simulate a approve_work transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    approve_work: ({ creator, work_id }: {
        creator: string;
        work_id: u32;
    }, options?: {
        /**
         * The fee to pay for the transaction. Default: BASE_FEE
         */
        fee?: number;
        /**
         * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
         */
        timeoutInSeconds?: number;
        /**
         * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
         */
        simulate?: boolean;
    }) => Promise<AssembledTransaction<Result<i32>>>;
    /**
     * Construct and simulate a reject_work transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    reject_work: ({ creator, work_id }: {
        creator: string;
        work_id: u32;
    }, options?: {
        /**
         * The fee to pay for the transaction. Default: BASE_FEE
         */
        fee?: number;
        /**
         * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
         */
        timeoutInSeconds?: number;
        /**
         * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
         */
        simulate?: boolean;
    }) => Promise<AssembledTransaction<Result<i32>>>;
    /**
     * Construct and simulate a cancel_bounty transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    cancel_bounty: ({ creator, bounty_id }: {
        creator: string;
        bounty_id: u32;
    }, options?: {
        /**
         * The fee to pay for the transaction. Default: BASE_FEE
         */
        fee?: number;
        /**
         * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
         */
        timeoutInSeconds?: number;
        /**
         * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
         */
        simulate?: boolean;
    }) => Promise<AssembledTransaction<Result<i32>>>;
    /**
     * Construct and simulate a close_bounty transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    close_bounty: ({ admin, bounty_id }: {
        admin: string;
        bounty_id: u32;
    }, options?: {
        /**
         * The fee to pay for the transaction. Default: BASE_FEE
         */
        fee?: number;
        /**
         * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
         */
        timeoutInSeconds?: number;
        /**
         * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
         */
        simulate?: boolean;
    }) => Promise<AssembledTransaction<Result<u32>>>;
    /**
     * Construct and simulate a token_balances transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    token_balances: ({ account, token }: {
        account: string;
        token: string;
    }, options?: {
        /**
         * The fee to pay for the transaction. Default: BASE_FEE
         */
        fee?: number;
        /**
         * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
         */
        timeoutInSeconds?: number;
        /**
         * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
         */
        simulate?: boolean;
    }) => Promise<AssembledTransaction<u64>>;
}
export declare class Client extends ContractClient {
    readonly options: ContractClientOptions;
    static deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions & Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
    }): Promise<AssembledTransaction<T>>;
    constructor(options: ContractClientOptions);
    readonly fromJSON: {
        init: (json: string) => contract.AssembledTransaction<null>;
        version: (json: string) => contract.AssembledTransaction<number>;
        upgrade: (json: string) => contract.AssembledTransaction<null>;
        set_admin: (json: string) => contract.AssembledTransaction<contract.Result<void, contract.ErrorMessage>>;
        get_admin: (json: string) => contract.AssembledTransaction<contract.Result<string, contract.ErrorMessage>>;
        set_fee: (json: string) => contract.AssembledTransaction<contract.Result<void, contract.ErrorMessage>>;
        get_fee: (json: string) => contract.AssembledTransaction<contract.Result<readonly [number, string], contract.ErrorMessage>>;
        create_bounty: (json: string) => contract.AssembledTransaction<contract.Result<number, contract.ErrorMessage>>;
        apply_bounty: (json: string) => contract.AssembledTransaction<contract.Result<number, contract.ErrorMessage>>;
        submit_work: (json: string) => contract.AssembledTransaction<contract.Result<number, contract.ErrorMessage>>;
        approve_work: (json: string) => contract.AssembledTransaction<contract.Result<number, contract.ErrorMessage>>;
        reject_work: (json: string) => contract.AssembledTransaction<contract.Result<number, contract.ErrorMessage>>;
        cancel_bounty: (json: string) => contract.AssembledTransaction<contract.Result<number, contract.ErrorMessage>>;
        close_bounty: (json: string) => contract.AssembledTransaction<contract.Result<number, contract.ErrorMessage>>;
        token_balances: (json: string) => contract.AssembledTransaction<bigint>;
    };
}
