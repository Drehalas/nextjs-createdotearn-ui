"use client";
import { ChatLayout } from "@/components/chat/chat-layout";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogContent,
} from "@/components/ui/dialog";
import { getSelectedModel } from "@/lib/model-helper";
import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { Attachment, ChatRequestOptions } from "ai";
import { Message, useChat } from "ai/react";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import useChatStore from "./hooks/useChatStore";
import sendRequest from "./api";
import tradeWithJupiter, { JupiterTradeParams } from "./api/tradeWithJupiter";
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, clusterApiUrl, Transaction } from "@solana/web3.js";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { SolanaAgentKit } from "solana-agent-kit";
import { SolanaCall, StakeJupiter, TransferData } from "@/data/Transfer";
import "@/styles/wallet.css";

export default function Home() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    data,
    stop,
    setMessages,
    setInput,
  } = useChat({
    onResponse: (response) => {
      if (response) {
        setLoadingSubmit(false);
      }
    },
    onError: (error) => {
      setLoadingSubmit(false);
      toast.error("An error occurred. Please try again.");
    },
  });
  const [chatId, setChatId] = React.useState<string>("");
  const [selectedModel, setSelectedModel] = React.useState<string>(
    getSelectedModel()
  );
  const [open, setOpen] = React.useState(false);
  const [cr8AI, setCr8AI] = useState<ChatOllama>();
  const [balance, setBalance] = useState(0);
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const env = process.env.NODE_ENV;
  const [loadingSubmit, setLoadingSubmit] = React.useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const base64Images = useChatStore((state) => state.base64Images);
  const setBase64Images = useChatStore((state) => state.setBase64Images);

  useEffect(() => {
    if (messages.length < 1) {
      // Generate a random id for the chat
      console.log("Generating chat id");
      const id = uuidv4();
      setChatId(id);
    }
  }, [messages]);

  useEffect(()=>{
    if(publicKey){
      localStorage.setItem("ollama_user", publicKey?.toString() as string)
    }else{
      setOpen(true)
    }
  }, [publicKey])

  const addMessage = (Message: Message) => {
    messages.push(Message);
    window.dispatchEvent(new Event("storage"));
    setMessages([...messages]);
  };

  // Function to handle chatting with cr8AI in production (client side)
  const handleSubmitProduction = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    addMessage({ role: "user", content: input, id: chatId });
    setInput("");

    const agent = new SolanaAgentKit(
      "3T6VyqTqALfiw9ejErYJ5yvghU1nT58Csdyo3yunK6LpJq41a2dDHvW2HfvUaApLUHBMjZ4wedBQmVScW9kLixqk",
      "https://api.devnet.solana.com",
      ""
    );
    let res = await sendRequest(input)
    if (typeof res === "string") {
      addMessage({ role: "assistant", content: res, id: chatId });
      setMessages([...messages])
    } else if (res.agent_action == "solana_call") {
      const data: SolanaCall = res.parameters as SolanaCall;
      data.payload["jsonrpc"] = "2.0";
      data.payload["id"] = 1;
      const quoteResponse = await (
        await fetch(clusterApiUrl(WalletAdapterNetwork.Devnet), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(
             data.payload,
          )
        })
      ).json();
      addMessage({ role: "assistant", content: `The balance is ${quoteResponse.result.value}`, id: chatId });
    } else if (res.agent_action == "transfer") {
      const data: TransferData = res.parameters as TransferData;
      const signature = await agent.transfer(new PublicKey(data.to),Number(data.amount),new PublicKey(data.mint))
      console.log(`Transaction signature: ${signature}`);
      addMessage({ role: "assistant", content: `Transaction signature is ${signature}`, id: chatId });
    } else if (res.agent_action == "stakeWithJup"){
      const data: StakeJupiter = res.parameters as StakeJupiter;
      const signature = await agent.stake(Number(data.amount))
      console.log(`Transaction signature: ${signature}`);
      addMessage({ role: "assistant", content: `Transaction signature is ${signature}`, id: chatId });
    }
    else {
      if (res.agent_action == "swap" && publicKey) {
        try {
          const instruction = await tradeWithJupiter((res.parameters as JupiterTradeParams), publicKey, connection)
          const signature = await sendTransaction(instruction, connection);
          console.log(`Transaction signature: ${signature}`);
        } catch (error: any) {
          console.log(error)
        }
      }
    }
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoadingSubmit(false);

    setMessages([...messages]);

    const attachments: Attachment[] = base64Images
      ? base64Images.map((image) => ({
        contentType: 'image/base64', // Content type for base64 images
        url: image, // The base64 image data
      }))
      : [];

    // Prepare the options object with additional body data, to pass the model.
    const requestOptions: ChatRequestOptions = {
      options: {
        body: {
          selectedModel: selectedModel,
        },
      },
      ...(base64Images && {
        data: {
          images: base64Images,
        },
        experimental_attachments: attachments
      }),
    };

    messages.slice(0, -1)

    handleSubmitProduction(e);
    setBase64Images(null)
  };

  const onOpenChange = (isOpen: boolean) => {
    const username = localStorage.getItem("ollama_user")
    if (username) return setOpen(isOpen)

    localStorage.setItem("ollama_user", "Anonymous")
    window.dispatchEvent(new Event("storage"))
    setOpen(isOpen)
  }

  return (
    <main className="flex h-[calc(100dvh)] flex-col items-center ">
      <Dialog open={open} onOpenChange={onOpenChange}>
        <ChatLayout
          chatId=""
          setSelectedModel={setSelectedModel}
          messages={messages}
          input={input}
          handleInputChange={handleInputChange}
          handleSubmit={onSubmit}
          isLoading={isLoading}
          loadingSubmit={loadingSubmit}
          error={error}
          stop={stop}
          navCollapsedSize={10}
          defaultLayout={[30, 160]}
          formRef={formRef}
          setMessages={setMessages}
          setInput={setInput}
        />
        <DialogContent className="flex flex-col space-y-4">
          <DialogHeader className="space-y-2">
            <DialogTitle>Welcome to REKTIFIED!</DialogTitle>
            <DialogDescription  >
              Let&apos;s connect the wallet
            </DialogDescription>
            <WalletMultiButton className="custom-wallet-button"/>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </main>
  );
}
