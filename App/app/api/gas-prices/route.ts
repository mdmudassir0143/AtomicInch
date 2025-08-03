import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("⛽ Fetching gas prices from 1inch API...")

    // Fetch Ethereum gas prices from 1inch
    const url = "https://api.1inch.dev/gas-price/v1.6/1" // Chain ID 1 for Ethereum mainnet
    const config = {
      headers: {
        Authorization: "Bearer qXTzONrIIx2qUg04DEnHtwtu9DBI7hOZ",
        "Content-Type": "application/json",
      },
    }

    const response = await fetch(url, config)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const ethGasData = await response.json()

    console.log("📊 Ethereum Gas Prices Response:")
    console.log(JSON.stringify(ethGasData, null, 2))

    // Process gas prices for better display
    const processedGasPrices = {
      ethereum: {
        baseFee: ethGasData.baseFee,
        low: {
          maxFeePerGas: Number.parseFloat(ethGasData.low.maxFeePerGas / 1e9).toFixed(2), // Convert to gwei
          maxPriorityFeePerGas: Number.parseFloat(ethGasData.low.maxPriorityFeePerGas / 1e9).toFixed(2),
        },
        medium: {
          maxFeePerGas: Number.parseFloat(ethGasData.medium.maxFeePerGas / 1e9).toFixed(2),
          maxPriorityFeePerGas: Number.parseFloat(ethGasData.medium.maxPriorityFeePerGas / 1e9).toFixed(2),
        },
        high: {
          maxFeePerGas: Number.parseFloat(ethGasData.high.maxFeePerGas / 1e9).toFixed(2),
          maxPriorityFeePerGas: Number.parseFloat(ethGasData.high.maxPriorityFeePerGas / 1e9).toFixed(2),
        },
        instant: {
          maxFeePerGas: Number.parseFloat(ethGasData.instant.maxFeePerGas / 1e9).toFixed(2),
          maxPriorityFeePerGas: Number.parseFloat(ethGasData.instant.maxPriorityFeePerGas / 1e9).toFixed(2),
        },
      },
      algorand: {
        fixedFee: "0.001", // Fixed fee in ALGO
        feeInMicroAlgos: 1000, // 0.001 ALGO = 1000 microAlgos
      },
      lastUpdated: new Date().toLocaleTimeString(),
    }

    // Calculate estimated swap costs
    const swapCosts = calculateSwapCosts(processedGasPrices)

    console.log("💰 Calculated Swap Costs:")
    console.log(JSON.stringify(swapCosts, null, 2))

    return NextResponse.json({
      success: true,
      gasPrices: processedGasPrices,
      costs: swapCosts,
      rawEthereumData: ethGasData,
    })
  } catch (error) {
    console.error("❌ Error fetching gas prices:", error)

    // Return fallback gas prices if API fails
    const fallbackGasPrices = {
      ethereum: {
        baseFee: "20",
        low: { maxFeePerGas: "25", maxPriorityFeePerGas: "1" },
        medium: { maxFeePerGas: "30", maxPriorityFeePerGas: "2" },
        high: { maxFeePerGas: "40", maxPriorityFeePerGas: "3" },
        instant: { maxFeePerGas: "50", maxPriorityFeePerGas: "5" },
      },
      algorand: {
        fixedFee: "0.001",
        feeInMicroAlgos: 1000,
      },
      lastUpdated: new Date().toLocaleTimeString(),
    }

    return NextResponse.json(
      {
        success: false,
        gasPrices: fallbackGasPrices,
        costs: calculateSwapCosts(fallbackGasPrices),
        error: "Using fallback gas prices",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 200 }, // Return 200 with fallback data
    )
  }
}

function calculateSwapCosts(gasPrices: any) {
  // Estimated gas usage for different operations
  const gasEstimates = {
    htlcCreate: 200000, // Gas for creating HTLC
    htlcRedeem: 150000, // Gas for redeeming HTLC
    tokenTransfer: 65000, // Gas for ERC-20 transfer
  }

  // Mock ETH price for cost calculation (in production, fetch from price API)
  const ethPriceUSD = 2500

  // Calculate costs for different priority levels
  const ethCosts = {}
  for (const priority of ["low", "medium", "high", "instant"]) {
    const maxFeeGwei = Number.parseFloat(gasPrices.ethereum[priority].maxFeePerGas)
    const totalGasForSwap = gasEstimates.htlcCreate + gasEstimates.htlcRedeem

    const costInEth = (totalGasForSwap * maxFeeGwei) / 1e9 // Convert gwei to ETH
    const costInUSD = costInEth * ethPriceUSD

    ethCosts[priority] = {
      eth: costInEth.toFixed(6),
      usd: costInUSD.toFixed(2),
      gasUsed: totalGasForSwap,
    }
  }

  // Algorand costs (fixed)
  const algoCosts = {
    algo: "0.002", // 2 transactions * 0.001 ALGO
    usd: "0.50", // Assuming 1 ALGO = $0.25
    transactions: 2,
  }

  return {
    ethToAlgo: {
      ethereum: ethCosts.medium, // Use medium priority as default
      algorand: algoCosts,
      total: {
        usd: (Number.parseFloat(ethCosts.medium.usd) + Number.parseFloat(algoCosts.usd)).toFixed(2),
      },
    },
    algoToEth: {
      algorand: algoCosts,
      ethereum: ethCosts.medium,
      total: {
        usd: (Number.parseFloat(algoCosts.usd) + Number.parseFloat(ethCosts.medium.usd)).toFixed(2),
      },
    },
    breakdown: {
      ethereum: ethCosts,
      algorand: algoCosts,
    },
  }
}
