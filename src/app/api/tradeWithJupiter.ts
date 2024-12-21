
export type JupiterTradeParams = {
  inputMint: string;
  outputMint: string;
  amount: string;
  slippageBps: string;
}

const tradeWithJupiter = async (p: JupiterTradeParams, wallet: string): Promise<any> => {
  const url = `https://quote-api.jup.ag/v6/quote?inputMint=${p.inputMint}
      &outputMint=${p.outputMint}
      &amount=${p.amount}
      &slippageBps=${p.slippageBps}`.replace(/\s+/g, '');

  console.log(url);

  const quoteResponse = await (
    await fetch(url)
  ).json();

  const { swapTransaction } = await (
    await fetch('https://quote-api.jup.ag/v6/swap', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        quoteResponse,
        userPublicKey: wallet,
        wrapAndUnwrapSol: true,
      })
    })
  ).json();
  return swapTransaction;
}


export default tradeWithJupiter;