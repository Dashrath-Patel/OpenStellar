import { Buffer } from "buffer";
import { 
  Address,
  Contract,
  TransactionBuilder,
  Networks,
  BASE_FEE,
  TimeoutInfinite,
  Transaction,
  Keypair,
  StrKey,
  xdr,
  contract,
  rpc
} from '@stellar/stellar-sdk';
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from '@stellar/stellar-sdk/contract';
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Typepoint,
  Duration,
} from '@stellar/stellar-sdk/contract';

// Export specific items instead of export *
export {
  Address,
  Contract,
  TransactionBuilder,
  Networks,
  BASE_FEE,
  TimeoutInfinite,
  Transaction,
  Keypair,
  StrKey,
  xdr,
  AssembledTransaction,
  ContractClient,
  ContractSpec,
  Result,
  MethodOptions,
  contract,
  rpc
};
export type { ContractClientOptions };

if (typeof window !== 'undefined') {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}

// Network configuration
export const networks = {
  futurenet: {
    networkPassphrase: "Test SDF Future Network ; October 2022",
    contractId: "CD2G6DU5E74RNPYLPCCLK3TZ6RBAFSQFSJMYCVVZRLWQY2IIUGX5VBF5",
  },
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "", // Update this after deploying to testnet
  }
};

export const ErrorCode = {
  0: {message:"Success"},
  100: {message:"GetErrorFailed"},
  110: {message:"AdminNotSet"},
  111: {message:"IncorrectAdmin"},
  112: {message:"InvalidAdmin"},
  115: {message:"FeeNotSet"},
  120: {message:"AlreadyAppliedParticipant"},
  121: {message:"WorkNotFound"},
  122: {message:"NotAppliedBounty"},
  123: {message:"NotAppliedWork"},
  130: {message:"BountyNotFound"},
  131: {message:"ParticipantIsCreator"},
  132: {message:"InactiveBountyStatus"},
  133: {message:"EmptyName"},
  134: {message:"ZeroReward"},
  135: {message:"ZeroDeadline"},
  136: {message:"InsuffCreatorBalance"},
  137: {message:"InsuffCreatorAllowance"},
  138: {message:"InvalidCreator"},
  139: {message:"InvalidParticipant"},
  140: {message:"InvalidBountyID"},
  141: {message:"InvalidWorkRepo"},
  142: {message:"NoTimeout"},
  143: {message:"InsuffContractBalance"}
}


export interface FeeInfo {
  fee_rate: u32;
  fee_wallet: string;
}

export enum BountyStatus {
  INIT = 0,
  ACTIVE = 1,
  COMPLETE = 2,
  CANCELLED = 3,
  CLOSED = 4,
}

