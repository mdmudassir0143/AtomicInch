"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowRightLeft, Hash, Key, Clock, Shield, TrendingUp, Terminal, Zap, Eye, AlertCircle } from "lucide-react"

interface SwapSession {
  id: string
  direction: string
  amount: string
  secretHash: string
  recipientAddress: string
  ethereumTx?: any
  algorandTx?: any
  status: string
  timelock: number
}

export default function AtomicSwapCoordinator() {
  const [swapDirection, setSwapDirection] = useState("")
  const [amount, setAmount] = useState("")
  const [secretHash, setSecretHash] = useState("")
  const [recipientAddress, setRecipientAddress] = useState("")
  const [currentSession, setCurrentSession] = useState<SwapSession | null>(null)
  const [redeemSecret, setRedeemSecret] = useState("")
  const [loading, setLoading] = useState(false)
  const [inchOrders, setInchOrders] = useState([])
  const [activeTab, setActiveTab] = useState<"create" | "redeem" | "market" | "secrets">("create")
  const [gasPrices, setGasPrices] = useState(null)
  const [swapCosts, setSwapCosts] = useState(null)
  const [orderSecrets, setOrderSecrets] = useState(null)
  const [selectedOrderHash, setSelectedOrderHash] = useState("")
  const [error, setError] = useState("")

  const generateSecret = async () => {
    setLoading(true)
    setError("")
    try {
      const response = await fetch("/api/generate-secret", {
        method: "POST",
      })
      const data = await response.json()
      if (data.hash) {
        setSecretHash(data.hash)
      } else {
        setError("Failed to generate secret")
      }
    } catch (error) {
      console.error("Error generating secret:", error)
      setError("Error generating secret")
    }
    setLoading(false)
  }

  const initiateSwap = async () => {
    if (!swapDirection || !amount || !secretHash || !recipientAddress) {
      setError("Please fill all fields")
      return
    }

    setLoading(true)
    setError("")
    try {
      const response = await fetch("/api/initiate-swap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          direction: swapDirection,
          amount,
          secretHash,
          recipientAddress,
        }),
      })
      const session = await response.json()
      if (session.id) {
        setCurrentSession(session)
      } else {
        setError("Failed to initiate swap")
      }
    } catch (error) {
      console.error("Error initiating swap:", error)
      setError("Error initiating swap")
    }
    setLoading(false)
  }

  const redeemSwap = async () => {
    if (!currentSession || !redeemSecret) {
      setError("Please enter the secret")
      return
    }

    setLoading(true)
    setError("")
    try {
      const response = await fetch("/api/redeem-swap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: currentSession.id,
          secret: redeemSecret,
        }),
      })
      const result = await response.json()
      if (result.success) {
        setCurrentSession({ ...currentSession, status: "completed" })
        setError("")
      } else {
        setError(result.error || "Invalid secret or swap expired")
      }
    } catch (error) {
      console.error("Error redeeming swap:", error)
      setError("Error redeeming swap")
    }
    setLoading(false)
  }

  const fetch1inchOrders = async () => {
    setLoading(true)
    setError("")
    try {
      const response = await fetch("/api/1inch-orders")
      const data = await response.json()
      setInchOrders(data.actions || [])
    } catch (error) {
      console.error("Error fetching 1inch orders:", error)
      setError("Error fetching 1inch orders")
    }
    setLoading(false)
  }

  const fetchOrderSecrets = async (orderHash: string) => {
    if (!orderHash) return

    setLoading(true)
    setError("")
    try {
      const response = await fetch("/api/order-secrets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderHash }),
      })
      const data = await response.json()
      if (data.error) {
        setError(data.error)
        setOrderSecrets(null)
      } else {
        setOrderSecrets(data)
        setError("")
      }
    } catch (error) {
      console.error("Error fetching order secrets:", error)
      setError("Error fetching order secrets")
    }
    setLoading(false)
  }

  const fetchGasPricesAndCosts = async () => {
    try {
      const response = await fetch("/api/gas-prices")
      const data = await response.json()
      setGasPrices(data.gasPrices)
      setSwapCosts(data.costs)
    } catch (error) {
      console.error("Error fetching gas prices:", error)
    }
  }

  useEffect(() => {
    fetchGasPricesAndCosts()
    const interval = setInterval(fetchGasPricesAndCosts, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-black cyber-grid font-[var(--font-inter)]">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 py-8">
          <h1 className="text-4xl font-[var(--font-space-grotesk)] font-bold text-white tracking-tight">
            ATOMIC SWAP PROTOCOL
          </h1>
          <div className="neon-separator max-w-md mx-auto"></div>
          <p className="text-gray-400 font-light">Cross-chain coordination between Ethereum and Algorand networks</p>
        </div>

        {/* Navigation */}
        <div className="flex justify-center">
          <div className="glass-panel rounded-full p-1 inline-flex space-x-1">
            {[
              { id: "create", icon: ArrowRightLeft, label: "Create" },
              { id: "redeem", icon: Key, label: "Redeem" },
              { id: "market", icon: TrendingUp, label: "Market" },
              { id: "secrets", icon: Eye, label: "Secrets" },
            ].map(({ id, icon: Icon, label }) => (
              <Button
                key={id}
                variant={activeTab === id ? "default" : "ghost"}
                onClick={() => {
                  setActiveTab(id as any)
                  setError("")
                  if (id === "market") fetch1inchOrders()
                }}
                className={`rounded-full px-6 py-2 transition-all duration-200 ${
                  activeTab === id ? "bg-white text-black shadow-lg" : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="glass-panel rounded-lg p-4 border-red-500/20 bg-red-500/10">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Create Swap */}
        {activeTab === "create" && (
          <div className="space-y-8">
            {/* Gas Prices Panel - Only on Create Tab */}
            {gasPrices && (
              <div className="glass-panel rounded-lg p-6 glow-border animate-slide-in">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <Zap className="w-5 h-5 text-white" />
                    <h3 className="text-lg font-[var(--font-space-grotesk)] font-semibold text-white">
                      Network Status
                    </h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={fetchGasPricesAndCosts}
                    className="text-gray-400 hover:text-white"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-300 uppercase tracking-wider">Ethereum EIP-1559</h4>
                    <div className="space-y-2">
                      {["low", "medium", "high", "instant"].map((priority) => (
                        <div
                          key={priority}
                          className="flex justify-between items-center p-3 bg-black/30 rounded border border-white/5"
                        >
                          <span className="capitalize text-sm text-gray-300">{priority}</span>
                          <div className="text-right text-xs font-mono">
                            <div className="text-white">{gasPrices.ethereum[priority]?.maxFeePerGas} gwei</div>
                            <div className="text-gray-500">+{gasPrices.ethereum[priority]?.maxPriorityFeePerGas}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-300 uppercase tracking-wider">Algorand</h4>
                    <div className="p-3 bg-black/30 rounded border border-white/5">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-300">Fixed Fee</span>
                        <span className="text-sm font-mono text-white">0.001 ALGO</span>
                      </div>
                    </div>

                    {swapCosts && (
                      <div className="space-y-3">
                        <h5 className="text-sm font-medium text-gray-300 uppercase tracking-wider">Estimated Costs</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between p-2 bg-black/20 rounded">
                            <span className="text-gray-400">ETH → ALGO</span>
                            <span className="text-white font-mono">${swapCosts.ethToAlgo.total.usd}</span>
                          </div>
                          <div className="flex justify-between p-2 bg-black/20 rounded">
                            <span className="text-gray-400">ALGO → ETH</span>
                            <span className="text-white font-mono">${swapCosts.algoToEth.total.usd}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Create Swap Form */}
            <div className="glass-panel rounded-lg p-8 glow-border animate-slide-in">
              <div className="flex items-center space-x-3 mb-8">
                <Shield className="w-6 h-6 text-white" />
                <h2 className="text-xl font-[var(--font-space-grotesk)] font-semibold text-white">Initialize Swap</h2>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-300 uppercase tracking-wider">Direction</Label>
                    <Select value={swapDirection} onValueChange={setSwapDirection}>
                      <SelectTrigger className="bg-black/30 border-white/10 text-white">
                        <SelectValue placeholder="Select direction" />
                      </SelectTrigger>
                      <SelectContent className="bg-black border-white/10">
                        <SelectItem value="eth-to-algo">Ethereum → Algorand</SelectItem>
                        <SelectItem value="algo-to-eth">Algorand → Ethereum</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-300 uppercase tracking-wider">Amount</Label>
                    <Input
                      type="number"
                      placeholder="0.0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="bg-black/30 border-white/10 text-white placeholder-gray-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-300 uppercase tracking-wider">Secret Hash</Label>
                  <div className="flex space-x-3">
                    <Input
                      placeholder="SHA-256 hash or generate new"
                      value={secretHash}
                      onChange={(e) => setSecretHash(e.target.value)}
                      className="bg-black/30 border-white/10 text-white placeholder-gray-500 font-mono text-sm"
                    />
                    <Button
                      onClick={generateSecret}
                      disabled={loading}
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10 shrink-0 bg-transparent"
                    >
                      <Hash className="w-4 h-4 mr-2" />
                      Generate
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-300 uppercase tracking-wider">Recipient</Label>
                  <Input
                    placeholder="Target chain address"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    className="bg-black/30 border-white/10 text-white placeholder-gray-500 font-mono text-sm"
                  />
                </div>

                <Button
                  onClick={initiateSwap}
                  disabled={loading}
                  className="w-full bg-white text-black hover:bg-gray-200 font-medium py-3 animate-pulse-glow"
                >
                  {loading ? "Initializing..." : "Initialize Atomic Swap"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Redeem Swap */}
        {activeTab === "redeem" && currentSession && (
          <div className="glass-panel rounded-lg p-8 glow-border animate-slide-in">
            <div className="flex items-center space-x-3 mb-8">
              <Key className="w-6 h-6 text-white" />
              <h2 className="text-xl font-[var(--font-space-grotesk)] font-semibold text-white">Redeem Swap</h2>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-black/30 rounded border border-white/5">
                <span className="text-sm font-medium text-gray-300">Swap ID:</span>
                <Badge variant="outline" className="font-mono">
                  {currentSession.id}
                </Badge>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-300 uppercase tracking-wider">Secret</Label>
                <Input
                  type="password"
                  placeholder="Enter the secret to redeem"
                  value={redeemSecret}
                  onChange={(e) => setRedeemSecret(e.target.value)}
                  className="bg-black/30 border-white/10 text-white placeholder-gray-500 font-mono"
                />
              </div>

              <Button
                onClick={redeemSwap}
                disabled={loading}
                className="w-full bg-white text-black hover:bg-gray-200 font-medium py-3"
              >
                {loading ? "Verifying..." : "Redeem Swap"}
              </Button>
            </div>
          </div>
        )}

        {/* Market Orders */}
        {activeTab === "market" && (
          <div className="glass-panel rounded-lg p-8 glow-border animate-slide-in">
            <div className="flex items-center space-x-3 mb-8">
              <TrendingUp className="w-6 h-6 text-white" />
              <h2 className="text-xl font-[var(--font-space-grotesk)] font-semibold text-white">
                1inch Fusion+ Orders
              </h2>
            </div>

            <div className="space-y-6">
              <Button
                onClick={fetch1inchOrders}
                disabled={loading}
                className="w-full bg-white text-black hover:bg-gray-200"
              >
                {loading ? "Loading Orders..." : "Refresh Market Orders"}
              </Button>

              {inchOrders.length > 0 ? (
                <div className="space-y-4">
                  {inchOrders.map((order, index) => (
                    <div key={index} className="p-4 bg-black/30 rounded border border-white/5">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Order Hash:</span>
                          <p className="text-white font-mono text-xs break-all">
                            {order.immutables?.allOf?.[0]?.orderHash || "N/A"}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-400">Amount:</span>
                          <p className="text-white">{order.immutables?.allOf?.[0]?.amount || "N/A"}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Chain:</span>
                          <Badge variant="outline">{order.chainId || "Unknown"}</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No market orders available</p>
                  <p className="text-sm">Click refresh to check for new opportunities</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Secrets Tab */}
        {activeTab === "secrets" && (
          <div className="glass-panel rounded-lg p-8 glow-border animate-slide-in">
            <div className="flex items-center space-x-3 mb-8">
              <Eye className="w-6 h-6 text-white" />
              <h2 className="text-xl font-[var(--font-space-grotesk)] font-semibold text-white">Order Secrets</h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-300 uppercase tracking-wider">Order Hash</Label>
                <div className="flex space-x-3">
                  <Input
                    placeholder="Enter order hash to reveal secrets"
                    value={selectedOrderHash}
                    onChange={(e) => setSelectedOrderHash(e.target.value)}
                    className="bg-black/30 border-white/10 text-white placeholder-gray-500 font-mono text-sm"
                  />
                  <Button
                    onClick={() => fetchOrderSecrets(selectedOrderHash)}
                    disabled={loading || !selectedOrderHash}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10 shrink-0"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Reveal
                  </Button>
                </div>
              </div>

              {orderSecrets && (
                <div className="space-y-4">
                  <div className="neon-separator"></div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-[var(--font-space-grotesk)] font-semibold text-white">Resolver Data</h3>

                    {orderSecrets.secrets?.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-gray-300 uppercase tracking-wider">Public Secrets</h4>
                        {orderSecrets.secrets.map((secret, index) => (
                          <div key={index} className="p-4 bg-black/30 rounded border border-white/5">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-400">Index:</span>
                                <p className="text-white font-mono">{secret.idx}</p>
                              </div>
                              <div>
                                <span className="text-gray-400">Secret:</span>
                                <p className="text-white font-mono break-all">{secret.secret}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-gray-300 uppercase tracking-wider">Raw Response</h4>
                      <Textarea
                        value={JSON.stringify(orderSecrets, null, 2)}
                        readOnly
                        className="bg-black/30 border-white/10 text-gray-300 font-mono text-xs min-h-[200px]"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Session Details */}
        {currentSession && (
          <div className="glass-panel rounded-lg p-8 glow-border animate-slide-in">
            <div className="flex items-center space-x-3 mb-8">
              <Terminal className="w-6 h-6 text-white" />
              <h2 className="text-xl font-[var(--font-space-grotesk)] font-semibold text-white">Session Details</h2>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-black/30 rounded border border-white/5">
                  <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Direction</div>
                  <div className="text-white font-medium">{currentSession.direction}</div>
                </div>
                <div className="p-4 bg-black/30 rounded border border-white/5">
                  <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Amount</div>
                  <div className="text-white font-mono">{currentSession.amount}</div>
                </div>
                <div className="p-4 bg-black/30 rounded border border-white/5">
                  <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Status</div>
                  <Badge variant={currentSession.status === "completed" ? "default" : "secondary"}>
                    {currentSession.status}
                  </Badge>
                </div>
                <div className="p-4 bg-black/30 rounded border border-white/5">
                  <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Expires</div>
                  <div className="text-white text-sm">{new Date(currentSession.timelock).toLocaleString()}</div>
                </div>
              </div>

              <div className="neon-separator"></div>

              {currentSession.ethereumTx && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-300 uppercase tracking-wider">Ethereum Transaction</h4>
                  <Textarea
                    value={JSON.stringify(currentSession.ethereumTx, null, 2)}
                    readOnly
                    className="bg-black/30 border-white/10 text-gray-300 font-mono text-xs min-h-[200px]"
                  />
                </div>
              )}

              {currentSession.algorandTx && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-300 uppercase tracking-wider">Algorand Transaction</h4>
                  <Textarea
                    value={JSON.stringify(currentSession.algorandTx, null, 2)}
                    readOnly
                    className="bg-black/30 border-white/10 text-gray-300 font-mono text-xs min-h-[200px]"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
