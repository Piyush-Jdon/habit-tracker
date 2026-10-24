'use client'

import React from 'react'
import { X, Check, Sparkles, Zap, ShieldCheck } from 'lucide-react'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectTier?: (tier: 'monthly' | 'lifetime') => void
}

export default function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  if (!isOpen) return null

  const handleCheckout = (plan: 'monthly' | 'lifetime') => {
    alert(`Redirecting to checkout for ${plan === 'lifetime' ? 'Founder Lifetime Deal ($49)' : 'Pro Monthly ($3.99/mo)'}`)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Zap className="w-4 h-4 fill-emerald-400" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Unlock Habit Tracker Pro</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4 space-y-2.5 text-xs text-slate-300">
          <div className="flex items-center gap-2.5">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span><strong>Unlimited habits</strong> (Free tier capped at 5)</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span><strong>Negative / Abstinence tracking</strong> to break bad habits</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span><strong>Earnable streak freezes</strong> (1 per 14-day streak)</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Full-year consistency heatmaps & analytics export</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-2">
          {/* Monthly Subscription */}
          <div className="border border-slate-800 bg-slate-950/60 rounded-xl p-3 flex flex-col justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-400">Pro Monthly</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-bold text-slate-100">$3.99</span>
                <span className="text-[10px] text-slate-500">/ mo</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Cancel anytime</p>
            </div>
            <button
              onClick={() => handleCheckout('monthly')}
              className="mt-3 w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-all"
            >
              Subscribe
            </button>
          </div>

          {/* Lifetime Deal */}
          <div className="border-2 border-emerald-500/40 bg-emerald-950/10 rounded-xl p-3 flex flex-col justify-between relative">
            <span className="absolute -top-2.5 right-2 bg-emerald-500 text-slate-950 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Best Value
            </span>
            <div>
              <p className="text-[11px] font-medium text-emerald-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Founder LTD
              </p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-bold text-slate-100">$49</span>
                <span className="text-[10px] text-slate-500">one-time</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Pay once, own forever</p>
            </div>
            <button
              onClick={() => handleCheckout('lifetime')}
              className="mt-3 w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg shadow-md shadow-emerald-500/20 transition-all"
            >
              Get Lifetime
            </button>
          </div>
        </div>

        <p className="text-[11px] text-center text-slate-500 mt-4 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400" /> 14-day money-back guarantee. No questions asked.
        </p>
      </div>
    </div>
  )
}