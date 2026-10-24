'use client'

import React from 'react'
import { Check, Flame, Plus, Minus } from 'lucide-react'
import confetti from 'canvas-confetti'

interface HabitCardProps {
  habit: any
  log?: any
  onProgress: (habitId: string, delta: number) => void
}

export default function HabitCard({ habit, log, onProgress }: HabitCardProps) {
  const isCompleted = log?.status === 'completed'
  const currentValue = log?.current_value || 0
  const progressPercent = Math.min(100, Math.round((currentValue / habit.target_value) * 100))

  const handleBinaryToggle = () => {
    if (!isCompleted) {
      confetti({ particleCount: 35, spread: 45, origin: { y: 0.8 } })
      onProgress(habit.id, 1)
    } else {
      onProgress(habit.id, -1)
    }
  }

  const handleIncrement = (amount: number) => {
    if (currentValue + amount >= habit.target_value && !isCompleted) {
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } })
    }
    onProgress(habit.id, amount)
  }

  return (
    <div className={`border rounded-2xl p-4 transition-all ${
      isCompleted 
        ? 'bg-emerald-950/20 border-emerald-500/40' 
        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg"
            style={{ backgroundColor: `${habit.color}15`, color: habit.color }}
          >
            {habit.title.charAt(0)}
          </div>
          <div>
            <h4 className="font-medium text-slate-100">{habit.title}</h4>
            <p className="text-xs text-slate-400">
              {habit.habit_type === 'quantifiable' 
                ? `${currentValue} / ${habit.target_value} ${habit.unit || ''}`
                : habit.frequency_type === 'weekly_target'
                ? `${habit.frequency_value?.times_per_week}x per week`
                : 'Daily'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs font-semibold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full">
            <Flame className="w-3.5 h-3.5 fill-amber-500" />
            <span>{habit.current_streak}</span>
          </div>

          {habit.habit_type === 'binary' ? (
            <button
              onClick={handleBinaryToggle}
              className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${
                isCompleted
                  ? 'bg-emerald-500 border-emerald-400 text-slate-950 scale-105 shadow-md shadow-emerald-500/20'
                  : 'border-slate-700 hover:border-slate-500 text-transparent'
              }`}
            >
              <Check className="w-5 h-5 stroke-[3]" />
            </button>
          ) : null}
        </div>
      </div>

      {habit.habit_type === 'quantifiable' && (
        <div className="mt-3.5 pt-3 border-t border-slate-800/60">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1">
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%`, backgroundColor: habit.color }}
                />
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleIncrement(-1)}
                disabled={currentValue <= 0}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 flex items-center justify-center text-slate-300"
              >
                <Minus className="w-3 h-3" />
              </button>
              <button
                onClick={() => handleIncrement(1)}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}