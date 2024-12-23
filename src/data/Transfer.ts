export type TransferData = {
    to: String;
    amount: String;
    mint: String;
}

export type StakeJupiter = {
    amount:String;
}

export type SolanaCallPayload = {
    method:String;
    jsonrpc:String
    id:Number;
    params:String[];
}

export type SolanaCall = {
    responding_message:String;
    payload:SolanaCallPayload;
}