'use client'

import React from 'react'
import { Sparkles } from 'lucide-react'

interface DailyProgressBarProps {
  total: number
  completed: number
}

export default function DailyProgressBar({ total, completed }: DailyProgressBarProps) {
  if (total === 0) return null

  const percentage = Math.round((completed / total) * 100)
  const isAllComplete = completed === total && total > 0

  return (
    <div className={`p-4 rounded-2xl border transition-all duration-500 ${
      isAllComplete
        ? 'bg-emerald-950/20 border-emerald-500/40 shadow-lg shadow-emerald-950/30'
        : 'bg-slate-900/80 border-slate-800/80'
    }`}>
      <div className="flex items-center justify-between text-xs mb-2">
        <span className="font-semibold text-slate-300 flex items-center gap-1.5">
          {isAllComplete ? (
            <>
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">All Goals Completed Today!</span>
            </>
          ) : (
            `Today's Progress • ${completed} of ${total}`
          )}
        </span>
        <span className={`font-bold ${isAllComplete ? 'text-emerald-400' : 'text-slate-400'}`}>
          {percentage}%
        </span>
      </div>

      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${
            isAllComplete
              ? 'bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400'
              : 'bg-gradient-to-r from-emerald-500 to-teal-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}