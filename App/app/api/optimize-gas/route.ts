import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { swapAmount, urgency, direction } = await request.json()

    console.log("🎯 Optimizing gas for swap:", { swapAmount, urgency, direction })

    // Fetch current gas prices
    const gasResponse = await fetch("/api/gas-prices", {
      headers: {
        "Content-Type": "application/json",
      },
    })
    const gasData = await gasResponse.json()

    if (!gasData.success) {
      throw new Error("Failed to fetch gas prices")
    }

    const gasPrices = gasData.gasPrices

    // Determine optimal gas strategy based on urgency and swap amount
    let recommendedPriority = "medium" // default

    if (urgency === "high" || Number.parseFloat(swapAmount) > 10000) {
      recommendedPriority = "high"
    } else if (urgency === "low" && Number.parseFloat(swapAmount) < 1000) {
      recommendedPriority = "low"
    } else if (urgency === "instant") {
      recommendedPriority = "instant"
    }

    // Calculate time estimates for different priorities
    const timeEstimates = {
      low: "5-10 minutes",
      medium: "2-5 minutes",
      high: "1-2 minutes",
      instant: "< 1 minute",
    }

    // Generate optimization recommendations
    const recommendations = []

    if (recommendedPriority === "low") {
      recommendations.push("💡 Consider waiting for lower network congestion to save on fees")
    }

    if (Number.parseFloat(swapAmount) > 5000) {
      recommendations.push("🔒 High-value swap detected - consider using higher gas priority for security")
    }

    if (direction === "eth-to-algo") {
      recommendations.push("⚡ Algorand side has fixed low fees - Ethereum gas is the main cost factor")
    }

    // Calculate potential savings
    const lowCost = Number.parseFloat(gasData.costs.breakdown.ethereum.low.usd)
    const highCost = Number.parseFloat(gasData.costs.breakdown.ethereum.high.usd)
    const potentialSavings = highCost - lowCost

    const optimization = {
      recommendedPriority,
      estimatedTime: timeEstimates[recommendedPriority],
      gasPrice: gasPrices.ethereum[recommendedPriority],
      estimatedCost: gasData.costs.breakdown.ethereum[recommendedPriority],
      recommendations,
      alternatives: {
        fastest: {
          priority: "instant",
          time: timeEstimates.instant,
          cost: gasData.costs.breakdown.ethereum.instant,
        },
        cheapest: {
          priority: "low",
          time: timeEstimates.low,
          cost: gasData.costs.breakdown.ethereum.low,
        },
      },
      potentialSavings: {
        amount: potentialSavings.toFixed(2),
        percentage: ((potentialSavings / highCost) * 100).toFixed(1),
      },
      algorandCost: gasData.costs.breakdown.algorand,
    }

    console.log("⚡ Gas Optimization Result:")
    console.log("Recommended priority:", recommendedPriority)
    console.log("Estimated cost:", optimization.estimatedCost.usd, "USD")
    console.log("Potential savings:", optimization.potentialSavings.amount, "USD")

    return NextResponse.json({
      success: true,
      optimization,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Error optimizing gas:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to optimize gas",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
