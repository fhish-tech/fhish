"use client"

import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { getProvider } from "@/lib/ethers"

export interface Transaction {
  hash: string
  from: string
  to: string | null
  value: string
  blockNumber: number
  timestamp: number
  isFHE?: boolean
}

export interface Block {
  number: number
  hash: string
  timestamp: number
  transactions: string[]
}

export function useBlockScanner() {
  const [refreshing, setRefreshing] = useState(false)
  const [latestBlock, setLatestBlock] = useState<number>(0)
  const [blocks, setBlocks] = useState<Block[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  const scan = async () => {
    const provider = getProvider()
    setRefreshing(true)
    try {
      const blockNumber = await provider.getBlockNumber()
      setLatestBlock(blockNumber)

      const blockPromises = []
      const SCAN_DEPTH = 100 // Increased depth
      for (let i = 0; i < SCAN_DEPTH; i++) {
        if (blockNumber - i < 0) break
        blockPromises.push(provider.getBlock(blockNumber - i, true))
      }

      const fetchedBlocks = await Promise.all(blockPromises)
      const validBlocks = fetchedBlocks.filter(b => b !== null) as ethers.Block[]

      setBlocks(validBlocks.map(b => ({
        number: b.number,
        hash: b.hash!,
        timestamp: b.timestamp,
        transactions: b.transactions as string[]
      })))

      const allTxs: Transaction[] = []
      for (const b of validBlocks) {
        const txs = b.prefetchedTransactions
        txs.forEach(tx => {
          allTxs.push({
            hash: tx.hash,
            from: tx.from,
            to: tx.to,
            value: ethers.formatEther(tx.value),
            blockNumber: tx.blockNumber!,
            timestamp: b.timestamp,
            isFHE: tx.data.length > 50 // More sensitive detection
          })
        })
      }
      setTransactions(allTxs.sort((a, b) => b.timestamp - a.timestamp))
      setLoading(false)
    } catch (err) {
      console.error("Scanner failed:", err)
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    scan()
    const provider = getProvider()

    const onBlock = async (num: number) => {
      setLatestBlock(num)
      const block = await provider.getBlock(num, true)
      if (!block) return

      setBlocks(prev => [{
        number: block.number,
        hash: block.hash!,
        timestamp: block.timestamp,
        transactions: block.transactions as string[]
      }, ...prev].slice(0, 50))

      const newTxs = block.prefetchedTransactions.map(tx => ({
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: ethers.formatEther(tx.value),
        blockNumber: tx.blockNumber!,
        timestamp: block.timestamp,
        isFHE: tx.data.length > 50
      }))

      setTransactions(prev => [...newTxs, ...prev])
    }

    provider.on("block", onBlock)
    return () => {
      provider.off("block", onBlock)
    }
  }, [])

  return { latestBlock, blocks, transactions, loading, refreshing, refresh: scan }
}
