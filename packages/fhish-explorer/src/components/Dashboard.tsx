"use client"

import { useBlockScanner, Transaction, Block } from "@/hooks/useBlockScanner"
import { formatAddress, formatHash, cn } from "@/lib/utils"
import { Activity, Box, Database, Shield, Zap, Search, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

export default function Dashboard() {
  const { latestBlock, blocks, transactions, loading } = useBlockScanner()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 font-medium">Scanning FHISH Rollup...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 relative">
              <img src="/logo.png" alt="FHISH Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                FHISH EXPLORER
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-1">Network Status</div>
              <div className="flex items-center gap-2 text-green-400 font-mono text-sm">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Operational
              </div>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <StatCard title="Latest Block" value={`#${latestBlock}`} icon={<Box size={20} />} />
          <StatCard title="Total Transactions" value={transactions.length.toString()} icon={<Zap size={20} />} />
          <StatCard title="FHE Shielded" value={transactions.filter(t => t.isFHE).length.toString()} icon={<Shield size={20} />} />
          <StatCard title="Network" value="Rollup-1" icon={<Activity size={20} />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Blocks Column */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Box className="text-blue-400" /> Latest Blocks
              </h2>
            </div>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {blocks.map((block) => (
                <BlockItem key={block.hash} block={block} />
              ))}
            </div>
          </section>

          {/* Transactions Column */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Zap className="text-yellow-400" /> All Transactions
              </h2>
            </div>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {transactions.map((tx) => (
                <TransactionItem key={tx.hash} tx={tx} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, value, title }: { icon: React.ReactNode, value: string, title: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass p-6 rounded-2xl border border-white/5 bg-white/[0.02]"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-white/5 text-blue-400">
          {icon}
        </div>
        <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">{title}</span>
      </div>
      <div className="text-3xl font-black tracking-tighter">{value}</div>
    </motion.div>
  )
}

function BlockItem({ block }: { block: Block }) {
  return (
    <div className="glass p-4 rounded-xl flex items-center justify-between hover:border-gray-700 transition-colors group cursor-pointer">
      <div className="flex items-center gap-4">
        <div className="bg-gray-800 p-3 rounded-lg group-hover:bg-blue-900/30 transition-colors">
          <Box className="w-5 h-5 text-gray-400 group-hover:text-blue-400" />
        </div>
        <div>
          <div className="font-bold text-blue-400">#{block.number}</div>
          <div className="text-xs text-gray-500">{new Date(block.timestamp * 1000).toLocaleTimeString()}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm font-mono text-gray-400">{formatHash(block.hash)}</div>
        <div className="text-xs text-gray-500">{block.transactions.length} txns</div>
      </div>
    </div>
  )
}

function TransactionItem({ tx }: { tx: Transaction }) {
  return (
    <Link href={`/transaction/${tx.hash}`}>
      <div className="glass p-4 rounded-xl flex items-center justify-between hover:border-gray-700 transition-colors group cursor-pointer">
        <div className="flex items-center gap-4">
          <div className={cn(
            "p-3 rounded-lg transition-colors",
            tx.isFHE ? "bg-purple-900/20 text-purple-400" : "bg-gray-800 text-gray-400"
          )}>
            {tx.isFHE ? <Shield className="w-5 h-5" /> : <Search className="w-5 h-5" />}
          </div>
          <div>
            <div className="text-sm font-mono flex items-center gap-2">
              {formatHash(tx.hash)}
              {tx.isFHE && (
                <span className="bg-purple-500/10 text-purple-400 text-[10px] px-1.5 py-0.5 rounded border border-purple-500/20 uppercase tracking-wider font-bold">
                  FHE Call
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500">
              From {formatAddress(tx.from)}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-gray-300">{tx.value} INIT</div>
          <div className="text-xs text-gray-500">Block #{tx.blockNumber}</div>
        </div>
      </div>
    </Link>
  )
}