export enum WorkStatus {
  INIT = 0,
  APPLIED = 1,
  SUBMITTED = 2,
  APPROVED = 3,
  REJECTED = 4,
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

export type DataKey = {tag: "ErrorCode", values: void} | {tag: "Admin", values: void} | {tag: "Fee", values: void} | {tag: "BountyCount", values: void} | {tag: "RegBounties", values: readonly [u32]} | {tag: "WorkCount", values: void} | {tag: "RegWorks", values: readonly [u32]} | {tag: "RegWorkKeys", values: readonly [WorkKey]};

export interface Client {
  /**
   * Construct and simulate a init transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  init: ({admin}: {admin: string}, options?: {
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
  }) => Promise<AssembledTransaction<null>>

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
  }) => Promise<AssembledTransaction<u32>>

  /**
   * Construct and simulate a upgrade transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  upgrade: ({new_wasm_hash}: {new_wasm_hash: Buffer}, options?: {
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
  }) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a set_admin transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  set_admin: ({new_admin}: {new_admin: string}, options?: {
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
  }) => Promise<AssembledTransaction<Result<void>>>

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
  }) => Promise<AssembledTransaction<Result<string>>>

  /**
   * Construct and simulate a set_fee transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  set_fee: ({fee_rate, fee_wallet}: {fee_rate: u32, fee_wallet: string}, options?: {
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
  }) => Promise<AssembledTransaction<Result<void>>>

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
  }) => Promise<AssembledTransaction<Result<readonly [u32, string]>>>

  /**
   * Construct and simulate a create_bounty transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  create_bounty: ({creator, name, reward, pay_token, deadline}: {creator: string, name: string, reward: u64, pay_token: string, deadline: u64}, options?: {
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
  }) => Promise<AssembledTransaction<Result<u32>>>

  /**
   * Construct and simulate a apply_bounty transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  apply_bounty: ({participant, bounty_id}: {participant: string, bounty_id: u32}, options?: {
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
  }) => Promise<AssembledTransaction<Result<u32>>>

  /**
   * Construct and simulate a submit_work transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  submit_work: ({participant, work_id}: {participant: string, work_id: u32}, options?: {
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
  }) => Promise<AssembledTransaction<Result<i32>>>

  /**
   * Construct and simulate a approve_work transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  approve_work: ({creator, work_id}: {creator: string, work_id: u32}, options?: {
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
  }) => Promise<AssembledTransaction<Result<i32>>>

  /**
   * Construct and simulate a reject_work transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  reject_work: ({creator, work_id}: {creator: string, work_id: u32}, options?: {
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
  }) => Promise<AssembledTransaction<Result<i32>>>

  /**
   * Construct and simulate a cancel_bounty transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  cancel_bounty: ({creator, bounty_id}: {creator: string, bounty_id: u32}, options?: {
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
  }) => Promise<AssembledTransaction<Result<i32>>>

  /**
   * Construct and simulate a close_bounty transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  close_bounty: ({admin, bounty_id}: {admin: string, bounty_id: u32}, options?: {
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
  }) => Promise<AssembledTransaction<Result<u32>>>

  /**
   * Construct and simulate a token_balances transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  token_balances: ({account, token}: {account: string, token: string}, options?: {
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
  }) => Promise<AssembledTransaction<u64>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAABAAAAAAAAAAAAAAACUVycm9yQ29kZQAAAAAAABgAAAAAAAAAB1N1Y2Nlc3MAAAAAAAAAAAAAAAAOR2V0RXJyb3JGYWlsZWQAAAAAAGQAAAAAAAAAC0FkbWluTm90U2V0AAAAAG4AAAAAAAAADkluY29ycmVjdEFkbWluAAAAAABvAAAAAAAAAAxJbnZhbGlkQWRtaW4AAABwAAAAAAAAAAlGZWVOb3RTZXQAAAAAAABzAAAAAAAAABlBbHJlYWR5QXBwbGllZFBhcnRpY2lwYW50AAAAAAAAeAAAAAAAAAAMV29ya05vdEZvdW5kAAAAeQAAAAAAAAAQTm90QXBwbGllZEJvdW50eQAAAHoAAAAAAAAADk5vdEFwcGxpZWRXb3JrAAAAAAB7AAAAAAAAAA5Cb3VudHlOb3RGb3VuZAAAAAAAggAAAAAAAAAUUGFydGljaXBhbnRJc0NyZWF0b3IAAACDAAAAAAAAABRJbmFjdGl2ZUJvdW50eVN0YXR1cwAAAIQAAAAAAAAACUVtcHR5TmFtZQAAAAAAAIUAAAAAAAAAClplcm9SZXdhcmQAAAAAAIYAAAAAAAAADFplcm9EZWFkbGluZQAAAIcAAAAAAAAAFEluc3VmZkNyZWF0b3JCYWxhbmNlAAAAiAAAAAAAAAAWSW5zdWZmQ3JlYXRvckFsbG93YW5jZQAAAAAAiQAAAAAAAAAOSW52YWxpZENyZWF0b3IAAAAAAIoAAAAAAAAAEkludmFsaWRQYXJ0aWNpcGFudAAAAAAAiwAAAAAAAAAPSW52YWxpZEJvdW50eUlEAAAAAIwAAAAAAAAAD0ludmFsaWRXb3JrUmVwbwAAAACNAAAAAAAAAAlOb1RpbWVvdXQAAAAAAACOAAAAAAAAABVJbnN1ZmZDb250cmFjdEJhbGFuY2UAAAAAAACP",
        "AAAAAQAAAAAAAAAAAAAAB0ZlZUluZm8AAAAAAgAAAAAAAAAIZmVlX3JhdGUAAAAEAAAAAAAAAApmZWVfd2FsbGV0AAAAAAAT",
        "AAAAAwAAAAAAAAAAAAAADEJvdW50eVN0YXR1cwAAAAUAAAAAAAAABElOSVQAAAAAAAAAAAAAAAZBQ1RJVkUAAAAAAAEAAAAAAAAACENPTVBMRVRFAAAAAgAAAAAAAAAJQ0FOQ0VMTEVEAAAAAAAAAwAAAAAAAAAGQ0xPU0VEAAAAAAAE",
        "AAAAAwAAAAAAAAAAAAAACldvcmtTdGF0dXMAAAAAAAUAAAAAAAAABElOSVQAAAAAAAAAAAAAAAdBUFBMSUVEAAAAAAEAAAAAAAAACVNVQk1JVFRFRAAAAAAAAAIAAAAAAAAACEFQUFJPVkVEAAAAAwAAAAAAAAAIUkVKRUNURUQAAAAE",
        "AAAAAQAAAAAAAAAAAAAACkJvdW50eUluZm8AAAAAAAYAAAAAAAAAB2NyZWF0b3IAAAAAEwAAAAAAAAAIZW5kX2RhdGUAAAAGAAAAAAAAAARuYW1lAAAAEAAAAAAAAAAJcGF5X3Rva2VuAAAAAAAAEwAAAAAAAAANcmV3YXJkX2Ftb3VudAAAAAAAAAYAAAAAAAAABnN0YXR1cwAAAAAH0AAAAAxCb3VudHlTdGF0dXM=",
        "AAAAAQAAAAAAAAAAAAAACFdvcmtJbmZvAAAAAwAAAAAAAAAJYm91bnR5X2lkAAAAAAAABAAAAAAAAAALcGFydGljaXBhbnQAAAAAEwAAAAAAAAAGc3RhdHVzAAAAAAfQAAAACldvcmtTdGF0dXMAAA==",
        "AAAAAQAAAAAAAAAAAAAAB1dvcmtLZXkAAAAAAgAAAAAAAAAJYm91bnR5X2lkAAAAAAAABAAAAAAAAAALcGFydGljaXBhbnQAAAAAEw==",
        "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAACAAAAAAAAAAAAAAACUVycm9yQ29kZQAAAAAAAAAAAAAAAAAABUFkbWluAAAAAAAAAAAAAAAAAAADRmVlAAAAAAAAAAAAAAAAC0JvdW50eUNvdW50AAAAAAEAAAAAAAAAC1JlZ0JvdW50aWVzAAAAAAEAAAAEAAAAAAAAAAAAAAAJV29ya0NvdW50AAAAAAAAAQAAAAAAAAAIUmVnV29ya3MAAAABAAAABAAAAAEAAAAAAAAAC1JlZ1dvcmtLZXlzAAAAAAEAAAfQAAAAB1dvcmtLZXkA",
        "AAAAAAAAAAAAAAAEaW5pdAAAAAEAAAAAAAAABWFkbWluAAAAAAAAEwAAAAA=",
        "AAAAAAAAAAAAAAAHdmVyc2lvbgAAAAAAAAAAAQAAAAQ=",
        "AAAAAAAAAAAAAAAHdXBncmFkZQAAAAABAAAAAAAAAA1uZXdfd2FzbV9oYXNoAAAAAAAD7gAAACAAAAAA",
        "AAAAAAAAAAAAAAAJc2V0X2FkbWluAAAAAAAAAQAAAAAAAAAJbmV3X2FkbWluAAAAAAAAEwAAAAEAAAPpAAAD7QAAAAAAAAfQAAAACUVycm9yQ29kZQAAAA==",
        "AAAAAAAAAAAAAAAJZ2V0X2FkbWluAAAAAAAAAAAAAAEAAAPpAAAAEwAAB9AAAAAJRXJyb3JDb2RlAAAA",
        "AAAAAAAAAAAAAAAHc2V0X2ZlZQAAAAACAAAAAAAAAAhmZWVfcmF0ZQAAAAQAAAAAAAAACmZlZV93YWxsZXQAAAAAABMAAAABAAAD6QAAA+0AAAAAAAAH0AAAAAlFcnJvckNvZGUAAAA=",
        "AAAAAAAAAAAAAAAHZ2V0X2ZlZQAAAAAAAAAAAQAAA+kAAAPtAAAAAgAAAAQAAAATAAAH0AAAAAlFcnJvckNvZGUAAAA=",
        "AAAAAAAAAAAAAAANY3JlYXRlX2JvdW50eQAAAAAAAAUAAAAAAAAAB2NyZWF0b3IAAAAAEwAAAAAAAAAEbmFtZQAAABAAAAAAAAAABnJld2FyZAAAAAAABgAAAAAAAAAJcGF5X3Rva2VuAAAAAAAAEwAAAAAAAAAIZGVhZGxpbmUAAAAGAAAAAQAAA+kAAAAEAAAH0AAAAAlFcnJvckNvZGUAAAA=",
        "AAAAAAAAAAAAAAAMYXBwbHlfYm91bnR5AAAAAgAAAAAAAAALcGFydGljaXBhbnQAAAAAEwAAAAAAAAAJYm91bnR5X2lkAAAAAAAABAAAAAEAAAPpAAAABAAAB9AAAAAJRXJyb3JDb2RlAAAA",
        "AAAAAAAAAAAAAAALc3VibWl0X3dvcmsAAAAAAgAAAAAAAAALcGFydGljaXBhbnQAAAAAEwAAAAAAAAAHd29ya19pZAAAAAAEAAAAAQAAA+kAAAAFAAAH0AAAAAlFcnJvckNvZGUAAAA=",
        "AAAAAAAAAAAAAAAMYXBwcm92ZV93b3JrAAAAAgAAAAAAAAAHY3JlYXRvcgAAAAATAAAAAAAAAAd3b3JrX2lkAAAAAAQAAAABAAAD6QAAAAUAAAfQAAAACUVycm9yQ29kZQAAAA==",
        "AAAAAAAAAAAAAAALcmVqZWN0X3dvcmsAAAAAAgAAAAAAAAAHY3JlYXRvcgAAAAATAAAAAAAAAAd3b3JrX2lkAAAAAAQAAAABAAAD6QAAAAUAAAfQAAAACUVycm9yQ29kZQAAAA==",
        "AAAAAAAAAAAAAAANY2FuY2VsX2JvdW50eQAAAAAAAAIAAAAAAAAAB2NyZWF0b3IAAAAAEwAAAAAAAAAJYm91bnR5X2lkAAAAAAAABAAAAAEAAAPpAAAABQAAB9AAAAAJRXJyb3JDb2RlAAAA",
        "AAAAAAAAAAAAAAAMY2xvc2VfYm91bnR5AAAAAgAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAAlib3VudHlfaWQAAAAAAAAEAAAAAQAAA+kAAAAEAAAH0AAAAAlFcnJvckNvZGUAAAA=",
        "AAAAAAAAAAAAAAAOdG9rZW5fYmFsYW5jZXMAAAAAAAIAAAAAAAAAB2FjY291bnQAAAAAEwAAAAAAAAAFdG9rZW4AAAAAAAATAAAAAQAAAAY=" ]),
      options
    )
  }
  public readonly fromJSON = {
    init: this.txFromJSON<null>,
        version: this.txFromJSON<u32>,
        upgrade: this.txFromJSON<null>,
        set_admin: this.txFromJSON<Result<void>>,
        get_admin: this.txFromJSON<Result<string>>,
        set_fee: this.txFromJSON<Result<void>>,
        get_fee: this.txFromJSON<Result<readonly [u32, string]>>,
        create_bounty: this.txFromJSON<Result<u32>>,
        apply_bounty: this.txFromJSON<Result<u32>>,
        submit_work: this.txFromJSON<Result<i32>>,
        approve_work: this.txFromJSON<Result<i32>>,
        reject_work: this.txFromJSON<Result<i32>>,
        cancel_bounty: this.txFromJSON<Result<i32>>,
        close_bounty: this.txFromJSON<Result<u32>>,
        token_balances: this.txFromJSON<u64>
  }
}