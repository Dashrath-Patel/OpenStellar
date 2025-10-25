import { Buffer } from "buffer";
import { Address, Contract, TransactionBuilder, Networks, BASE_FEE, TimeoutInfinite, Transaction, Keypair, StrKey, xdr, contract, rpc } from '@stellar/stellar-sdk';
import { AssembledTransaction, Client as ContractClient, Spec as ContractSpec, } from '@stellar/stellar-sdk/contract';
// Export specific items instead of export *
export { Address, Contract, TransactionBuilder, Networks, BASE_FEE, TimeoutInfinite, Transaction, Keypair, StrKey, xdr, AssembledTransaction, ContractClient, ContractSpec, contract, rpc };
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
    0: { message: "Success" },
    100: { message: "GetErrorFailed" },
    110: { message: "AdminNotSet" },
    111: { message: "IncorrectAdmin" },
    112: { message: "InvalidAdmin" },
    115: { message: "FeeNotSet" },
    120: { message: "AlreadyAppliedParticipant" },
    121: { message: "WorkNotFound" },
    122: { message: "NotAppliedBounty" },
    123: { message: "NotAppliedWork" },
    130: { message: "BountyNotFound" },
    131: { message: "ParticipantIsCreator" },
    132: { message: "InactiveBountyStatus" },
    133: { message: "EmptyName" },
    134: { message: "ZeroReward" },
    135: { message: "ZeroDeadline" },
    136: { message: "InsuffCreatorBalance" },
    137: { message: "InsuffCreatorAllowance" },
    138: { message: "InvalidCreator" },
    139: { message: "InvalidParticipant" },
    140: { message: "InvalidBountyID" },
    141: { message: "InvalidWorkRepo" },
    142: { message: "NoTimeout" },
    143: { message: "InsuffContractBalance" }
};
export var BountyStatus;
(function (BountyStatus) {
    BountyStatus[BountyStatus["INIT"] = 0] = "INIT";
    BountyStatus[BountyStatus["ACTIVE"] = 1] = "ACTIVE";
    BountyStatus[BountyStatus["COMPLETE"] = 2] = "COMPLETE";
    BountyStatus[BountyStatus["CANCELLED"] = 3] = "CANCELLED";
    BountyStatus[BountyStatus["CLOSED"] = 4] = "CLOSED";
})(BountyStatus || (BountyStatus = {}));
export var WorkStatus;
(function (WorkStatus) {
    WorkStatus[WorkStatus["INIT"] = 0] = "INIT";
    WorkStatus[WorkStatus["APPLIED"] = 1] = "APPLIED";
    WorkStatus[WorkStatus["SUBMITTED"] = 2] = "SUBMITTED";
    WorkStatus[WorkStatus["APPROVED"] = 3] = "APPROVED";
    WorkStatus[WorkStatus["REJECTED"] = 4] = "REJECTED";
})(WorkStatus || (WorkStatus = {}));
export class Client extends ContractClient {
    options;
    static async deploy(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options) {
        return ContractClient.deploy(null, options);
    }
    constructor(options) {
        super(new ContractSpec(["AAAABAAAAAAAAAAAAAAACUVycm9yQ29kZQAAAAAAABgAAAAAAAAAB1N1Y2Nlc3MAAAAAAAAAAAAAAAAOR2V0RXJyb3JGYWlsZWQAAAAAAGQAAAAAAAAAC0FkbWluTm90U2V0AAAAAG4AAAAAAAAADkluY29ycmVjdEFkbWluAAAAAABvAAAAAAAAAAxJbnZhbGlkQWRtaW4AAABwAAAAAAAAAAlGZWVOb3RTZXQAAAAAAABzAAAAAAAAABlBbHJlYWR5QXBwbGllZFBhcnRpY2lwYW50AAAAAAAAeAAAAAAAAAAMV29ya05vdEZvdW5kAAAAeQAAAAAAAAAQTm90QXBwbGllZEJvdW50eQAAAHoAAAAAAAAADk5vdEFwcGxpZWRXb3JrAAAAAAB7AAAAAAAAAA5Cb3VudHlOb3RGb3VuZAAAAAAAggAAAAAAAAAUUGFydGljaXBhbnRJc0NyZWF0b3IAAACDAAAAAAAAABRJbmFjdGl2ZUJvdW50eVN0YXR1cwAAAIQAAAAAAAAACUVtcHR5TmFtZQAAAAAAAIUAAAAAAAAAClplcm9SZXdhcmQAAAAAAIYAAAAAAAAADFplcm9EZWFkbGluZQAAAIcAAAAAAAAAFEluc3VmZkNyZWF0b3JCYWxhbmNlAAAAiAAAAAAAAAAWSW5zdWZmQ3JlYXRvckFsbG93YW5jZQAAAAAAiQAAAAAAAAAOSW52YWxpZENyZWF0b3IAAAAAAIoAAAAAAAAAEkludmFsaWRQYXJ0aWNpcGFudAAAAAAAiwAAAAAAAAAPSW52YWxpZEJvdW50eUlEAAAAAIwAAAAAAAAAD0ludmFsaWRXb3JrUmVwbwAAAACNAAAAAAAAAAlOb1RpbWVvdXQAAAAAAACOAAAAAAAAABVJbnN1ZmZDb250cmFjdEJhbGFuY2UAAAAAAACP",
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
            "AAAAAAAAAAAAAAAOdG9rZW5fYmFsYW5jZXMAAAAAAAIAAAAAAAAAB2FjY291bnQAAAAAEwAAAAAAAAAFdG9rZW4AAAAAAAATAAAAAQAAAAY="]), options);
        this.options = options;
    }
    fromJSON = {
        init: (this.txFromJSON),
        version: (this.txFromJSON),
        upgrade: (this.txFromJSON),
        set_admin: (this.txFromJSON),
        get_admin: (this.txFromJSON),
        set_fee: (this.txFromJSON),
        get_fee: (this.txFromJSON),
        create_bounty: (this.txFromJSON),
        apply_bounty: (this.txFromJSON),
        submit_work: (this.txFromJSON),
        approve_work: (this.txFromJSON),
        reject_work: (this.txFromJSON),
        cancel_bounty: (this.txFromJSON),
        close_bounty: (this.txFromJSON),
        token_balances: (this.txFromJSON)
    };
}
