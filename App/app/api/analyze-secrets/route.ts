import { NextResponse } from "next/server"
import crypto from "crypto"

export async function POST(request: Request) {
  try {
    const { orderHash, secretsData } = await request.json()

    console.log("🔬 Analyzing secrets for order:", orderHash)

    // Analyze the secrets structure
    const analysis = {
      orderHash,
      orderType: secretsData.orderType,
      secretsAnalysis: {
        totalSecrets: secretsData.secrets?.length || 0,
        secretsRevealed: secretsData.secrets?.filter((s: any) => s.secret && s.secret !== "0x").length || 0,
        secretIndexes: secretsData.secrets?.map((s: any) => s.idx) || [],
      },
      hashAnalysis: {
        totalHashes: secretsData.secretHashes?.length || 0,
        hashes: secretsData.secretHashes || [],
      },
      immutablesAnalysis: {
        srcCount: secretsData.srcImmutables?.length || 0,
        dstCount: secretsData.dstImmutables?.length || 0,
        hashlockMatches: [],
        timelockInfo: [],
      },
      atomicSwapCompatibility: {
        canCreateSwap: false,
        missingComponents: [],
        recommendations: [],
      },
    }

    // Analyze hashlock compatibility
    const allImmutables = [...(secretsData.srcImmutables || []), ...(secretsData.dstImmutables || [])]

    for (const immutable of allImmutables) {
      if (immutable.hashlock) {
        // Check if we have a matching secret
        const matchingSecret = secretsData.secrets?.find((s: any) => {
          if (!s.secret || s.secret === "0x") return false

          // Verify if the secret hashes to the hashlock
          try {
            const secretHash = crypto.createHash("sha256").update(s.secret.replace("0x", ""), "hex").digest("hex")
            return secretHash === immutable.hashlock.replace("0x", "")
          } catch {
            return false
          }
        })

        analysis.immutablesAnalysis.hashlockMatches.push({
          orderHash: immutable.orderHash,
          hashlock: immutable.hashlock,
          hasMatchingSecret: !!matchingSecret,
          secretIndex: matchingSecret?.idx,
          maker: immutable.maker,
          taker: immutable.taker,
          amount: immutable.amount,
          token: immutable.token,
        })
      }

      if (immutable.timelocks) {
        analysis.immutablesAnalysis.timelockInfo.push({
          orderHash: immutable.orderHash,
          timelocks: immutable.timelocks,
          estimatedExpiry: new Date(Date.now() + immutable.timelocks * 1000).toISOString(),
        })
      }
    }

    // Determine atomic swap compatibility
    const hasValidHashlocks = analysis.immutablesAnalysis.hashlockMatches.some((h) => h.hasMatchingSecret)
    const hasTimelocks = analysis.immutablesAnalysis.timelockInfo.length > 0
    const hasRevealedSecrets = analysis.secretsAnalysis.secretsRevealed > 0

    analysis.atomicSwapCompatibility.canCreateSwap = hasValidHashlocks && hasTimelocks && hasRevealedSecrets

    if (!hasValidHashlocks) {
      analysis.atomicSwapCompatibility.missingComponents.push("valid hashlock-secret pairs")
    }
    if (!hasTimelocks) {
      analysis.atomicSwapCompatibility.missingComponents.push("timelock mechanisms")
    }
    if (!hasRevealedSecrets) {
      analysis.atomicSwapCompatibility.missingComponents.push("revealed secrets")
    }

    // Generate recommendations
    if (analysis.atomicSwapCompatibility.canCreateSwap) {
      analysis.atomicSwapCompatibility.recommendations.push("✅ Order is compatible with atomic swap creation")
      analysis.atomicSwapCompatibility.recommendations.push("🔄 Use revealed secrets to initialize cross-chain swap")
    } else {
      analysis.atomicSwapCompatibility.recommendations.push("❌ Order not ready for atomic swap")
      analysis.atomicSwapCompatibility.recommendations.push("⏳ Wait for secrets to be revealed or timelock to expire")
    }

    console.log("📊 Secrets Analysis Complete:")
    console.log("Total secrets:", analysis.secretsAnalysis.totalSecrets)
    console.log("Revealed secrets:", analysis.secretsAnalysis.secretsRevealed)
    console.log("Atomic swap compatible:", analysis.atomicSwapCompatibility.canCreateSwap)

    return NextResponse.json({
      success: true,
      analysis,
      analyzedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Error analyzing secrets:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to analyze secrets",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
