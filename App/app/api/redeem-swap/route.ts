import { NextResponse } from "next/server"
import crypto from "crypto"

// Access the same in-memory storage
const swapSessions = new Map()

export async function POST(request: Request) {
  try {
    const { sessionId, secret } = await request.json()

    const session = swapSessions.get(sessionId)
    if (!session) {
      return NextResponse.json({ success: false, error: "Session not found" }, { status: 404 })
    }

    // Check if swap has expired
    if (Date.now() > session.timelock) {
      return NextResponse.json({ success: false, error: "Swap has expired" }, { status: 400 })
    }

    // Verify secret matches the hash
    const providedHash = crypto.createHash("sha256").update(secret).digest("hex")
    if (providedHash !== session.secretHash) {
      console.log("❌ Secret verification failed:")
      console.log("Provided hash:", providedHash)
      console.log("Expected hash:", session.secretHash)

      return NextResponse.json({ success: false, error: "Invalid secret" }, { status: 400 })
    }

    // Prepare redemption transactions
    const ethereumRedeemTx = {
      to: session.ethereumTx.to,
      data: {
        function: "redeemHTLC",
        parameters: {
          secret: secret,
          sessionId: sessionId,
        },
      },
      gasLimit: "150000",
      gasPrice: "20000000000",
    }

    const algorandRedeemTx = {
      type: "appl",
      from: session.recipientAddress,
      appId: session.algorandTx.appId,
      appArgs: [
        Buffer.from("htlc_redeem").toString("base64"),
        Buffer.from(secret, "hex").toString("base64"),
        Buffer.from(sessionId).toString("base64"),
      ],
      fee: 1000,
      firstRound: 12345678,
      lastRound: 12345678 + 1000,
      genesisID: "testnet-v1.0",
      genesisHash: "SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=",
    }

    // Update session status
    session.status = "completed"
    session.redeemedAt = Date.now()
    session.secret = secret
    swapSessions.set(sessionId, session)

    console.log("✅ Swap Redeemed Successfully:")
    console.log("Session ID:", sessionId)
    console.log("Secret:", secret)
    console.log("Hash verified:", providedHash)
    console.log("\n🔓 Ethereum Redeem Transaction:")
    console.log(JSON.stringify(ethereumRedeemTx, null, 2))
    console.log("\n🔷 Algorand Redeem Transaction:")
    console.log(JSON.stringify(algorandRedeemTx, null, 2))
    console.log("\n🎉 Atomic swap completed successfully!")

    return NextResponse.json({
      success: true,
      session,
      ethereumRedeemTx,
      algorandRedeemTx,
      message: "Swap redeemed successfully!",
    })
  } catch (error) {
    console.error("Error redeeming swap:", error)
    return NextResponse.json({ error: "Failed to redeem swap" }, { status: 500 })
  }
}
