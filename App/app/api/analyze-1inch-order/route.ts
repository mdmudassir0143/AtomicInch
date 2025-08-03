import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { orderId, orderData } = await request.json()

    console.log("🔍 Analyzing 1inch order:", orderId)

    // Extract order details
    const orderInfo = orderData.orderInfo || {}
    const immutables = orderData.immutables?.allOf?.[0] || {}

    // Analyze the hashlock mechanism
    const hashlockAnalysis = {
      present: !!immutables.hashlock,
      hash: immutables.hashlock,
      algorithm: "SHA-256", // Assuming standard
      length: immutables.hashlock ? immutables.hashlock.length : 0,
    }

    // Analyze timelock mechanism
    const timelockAnalysis = {
      present: !!immutables.timelocks,
      timelocks: immutables.timelocks,
      expirationEstimate: immutables.timelocks
        ? new Date(Date.now() + immutables.timelocks * 1000).toISOString()
        : null,
    }

    // Generate compatibility assessment
    const compatibility = {
      canIntegrateWithAtomicSwap: hashlockAnalysis.present && timelockAnalysis.present,
      missingFeatures: [],
      recommendations: [],
    }

    if (!hashlockAnalysis.present) {
      compatibility.missingFeatures.push("hashlock")
      compatibility.recommendations.push("Add hashlock mechanism for secret verification")
    }

    if (!timelockAnalysis.present) {
      compatibility.missingFeatures.push("timelock")
      compatibility.recommendations.push("Add timelock mechanism for expiration handling")
    }

    // Create atomic swap proposal
    const atomicSwapProposal = {
      sourceChain: orderData.chainId || "ethereum",
      targetChain: "algorand", // Default target
      amount: immutables.amount,
      hashlock: immutables.hashlock,
      timelock: immutables.timelocks,
      maker: immutables.maker,
      taker: immutables.taker,
      safetyDeposit: immutables.safetyDeposit,
      estimatedGas: {
        ethereum: "200000",
        algorand: "1000",
      },
    }

    const analysis = {
      orderId,
      orderInfo,
      hashlockAnalysis,
      timelockAnalysis,
      compatibility,
      atomicSwapProposal,
      analyzedAt: new Date().toISOString(),
    }

    console.log("📊 Order Analysis Complete:")
    console.log("Hashlock present:", hashlockAnalysis.present)
    console.log("Timelock present:", timelockAnalysis.present)
    console.log("Atomic swap compatible:", compatibility.canIntegrateWithAtomicSwap)

    return NextResponse.json({
      success: true,
      analysis,
    })
  } catch (error) {
    console.error("❌ Error analyzing 1inch order:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to analyze order",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
