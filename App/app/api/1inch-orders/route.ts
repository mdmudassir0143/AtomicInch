import { NextResponse } from "next/server"

export async function GET() {
  try {
    const url = "https://api.1inch.dev/fusion-plus/orders/v1.0/order/ready-to-execute-public-actions"

    const config = {
      headers: {
        Authorization: "Bearer qXTzONrIIx2qUg04DEnHtwtu9DBI7hOZ",
        "Content-Type": "application/json",
      },
    }

    console.log("🔍 Fetching 1inch Fusion+ orders...")

    const response = await fetch(url, config)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    console.log("📊 1inch Orders Response:")
    console.log("Total actions:", data.actions?.length || 0)

    if (data.actions && data.actions.length > 0) {
      console.log("Sample order structure:")
      console.log(JSON.stringify(data.actions[0], null, 2))
    }

    // Process and enhance the orders data
    const processedOrders =
      data.actions?.map((order: any, index: number) => ({
        ...order,
        id: `1inch-${index}`,
        source: "1inch-fusion",
        timestamp: Date.now(),
        // Extract key information for easier access
        orderInfo: {
          hash: order.immutables?.allOf?.[0]?.orderHash,
          amount: order.immutables?.allOf?.[0]?.amount,
          maker: order.immutables?.allOf?.[0]?.maker,
          taker: order.immutables?.allOf?.[0]?.taker,
          token: order.immutables?.allOf?.[0]?.token,
          hashlock: order.immutables?.allOf?.[0]?.hashlock,
          timelocks: order.immutables?.allOf?.[0]?.timelocks,
          safetyDeposit: order.immutables?.allOf?.[0]?.safetyDeposit,
        },
      })) || []

    console.log(`✅ Successfully processed ${processedOrders.length} orders`)

    return NextResponse.json({
      success: true,
      actions: processedOrders,
      totalCount: processedOrders.length,
      fetchedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Error fetching 1inch orders:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch 1inch orders",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
