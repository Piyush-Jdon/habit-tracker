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
  onProgress: (habitId: string, delta: number) => Promise<boolean>
  onArchive: (habitId: string) => Promise<void>
  onFreezeAwarded?: () => void
}

export default function HabitCard({ habit, log, onProgress, onArchive, onFreezeAwarded }: HabitCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const supabase = createClient()

  const habitTitle = habit?.title || habit?.name || 'Untitled Habit'
  const isNegative = habit?.habit_type === 'negative'
  const currentValue = Number(log?.current_value ?? 0)
  const targetValue = Math.max(1, Number(habit?.target_value ?? 1))
  const isCompleted = log?.status === 'completed'
  const isQuantifiable = targetValue > 1 && !isNegative
  const streak = Number(habit?.current_streak ?? 0)

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
    if (!isCompleted) {
      const ok = await onProgress(habit.id, 1)
      if (ok) {
        sounds.playSuccess()
        triggerHaptic('success')
        confetti({ particleCount: 35, spread: 50, origin: { y: 0.8 } })
        await evaluateFreezeMilestone()
      }
    } else {
      const ok = await onProgress(habit.id, -1)
      if (ok) {
        sounds.playPop()
        triggerHaptic('light')
      }
    }
  }

  const handleLogSlip = async () => {
    setShowMenu(false)
    const ok = await onProgress(habit.id, -1)
    if (ok) {
      sounds.playWarning()
      triggerHaptic('warning')
    }
  }

  const handleIncrement = async (amount: number) => {
    const ok = await onProgress(habit.id, amount)
    if (ok) {
      if (currentValue + amount >= targetValue && !isCompleted) {
        sounds.playSuccess()
        triggerHaptic('success')
        confetti({ particleCount: 35, spread: 50, origin: { y: 0.8 } })
        await evaluateFreezeMilestone()
      } else {
        sounds.playPop()
        triggerHaptic('light')
      }
    }
  }

  const handleDelete = async () => {
    setShowMenu(false)
    if (confirm(`Archive habit "${habitTitle}"?`)) {
      triggerHaptic('medium')
      await onArchive(habit.id)
    }
  }

  const progressPercent = isQuantifiable
    ? Math.min(100, Math.round((currentValue / targetValue) * 100))
    : isCompleted ? 100 : 0

  return (
    <div
      className={`relative rounded-2xl p-4 shadow-sm transition-all duration-300 border ${
        isCompleted
          ? 'bg-slate-900/60 border-emerald-500/30'
          : log?.status === 'missed'
          ? 'bg-rose-950/20 border-rose-500/30'
          : 'bg-slate-900 border-slate-800/80 hover:border-slate-700/80'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-transform duration-200 active:scale-95 ${
              isCompleted
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : log?.status === 'missed'
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                : 'bg-slate-800 text-slate-300'
            }`}
          >
            {isNegative ? <Ban className="w-5 h-5" /> : habitTitle.charAt(0).toUpperCase()}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3
                className={`text-sm font-semibold transition-colors duration-200 ${
                  isCompleted && !isNegative
                    ? 'text-slate-400 line-through decoration-slate-600'
                    : 'text-slate-100'
                }`}
              >
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
                ? isCompleted
                  ? 'Clean today ✨'
                  : log?.status === 'missed'
                  ? 'Slip recorded'
                  : 'Tap to confirm clean today'
                : isQuantifiable
                ? `${currentValue} / ${targetValue} ${habit.unit || ''}`
                : isCompleted
                ? 'Completed'
                : 'Tap to complete'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 border px-2 py-0.5 rounded-full text-xs font-semibold transition-all ${flameStyle.bg}`}>
            <Flame className={`w-3.5 h-3.5 ${flameStyle.icon}`} />
            <span>{streak}</span>
          </div>

          {!isQuantifiable ? (
            <button
              onClick={handleToggle}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-90 ${
                isCompleted
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25 ring-2 ring-emerald-400/20'
                  : log?.status === 'missed'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  : 'bg-slate-800 border border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              {log?.status === 'missed' ? (
                <ShieldAlert className="w-4 h-4" />
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
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-8 z-20 bg-slate-950 border border-slate-800 rounded-xl p-1 shadow-2xl min-w-[130px]">
                  {isNegative && (
                    <button
                      onClick={handleLogSlip}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Log Slip</span>
                    </button>
                  )}
                  <button
                    onClick={handleDelete}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Archive</span>
                  </button>
                </div>
              </>
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