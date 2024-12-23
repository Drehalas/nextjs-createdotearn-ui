# REKTIFIED

REKTIFIED is an innovative web application designed to simplify stablecoins and amplify rewards, offering a seamless and secure user experience for cryptocurrency enthusiasts.

## Features

- **Wallet Integration**: Connect your Solana-compatible wallets (Phantom, Trust, Magic Eden, etc.) effortlessly.
- **Responsive UI**: Modern and intuitive interface designed for both desktop and mobile devices.
- **Chat Integration**: Interact with Cr8AI using a sophisticated chatbot powered by LangChain.
- **Real-time Transactions**: Execute trades and swaps securely using Jupiter integration.

## Tech Stack

- **Frontend**: Next.js, Tailwind CSS
- **Wallet Integration**: Solana Wallet Adapter
- **Backend**: Node.js, API integrations
- **Blockchain**: Solana Network
- **Styling**: Custom CSS for enhanced UI experience

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd cr8ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file with the following values:
   ```env
   NEXT_PUBLIC_SOLANA_NETWORK=devnet
   NEXT_PUBLIC_RPC_ENDPOINT=https://api.devnet.solana.com
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## How to Use

1. **Connect a Wallet**: Click the "Select Wallet" button to connect your Solana-compatible wallet.
2. **Chat with Cr8AI**: Use the chatbot to interact and make requests.
3. **Execute Transactions**: Perform real-time swaps and trades using the integrated Jupiter protocol.
4. **Customize UI**: Personalize themes and layouts via the settings panel.

## Development Notes

- Ensure that the Solana Wallet Adapter libraries are correctly installed and imported.
- Custom CSS has been applied to override default wallet styles in `wallet.css`.
- The project follows conventional commit standards for Git messages.

## Contributing

We welcome contributions! Please fork the repository and create a pull request with your changes. Make sure to adhere to the project's coding standards and test your features thoroughly.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

For questions or feedback, reach out to us at **support@cr8ai.com**.

---

We’re excited to see how Cr8AI can simplify and amplify your crypto experience!
