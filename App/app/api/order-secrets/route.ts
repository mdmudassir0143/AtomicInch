import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { orderHash } = await request.json()

    if (!orderHash) {
      return NextResponse.json({ error: "Order hash is required" }, { status: 400 })
    }

    console.log("🔍 Fetching secrets for order hash:", orderHash)

    const url = `https://api.1inch.dev/fusion-plus/orders/v1.0/order/secrets/${orderHash}`
    const config = {
      headers: {
        Authorization: "Bearer qXTzONrIIx2qUg04DEnHtwtu9DBI7hOZ",
        "Content-Type": "application/json",
      },
    }

    const response = await fetch(url, config)

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: "Order not found or no secrets available" }, { status: 404 })
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const secretsData = await response.json()

    console.log("🔐 Order Secrets Response:")
    console.log("Order Type:", secretsData.orderType)
    console.log("Secrets count:", secretsData.secrets?.length || 0)
    console.log("Secret hashes count:", secretsData.secretHashes?.length || 0)

    if (secretsData.secrets && secretsData.secrets.length > 0) {
      console.log("Sample secret:")
      console.log(JSON.stringify(secretsData.secrets[0], null, 2))
    }

    // Process and enhance the secrets data
    const processedSecrets = {
      ...secretsData,
      orderHash,
      fetchedAt: new Date().toISOString(),
      // Extract key information for easier access
      summary: {
        orderType: secretsData.orderType,
        secretsCount: secretsData.secrets?.length || 0,
        secretHashesCount: secretsData.secretHashes?.length || 0,
        hasSrcImmutables: !!secretsData.srcImmutables,
        hasDstImmutables: !!secretsData.dstImmutables,
      },
      // Flatten immutables for easier access
      immutablesInfo: {
        src:
          secretsData.srcImmutables?.map((item: any) => ({
            orderHash: item.orderHash,
            hashlock: item.hashlock,
            maker: item.maker,
            taker: item.taker,
            token: item.token,
            amount: item.amount,
            safetyDeposit: item.safetyDeposit,
            timelocks: item.timelocks,
          })) || [],
        dst:
          secretsData.dstImmutables?.map((item: any) => ({
            orderHash: item.orderHash,
            hashlock: item.hashlock,
            maker: item.maker,
            taker: item.taker,
            token: item.token,
            amount: item.amount,
            safetyDeposit: item.safetyDeposit,
            timelocks: item.timelocks,
          })) || [],
      },
    }

    console.log("✅ Successfully processed order secrets")

    return NextResponse.json(processedSecrets)
  } catch (error) {
    console.error("❌ Error fetching order secrets:", error)

    return NextResponse.json(
      {
        error: "Failed to fetch order secrets",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
