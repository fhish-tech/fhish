"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { ethers } from "ethers"
import { getProvider, decodeInput } from "@/lib/ethers"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Box, Hash, User, ArrowRight, Zap, Database, Terminal, List, Shield, Code } from "lucide-react"

export default function TransactionPage() {
  const { hash } = useParams()
  const [tx, setTx] = useState<ethers.TransactionResponse | null>(null)
  const [receipt, setReceipt] = useState<ethers.TransactionReceipt | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const provider = getProvider()

    async function fetchDetails() {
      try {
        const [txData, receiptData] = await Promise.all([
          provider.getTransaction(hash as string),
          provider.getTransactionReceipt(hash as string)
        ])
        setTx(txData)
        setReceipt(receiptData)
      } catch (err) {
        console.error("Failed to fetch tx:", err)
      } finally {
        setLoading(false)
      }
    }

    if (hash) fetchDetails()
  }, [hash])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!tx) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Transaction Not Found</h1>
        <Link href="/" className="text-blue-500 flex items-center gap-2">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
      </div>
    )
  }

  const decoded = decodeInput(tx.data)
  const isFHE = tx.data.length > 50

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 font-sans selection:bg-blue-500/30">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-6">
            <Link href="/" className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5 group">
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </Link>
            <div>
              <div className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.2em] mb-1">Transaction Ledger</div>
              <h1 className="text-4xl font-black tracking-tighter">
                Details
              </h1>
            </div>
          </div>
          {isFHE && (
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-xl">
              <Shield size={16} className="text-purple-400 animate-pulse" />
              <span className="text-xs font-black text-purple-400 uppercase tracking-widest">FHE Shielded</span>
            </div>
          )}
        </div>

        <div className="grid gap-6">
          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <DetailCard icon={<Hash size={18} />} title="Status" value={receipt?.status === 1 ? "Success" : "Failed"} color={receipt?.status === 1 ? "text-green-400" : "text-red-400"} />
            <DetailCard icon={<Box size={18} />} title="Block Height" value={`#${tx.blockNumber}`} color="text-blue-400" />
            <DetailCard icon={<Zap size={18} />} title="Gas Consumption" value={receipt?.gasUsed.toString() ?? "0"} color="text-yellow-400" />
          </div>

          {/* Primary Data Card */}
          <Card className="bg-[#0a0a0a] border-white/5 overflow-hidden">
            <CardContent className="p-0">
              <div className="divide-y divide-white/5">
                <DataRow label="Transaction Hash" value={tx.hash} />
                <DataRow label="From (Origin)" value={tx.from} isAddress />
                <DataRow label="To (Destination)" value={tx.to || "Contract Creation"} isAddress />
                <DataRow label="Value" value={`${ethers.formatEther(tx.value)} INIT`} />
              </div>
            </CardContent>
          </Card>

          {/* Shielded Execution Section */}
          {decoded && (
             <section>
                <div className="flex items-center gap-2 mb-4">
                    <Shield size={16} className="text-purple-400" />
                    <h2 className="text-sm font-black uppercase tracking-widest text-purple-400">Shielded Instruction</h2>
                </div>
                <Card className="bg-[#0a0a0a] border-purple-500/30 overflow-hidden">
                    <CardHeader className="bg-purple-500/5 py-4 border-b border-purple-500/10">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-mono text-purple-300">Selector: {tx.data.slice(0, 10)}</span>
                            <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-bold uppercase">Encrypted Call</span>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-white/5">
                            {Object.entries(decoded.args).map(([key, value], idx) => (
                                <div key={key} className="grid grid-cols-1 md:grid-cols-4 p-5">
                                    <div className="text-white/40 text-[10px] font-black uppercase tracking-widest pt-1">Segment {idx}</div>
                                    <div className="md:col-span-3 font-mono text-xs break-all text-purple-400 leading-relaxed bg-purple-500/5 p-3 rounded-lg border border-purple-500/10">
                                        {String(value)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
             </section>
          )}

          {/* Emission Logs Section */}
          {receipt && receipt.logs.length > 0 && (
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <List size={16} className="text-blue-400" />
                    <h2 className="text-sm font-black uppercase tracking-widest text-blue-400">Emission Logs</h2>
                </div>
                <div className="space-y-4">
                    {receipt.logs.map((log, i) => (
                        <Card key={i} className="bg-[#0a0a0a] border-white/5 overflow-hidden">
                            <div className="bg-white/5 px-5 py-3 flex items-center justify-between border-b border-white/5">
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Log Event #{i}</span>
                                <span className="text-[10px] font-mono text-white/20">{log.address}</span>
                            </div>
                            <div className="p-5">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="text-[10px] font-bold text-white/30 uppercase">Data Payload</div>
                                    <div className="md:col-span-3 font-mono text-xs break-all text-blue-300 bg-blue-500/5 p-4 rounded-xl border border-blue-500/10 leading-relaxed">
                                        {log.data}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </section>
          )}

          {/* Ciphertext Section */}
          <section>
            <div className="flex items-center gap-2 mb-4">
                <Terminal size={16} className="text-gray-500" />
                <h2 className="text-sm font-black uppercase tracking-widest text-gray-500">Full Ciphertext</h2>
            </div>
            <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-2xl font-mono text-[11px] break-all text-gray-300 leading-loose">
                {tx.data}
            </div>
          </section>
        </div>
      </div>
      <div className="h-24" />
    </div>
  )
}

function DetailCard({ icon, title, value, color }: { icon: any, title: string, value: string, color: string }) {
  return (
    <Card className="bg-[#0a0a0a] border-white/5 p-6 rounded-2xl hover:bg-white/[0.02] transition-colors">
      <div className="flex items-center gap-3 mb-4 text-white/40">
        {icon}
        <span className="text-[10px] font-black uppercase tracking-widest">{title}</span>
      </div>
      <div className={cn("text-2xl font-black tracking-tighter", color)}>{value}</div>
    </Card>
  )
}

function DataRow({ label, value, isAddress }: { label: string, value: string, isAddress?: boolean }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 p-5 items-center hover:bg-white/[0.01] transition-colors">
      <div className="text-white/40 text-[10px] font-black uppercase tracking-widest">{label}</div>
      <div className={cn(
        "md:col-span-3 font-mono text-sm break-all",
        isAddress ? "text-blue-400" : "text-white"
      )}>
        {value}
      </div>
    </div>
  )
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
