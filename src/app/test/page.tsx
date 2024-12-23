"use client"
import { PublicKey } from "@solana/web3.js";
import { useState } from "react";
import { SolanaAgentKit } from "solana-agent-kit";

const TestPage = () => {

    const [signature,setSignature] = useState("")

    const agent = new SolanaAgentKit(
        "3T6VyqTqALfiw9ejErYJ5yvghU1nT58Csdyo3yunK6LpJq41a2dDHvW2HfvUaApLUHBMjZ4wedBQmVScW9kLixqk",
        "https://api.devnet.solana.com",
        ""
    );

    const transferSol = async() => {
        const signature = await agent.transfer(new PublicKey("8E7uMfmyZH5aG2gmPZbn8hBg19M649mVZMJ93v5gsyVC"),1)
        setSignature(signature)
    }

    return (
        <div>
            <button onClick={transferSol}>Transfer SOL</button>
            <h1>{signature}</h1>
        </div>
    )
}


export default TestPage;