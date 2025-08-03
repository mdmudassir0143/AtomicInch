import { NextResponse } from "next/server"
import crypto from "crypto"

// In-memory storage for demo purposes
const swapSessions = new Map()

export async function POST(request: Request) {
  try {
    const { direction, amount, secretHash, recipientAddress } = await request.json()

    // Generate unique session ID
    const sessionId = crypto.randomBytes(16).toString("hex")

    // Set timelock to 24 hours from now
    const timelock = Date.now() + 24 * 60 * 60 * 1000

    // Add gas price fetching at the beginning of the POST function
    const gasResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/gas-prices`)
    const gasData = await gasResponse.json()

    // Prepare Ethereum HTLC contract call
    const ethereumTx = {
      to: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6", // Mock HTLC contract
      data: {
        function: "createHTLC",
        parameters: {
          recipient: recipientAddress,
          hashlock: secretHash,
          timelock: Math.floor(timelock / 1000), // Unix timestamp
          amount: amount,
          tokenAddress: direction === "eth-to-algo" ? "0xA0b86a33E6441e6e80D0c4C6C7527d72E1d7c4e7" : null,
        },
      },
      value: direction === "eth-to-algo" ? amount : "0",
      gasLimit: "200000",
      // Use real-time gas prices
      maxFeePerGas: gasData.success ? gasData.gasPrices.ethereum.medium.maxFeePerGas + "000000000" : "30000000000", // Convert gwei to wei
      maxPriorityFeePerGas: gasData.success
        ? gasData.gasPrices.ethereum.medium.maxPriorityFeePerGas + "000000000"
        : "2000000000",
      estimatedCost: gasData.success ? gasData.costs.ethToAlgo.ethereum : null,
    }

    // Prepare Algorand LogicSig transaction
    const algorandTx = {
      type: "appl", // Application call
      from: "SENDER_ALGORAND_ADDRESS_HERE",
      to: recipientAddress,
      appId: 123456789, // Mock LogicSig app ID
      appArgs: [
        Buffer.from("htlc_create").toString("base64"),
        Buffer.from(secretHash, "hex").toString("base64"),
        Buffer.from(timelock.toString()).toString("base64"),
      ],
      amount: direction === "algo-to-eth" ? Number.parseInt(amount) * 1000000 : 0, // Convert to microAlgos
      fee: 1000,
      firstRound: 12345678,
      lastRound: 12345678 + 1000,
      genesisID: "testnet-v1.0",
      genesisHash: "SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=",
    }

    // Add gas pricing info to the session
    const session = {
      id: sessionId,
      direction,
      amount,
      secretHash,
      recipientAddress,
      ethereumTx,
      algorandTx,
      status: "pending",
      timelock,
      createdAt: Date.now(),
      gasPricing: gasData.success
        ? {
            ethereum: gasData.gasPrices.ethereum.medium,
            algorand: gasData.gasPrices.algorand,
            estimatedCost: gasData.costs[direction === "eth-to-algo" ? "ethToAlgo" : "algoToEth"],
          }
        : null,
    }

    // Store session
    swapSessions.set(sessionId, session)

    console.log("🔄 Atomic Swap Initiated:")
    console.log("Session ID:", sessionId)
    console.log("Direction:", direction)
    console.log("Amount:", amount)
    console.log("Secret Hash:", secretHash)
    console.log("Recipient:", recipientAddress)
    console.log("Timelock:", new Date(timelock).toISOString())
    console.log("\n📋 Ethereum HTLC Contract Call:")
    console.log(JSON.stringify(ethereumTx, null, 2))
    console.log("\n🔷 Algorand LogicSig Transaction:")
    console.log(JSON.stringify(algorandTx, null, 2))

    return NextResponse.json(session)
  } catch (error) {
    console.error("Error initiating swap:", error)
    return NextResponse.json({ error: "Failed to initiate swap" }, { status: 500 })
  }
}

export async function GET() {
  // Return all active sessions for debugging
  const sessions = Array.from(swapSessions.values())
  return NextResponse.json({ sessions })
}
