'use client'

import React from 'react'

interface HeatmapProps {
  logs: { log_date: string; status: string }[]
}

export default function Heatmap({ logs }: HeatmapProps) {
  const days = Array.from({ length: 70 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (69 - i))
    return d.toISOString().split('T')[0]
  })

  const logMap = new Map(logs.map((l) => [l.log_date, l.status]))

  const getColor = (date: string) => {
    const status = logMap.get(date)
    if (status === 'completed') return 'bg-emerald-500 shadow-sm shadow-emerald-500/30'
    if (status === 'frozen') return 'bg-cyan-400 shadow-sm shadow-cyan-400/30'
    if (status === 'partial') return 'bg-emerald-950 border border-emerald-700/50'
    return 'bg-slate-800/80 border border-slate-700/30'
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Consistency Heatmap</h3>
        <div className="flex items-center gap-2 text-[10px] text-slate-400">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-slate-800 inline-block"></span> Missed</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-cyan-400 inline-block"></span> Frozen</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-500 inline-block"></span> Done</span>
        </div>
      </div>
      <div className="grid grid-flow-col grid-rows-7 gap-1.5 overflow-x-auto pb-1">
        {days.map((date) => (
          <div
            key={date}
            title={`${date}: ${logMap.get(date) || 'No log'}`}
            className={`w-3.5 h-3.5 rounded-sm transition-all hover:scale-125 ${getColor(date)}`}
          />
        ))}
      </div>
    </div>
  )
}