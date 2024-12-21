import { AddressLookupTableAccount, Connection, PublicKey, Transaction, TransactionInstruction, TransactionMessage, VersionedTransaction } from "@solana/web3.js";

export type JupiterTradeParams = {
  inputMint: string;
  outputMint: string;
  amount: string;
  slippageBps: string;
}

const getAddressLookupTableAccounts = async (
  keys: string[],
  connection: Connection
): Promise<AddressLookupTableAccount[]> => {
  const addressLookupTableAccountInfos =
    await connection.getMultipleAccountsInfo(
      keys.map((key) => new PublicKey(key))
    );

  return addressLookupTableAccountInfos.reduce((acc, accountInfo, index) => {
    const addressLookupTableAddress = keys[index];
    if (accountInfo) {
      const addressLookupTableAccount = new AddressLookupTableAccount({
        key: new PublicKey(addressLookupTableAddress),
        state: AddressLookupTableAccount.deserialize(accountInfo.data),
      });
      acc.push(addressLookupTableAccount);
    }

    return acc;
  }, new Array<AddressLookupTableAccount>());
};

const deserializeInstruction = (instruction:any) => {
  return new TransactionInstruction({
    programId: new PublicKey(instruction.programId),
    keys: instruction.accounts.map((key:any) => ({
      pubkey: new PublicKey(key.pubkey),
      isSigner: key.isSigner,
      isWritable: key.isWritable,
    })),
    data: Buffer.from(instruction.data, "base64"),
  });
};

const tradeWithJupiter = async (p: JupiterTradeParams, wallet: PublicKey,connection: Connection): Promise<VersionedTransaction> => {
  const url = `https://quote-api.jup.ag/v6/quote?inputMint=${p.inputMint}
      &outputMint=${p.outputMint}
      &amount=${p.amount}
      &slippageBps=${p.slippageBps}`.replace(/\s+/g, '');

  console.log(url);

  const quoteResponse = await (
    await fetch(url)
  ).json();

  const instructions = await (
    await fetch('https://quote-api.jup.ag/v6/swap-instructions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        quoteResponse,
        userPublicKey: wallet.toBase58(),
      })
    })
  ).json();
  const {
    tokenLedgerInstruction, // If you are using `useTokenLedger = true`.
    computeBudgetInstructions, // The necessary instructions to setup the compute budget.
    setupInstructions, // Setup missing ATA for the users.
    swapInstruction: swapInstructionPayload, // The actual swap instruction.
    cleanupInstruction, // Unwrap the SOL if `wrapAndUnwrapSol = true`.
    addressLookupTableAddresses, // The lookup table addresses that you can use if you are using versioned transaction.
  } = instructions;
  
  
  const blockhash = (await connection.getLatestBlockhash()).blockhash;
  const addressLookupTableAccounts: AddressLookupTableAccount[] = [];
  addressLookupTableAccounts.push(
    ...(await getAddressLookupTableAccounts(addressLookupTableAddresses,connection))
  );
  const messageV0 = new TransactionMessage({
    payerKey: wallet,
    recentBlockhash: blockhash,
    instructions: [
      deserializeInstruction(swapInstructionPayload),
    ],
  }).compileToV0Message(addressLookupTableAccounts);
  return new VersionedTransaction(messageV0);
}


export default tradeWithJupiter;