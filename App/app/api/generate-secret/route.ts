import { NextResponse } from "next/server"
import crypto from "crypto"

export async function POST() {
  try {
    // Generate a random 32-byte secret
    const secret = crypto.randomBytes(32).toString("hex")

    // Create SHA-256 hash of the secret
    const hash = crypto.createHash("sha256").update(secret).digest("hex")

    console.log("🔐 Generated new secret:")
    console.log("Secret:", secret)
    console.log("Hash:", hash)

    return NextResponse.json({
      secret,
      hash,
      message: "Secret generated successfully. Store the secret safely!",
    })
  } catch (error) {
    console.error("Error generating secret:", error)
    return NextResponse.json({ error: "Failed to generate secret" }, { status: 500 })
  }
}
