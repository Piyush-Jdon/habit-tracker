'use client'

import React, { useState } from 'react'
import { Check, Flame, Plus, Minus, Ban, ShieldAlert, MoreVertical, Trash2 } from 'lucide-react'
import confetti from 'canvas-confetti'
import { triggerHaptic } from '@/utils/haptics'
import { sounds } from '@/utils/sound'
import { createClient } from '@/utils/supabase/client'

interface HabitCardProps {
  habit: any
  log?: any
  onProgress: (habitId: string, delta: number) => Promise<void>
  onArchive: (habitId: string) => Promise<void>
  onFreezeAwarded?: () => void
}

export default function HabitCard({ habit, log, onProgress, onArchive, onFreezeAwarded }: HabitCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const supabase = createClient()

  const habitTitle = habit?.title || habit?.name || 'Untitled Habit'
  const isNegative = habit?.habit_type === 'negative'
  const currentValue = log?.current_value ?? 0
  const targetValue = habit?.target_value ?? 1
  const isCompleted = isNegative ? currentValue === 0 : currentValue >= targetValue
  const isQuantifiable = targetValue > 1 && !isNegative
  const streak = habit?.current_streak ?? 0

  // Dynamic Flame Color based on streak milestones
  const getFlameBadge = () => {
    if (streak >= 30) {
      return {
        bg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300',
        icon: 'text-cyan-400 fill-cyan-400',
      }
    }
    if (streak >= 7) {
      return {
        bg: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
        icon: 'text-amber-400 fill-amber-400 animate-pulse',
      }
    }
    return {
      bg: 'bg-slate-800 border-slate-700 text-slate-400',
      icon: 'text-slate-400',
    }
  }

  const flameStyle = getFlameBadge()

  const evaluateFreezeMilestone = async () => {
    const { data: awarded } = await supabase.rpc('check_and_award_streak_freeze', {
      p_habit_id: habit.id,
    })
    if (awarded === 1) {
      confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } })
      triggerHaptic('success')
      sounds.playSuccess()
      if (onFreezeAwarded) onFreezeAwarded()
    }
  }

  const handleToggle = async () => {
    if (isNegative) {
      if (currentValue === 0) {
        sounds.playWarning()
        triggerHaptic('warning')
        await onProgress(habit.id, 1)
      } else {
        sounds.playPop()
        triggerHaptic('light')
        await onProgress(habit.id, -1)
      }
    } else {
      if (!isCompleted) {
        sounds.playSuccess()
        triggerHaptic('success')
        confetti({ particleCount: 30, spread: 45, origin: { y: 0.8 } })
        await onProgress(habit.id, 1)
        await evaluateFreezeMilestone()
      } else {
        sounds.playPop()
        triggerHaptic('light')
        await onProgress(habit.id, -1)
      }
    }
  }

  const handleIncrement = async (amount: number) => {
    if (currentValue + amount >= targetValue && !isCompleted) {
      sounds.playSuccess()
      triggerHaptic('success')
      confetti({ particleCount: 35, spread: 50, origin: { y: 0.8 } })
      await evaluateFreezeMilestone()
    } else {
      sounds.playPop()
      triggerHaptic('light')
    }
    await onProgress(habit.id, amount)
  }

  const handleDelete = async () => {
    if (confirm(`Archive habit "${habitTitle}"?`)) {
      triggerHaptic('medium')
      await onArchive(habit.id)
    }
    setShowMenu(false)
  }

  const progressPercent = isNegative
    ? currentValue === 0 ? 100 : 0
    : Math.min(100, Math.round((currentValue / targetValue) * 100))

  return (
    <div
      className={`relative rounded-2xl p-4 shadow-sm transition-all duration-300 border ${
        isCompleted
          ? 'bg-slate-900/60 border-emerald-500/30'
          : 'bg-slate-900 border-slate-800/80 hover:border-slate-700/80'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-transform duration-200 active:scale-95 ${
              isNegative
                ? currentValue === 0
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                : isCompleted
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-slate-800 text-slate-300'
            }`}
          >
            {isNegative ? <Ban className="w-5 h-5" /> : habitTitle.charAt(0).toUpperCase()}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className={`text-sm font-semibold transition-colors duration-200 ${
                isCompleted ? 'text-slate-300 line-through decoration-slate-600' : 'text-slate-100'
              }`}>
                {habitTitle}
              </h3>
              {habit.category && (
                <span className="text-[10px] font-medium bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                  {habit.category}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              {isNegative
                ? currentValue === 0
                  ? 'Clean today'
                  : 'Relapse recorded'
                : isQuantifiable
                ? `${currentValue} / ${targetValue} ${habit.unit || ''}`
                : isCompleted
                ? 'Completed'
                : 'Tap to complete'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Milestone Dynamic Flame */}
          <div className={`flex items-center gap-1 border px-2 py-0.5 rounded-full text-xs font-semibold transition-all ${flameStyle.bg}`}>
            <Flame className={`w-3.5 h-3.5 ${flameStyle.icon}`} />
            <span>{streak}</span>
          </div>

          {!isQuantifiable ? (
            <button
              onClick={handleToggle}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-90 ${
                isNegative
                  ? currentValue === 0
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25 ring-2 ring-emerald-400/20'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  : isCompleted
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25 ring-2 ring-emerald-400/20'
                  : 'bg-slate-800 border border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              {isNegative ? (
                currentValue === 0 ? <Check className="w-4 h-4 stroke-[2.5]" /> : <ShieldAlert className="w-4 h-4" />
              ) : (
                <Check className="w-4 h-4 stroke-[2.5]" />
              )}
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleIncrement(-1)}
                disabled={currentValue <= 0}
                className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 disabled:opacity-30 active:scale-90"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleIncrement(1)}
                className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/20 active:scale-90"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="relative">
            <button
              onClick={() => setShowMenu((prev) => !prev)}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-300"
              title="Habit Options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-8 z-20 bg-slate-950 border border-slate-800 rounded-xl p-1 shadow-xl min-w-[110px]">
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Archive</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isQuantifiable && (
        <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-emerald-400 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}
    </div>
  )
}