import { NextResponse } from "next/server"
import crypto from "crypto"

// Access the same in-memory storage as other swap endpoints
const swapSessions = new Map()

export async function POST(request: Request) {
  try {
    const { inchOrderId, inchOrderData, recipientAddress, targetChain } = await request.json()

    console.log("🔄 Creating atomic swap from 1inch order:", inchOrderId)

    // Extract order information
    const orderInfo = inchOrderData.orderInfo || {}
    const immutables = inchOrderData.immutables?.allOf?.[0] || {}

    // Generate unique session ID
    const sessionId = crypto.randomBytes(16).toString("hex")

    // Use existing hashlock from 1inch order or generate new one
    const secretHash = immutables.hashlock || crypto.randomBytes(32).toString("hex")

    // Calculate timelock (use 1inch timelock or default to 24 hours)
    const timelock = immutables.timelocks ? Date.now() + immutables.timelocks * 1000 : Date.now() + 24 * 60 * 60 * 1000

    // Determine swap direction based on source chain
    const sourceChain = inchOrderData.chainId || "1" // Ethereum mainnet
    const direction = sourceChain === "1" ? "eth-to-algo" : "algo-to-eth"

    // Create enhanced Ethereum HTLC contract call
    const ethereumTx = {
      to: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6", // Mock HTLC contract
      data: {
        function: "createHTLCFrom1inch",
        parameters: {
          recipient: recipientAddress,
          hashlock: secretHash,
          timelock: Math.floor(timelock / 1000),
          amount: immutables.amount || "0",
          tokenAddress: immutables.token,
          originalOrderHash: immutables.orderHash,
          maker: immutables.maker,
          taker: immutables.taker,
          safetyDeposit: immutables.safetyDeposit,
        },
      },
      value: direction === "eth-to-algo" ? immutables.amount || "0" : "0",
      gasLimit: "250000", // Higher gas for 1inch integration
      gasPrice: "25000000000", // 25 gwei
    }

    // Create enhanced Algorand LogicSig transaction
    const algorandTx = {
      type: "appl",
      from: "SENDER_ALGORAND_ADDRESS_HERE",
      to: recipientAddress,
      appId: 123456789, // Mock LogicSig app ID
      appArgs: [
        Buffer.from("htlc_create_1inch").toString("base64"),
        Buffer.from(secretHash, "hex").toString("base64"),
        Buffer.from(timelock.toString()).toString("base64"),
        Buffer.from(inchOrderId).toString("base64"),
      ],
      amount: direction === "algo-to-eth" ? Number.parseInt(immutables.amount || "0") * 1000000 : 0,
      fee: 2000, // Higher fee for complex transaction
      firstRound: 12345678,
      lastRound: 12345678 + 1000,
      genesisID: "testnet-v1.0",
      genesisHash: "SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=",
      note: Buffer.from(`1inch-integration-${inchOrderId}`).toString("base64"),
    }

    const session = {
      id: sessionId,
      direction,
      amount: immutables.amount || "0",
      secretHash,
      recipientAddress,
      ethereumTx,
      algorandTx,
      status: "pending",
      timelock,
      createdAt: Date.now(),
      source: "1inch-fusion",
      originalOrder: {
        id: inchOrderId,
        data: inchOrderData,
        orderHash: immutables.orderHash,
        maker: immutables.maker,
        taker: immutables.taker,
      },
    }

    // Store session
    swapSessions.set(sessionId, session)

    console.log("🎯 1inch-Integrated Atomic Swap Created:")
    console.log("Session ID:", sessionId)
    console.log("Original 1inch Order:", inchOrderId)
    console.log("Direction:", direction)
    console.log("Amount:", immutables.amount)
    console.log("Hashlock:", secretHash)
    console.log("Timelock:", new Date(timelock).toISOString())
    console.log("\n📋 Enhanced Ethereum HTLC Contract Call:")
    console.log(JSON.stringify(ethereumTx, null, 2))
    console.log("\n🔷 Enhanced Algorand LogicSig Transaction:")
    console.log(JSON.stringify(algorandTx, null, 2))

    return NextResponse.json({
      success: true,
      session,
      message: "Atomic swap created from 1inch order successfully",
    })
  } catch (error) {
    console.error("❌ Error creating swap from 1inch order:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create swap from 1inch order",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
