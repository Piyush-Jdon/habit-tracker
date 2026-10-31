'use client'

import React from 'react'

interface HeatmapProps {
  logs: any[]
  daysCount?: number
}

export default function Heatmap({ logs, daysCount = 35 }: HeatmapProps) {
  // Generate date array ending today using local calendar time
  const days = Array.from({ length: daysCount }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (daysCount - 1 - i))
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  })

  const getDayStatus = (dateStr: string) => {
    const dayLogs = logs.filter((l) => l.log_date === dateStr)
    if (dayLogs.length === 0) return 'empty'

    // Check if any habit was frozen on this date
    if (dayLogs.some((l) => l.status === 'frozen')) return 'frozen'

    const completed = dayLogs.filter((l) => l.status === 'completed').length
    const ratio = completed / dayLogs.length

    if (ratio === 1) return 'level-4'
    if (ratio >= 0.66) return 'level-3'
    if (ratio >= 0.33) return 'level-2'
    if (ratio > 0) return 'level-1'
    return 'empty'
  }

  const getColorClass = (status: string) => {
    switch (status) {
      case 'level-4':
        return 'bg-emerald-400 shadow-sm shadow-emerald-400/30'
      case 'level-3':
        return 'bg-emerald-500/80'
      case 'level-2':
        return 'bg-emerald-600/60'
      case 'level-1':
        return 'bg-emerald-800/50'
      case 'frozen':
        return 'bg-cyan-400 shadow-sm shadow-cyan-400/30'
      default:
        return 'bg-slate-900 border border-slate-800/60'
    }
  }

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
        <span className="font-medium text-slate-300">Activity Heatmap</span>
        <div className="flex items-center gap-1.5 text-[10px]">
          <span>Less</span>
          <div className="w-2.5 h-2.5 rounded bg-slate-900 border border-slate-800" />
          <div className="w-2.5 h-2.5 rounded bg-emerald-800/50" />
          <div className="w-2.5 h-2.5 rounded bg-emerald-600/60" />
          <div className="w-2.5 h-2.5 rounded bg-emerald-400" />
          <span>More</span>
        </div>
      </div>

      <div className="grid grid-flow-col grid-rows-5 gap-1.5 overflow-x-auto pb-1">
        {days.map((dateStr) => {
          const status = getDayStatus(dateStr)
          return (
            <div
              key={dateStr}
              title={`${dateStr}: ${status}`}
              className={`w-3.5 h-3.5 rounded-sm transition-all duration-200 ${getColorClass(status)}`}
            />
          )
        })}
      </div>
    </div>
  )
}