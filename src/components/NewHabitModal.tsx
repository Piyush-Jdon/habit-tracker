'use client'

import React, { useState, useEffect } from 'react'
import { X, CheckCircle2, Ban } from 'lucide-react'

interface NewHabitModalProps {
  isOpen: boolean
  initialCategory?: string
  onClose: () => void
  onSave: (habit: any) => Promise<{ success: boolean; error?: string }>
}

const CATEGORIES = ['General', 'Fitness', 'Productivity', 'Mindset', 'Health']

export default function NewHabitModal({ isOpen, initialCategory = 'General', onClose, onSave }: NewHabitModalProps) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(initialCategory)
  const [habitType, setHabitType] = useState<'positive' | 'negative'>('positive')
  const [isQuantifiable, setIsQuantifiable] = useState(false)
  const [targetValue, setTargetValue] = useState(1)
  const [unit, setUnit] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Reset category to whatever tab is currently active when the modal opens
  useEffect(() => {
    if (isOpen) {
      setCategory(initialCategory)
      setFormError(null)
    }
  }, [isOpen, initialCategory])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setSubmitting(true)
    setFormError(null)

    const result = await onSave({
      title: title.trim(),
      category,
      habit_type: habitType,
      target_value: habitType === 'negative' ? 1 : isQuantifiable ? Number(targetValue) : 1,
      unit: habitType === 'negative' ? 'slip' : isQuantifiable ? unit.trim() : null,
    })

    setSubmitting(false)

    if (result.success) {
      setTitle('')
      setCategory('General')
      setHabitType('positive')
      setIsQuantifiable(false)
      setTargetValue(1)
      setUnit('')
      onClose()
    } else {
      setFormError(result.error || 'Failed to create habit.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <h3 className="text-base font-semibold text-slate-100">Create New Habit</h3>
          <button
            onClick={() => { setFormError(null); onClose(); }}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {formError && (
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Habit Name</label>
            <input
              type="text"
              required
              placeholder={habitType === 'positive' ? 'e.g. Morning Run' : 'e.g. No Sugary Drinks'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Habit Goal Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => { setHabitType('positive'); setIsQuantifiable(false); }}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
                  habitType === 'positive'
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Build Habit
              </button>
              <button
                type="button"
                onClick={() => { setHabitType('negative'); setIsQuantifiable(false); }}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
                  habitType === 'negative'
                    ? 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <Ban className="w-3.5 h-3.5" />
                Quit / Abstain
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Category</label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                    category === cat
                      ? 'bg-slate-100 text-slate-900 border-white font-medium'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {habitType === 'positive' && (
            <div className="space-y-3 pt-1">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isQuantifiable}
                  onChange={(e) => setIsQuantifiable(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-800 text-emerald-500 focus:ring-0"
                />
                <span>Quantifiable Target (e.g. pages, ml, reps)</span>
              </label>

              {isQuantifiable && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Target</label>
                    <input
                      type="number"
                      min="1"
                      value={targetValue}
                      onChange={(e) => setTargetValue(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Unit</label>
                    <input
                      type="text"
                      placeholder="e.g. ml, mins"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold py-2.5 rounded-xl text-sm transition-all disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}