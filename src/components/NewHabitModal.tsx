'use client'

import React, { useState } from 'react'
import { X } from 'lucide-react'

interface NewHabitModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (habitData: any) => Promise<void>
}

export default function NewHabitModal({ isOpen, onClose, onSave }: NewHabitModalProps) {
  const [title, setTitle] = useState('')
  const [habitType, setHabitType] = useState<'binary' | 'quantifiable'>('binary')
  const [targetValue, setTargetValue] = useState(1)
  const [unit, setUnit] = useState('')
  const [color, setColor] = useState('#10b981')
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    await onSave({
      title,
      habit_type: habitType,
      target_value: habitType === 'binary' ? 1 : Number(targetValue),
      unit: habitType === 'quantifiable' ? unit : null,
      color,
      frequency_type: 'daily',
      frequency_value: { times_per_week: 7 }
    })
    setSubmitting(false)
    setTitle('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl p-5 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-lg text-slate-100">Create New Habit</h2>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Habit Name</label>
            <input 
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Read 20 pages"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setHabitType('binary')}
              className={`py-2 rounded-xl text-xs font-medium border transition-all ${
                habitType === 'binary' 
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                  : 'border-slate-800 bg-slate-800/40 text-slate-400'
              }`}
            >
              Binary (Yes / No)
            </button>
            <button
              type="button"
              onClick={() => setHabitType('quantifiable')}
              className={`py-2 rounded-xl text-xs font-medium border transition-all ${
                habitType === 'quantifiable' 
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                  : 'border-slate-800 bg-slate-800/40 text-slate-400'
              }`}
            >
              Quantifiable Target
            </button>
          </div>

          {habitType === 'quantifiable' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Target Value</label>
                <input 
                  type="number"
                  min="1"
                  value={targetValue}
                  onChange={(e) => setTargetValue(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Unit</label>
                <input 
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="e.g., ml, mins"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs text-slate-400 block mb-1">Color Accent</label>
            <div className="flex gap-2">
              {['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899'].map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-white' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl text-sm transition-all"
          >
            {submitting ? 'Creating...' : 'Save Habit'}
          </button>
        </form>
      </div>
    </div>
  )
}