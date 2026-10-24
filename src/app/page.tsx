'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Shield, Plus, LogOut, Zap, Award } from 'lucide-react'
import HabitCard from '@/components/HabitCard'
import Heatmap from '@/components/Heatmap'
import NewHabitModal from '@/components/NewHabitModal'
import UpgradeModal from '@/components/UpgradeModal'

const CATEGORIES = ['All', 'General', 'Fitness', 'Productivity', 'Mindset', 'Health']
const FREE_HABIT_LIMIT = 5

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [habits, setHabits] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [today, setToday] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [milestoneMessage, setMilestoneMessage] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    setToday(new Date().toISOString().split('T')[0])
  }, [])

  const loadData = useCallback(async (userId: string, currentDate: string) => {
    if (!currentDate) return

    await supabase.rpc('evaluate_daily_streak_freezes', { p_today: currentDate })

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    setProfile(profileData)

    const { data: habitData } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .eq('is_archived', false)
      .order('created_at', { ascending: true })
    setHabits(habitData || [])

    const { data: logData } = await supabase
      .from('habit_logs')
      .select('*')
      .eq('user_id', userId)
    setLogs(logData || [])

    setLoading(false)
  }, [supabase])

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user && today) {
        await loadData(user.id, today)
      } else if (!user) {
        setLoading(false)
      }
    }
    checkAuth()
  }, [loadData, supabase, today])

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) console.error('OAuth sign in error:', error.message)
  }

  const handleProgress = async (habitId: string, delta: number) => {
    if (!today) return

    const { data, error } = await supabase.rpc('log_habit_progress', {
      p_habit_id: habitId,
      p_log_date: today,
      p_value_delta: delta,
    })

    if (!error && data) {
      setLogs((prev) => {
        const filtered = prev.filter((l) => !(l.habit_id === habitId && l.log_date === today))
        return [...filtered, { habit_id: habitId, log_date: today, current_value: data.current_value, status: data.status }]
      })

      setHabits((prev) =>
        prev.map((h) =>
          h.id === habitId
            ? { ...h, current_streak: data.current_streak, longest_streak: data.longest_streak }
            : h
        )
      )

      if (user) {
        const { data: updatedProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        if (updatedProfile) setProfile(updatedProfile)
      }
    }
  }

  const handleOpenAddModal = () => {
    if (!profile?.is_pro && habits.length >= FREE_HABIT_LIMIT) {
      setIsUpgradeOpen(true)
      return
    }
    setIsModalOpen(true)
  }

  const handleCreateHabit = async (habitPayload: any): Promise<{ success: boolean; error?: string }> => {
    if (!user || !today) return { success: false, error: 'User session not ready.' }

    const { error } = await supabase.from('habits').insert({
      ...habitPayload,
      user_id: user.id,
    })

    if (!error) {
      await loadData(user.id, today)
      // Automatically switch view to the created habit's category so it is immediately visible
      setSelectedCategory(habitPayload.category || 'All')
      return { success: true }
    } else {
      return { success: false, error: error.message }
    }
  }

  const handleArchiveHabit = async (habitId: string) => {
    const { error } = await supabase
      .from('habits')
      .update({ is_archived: true })
      .eq('id', habitId)

    if (!error) {
      setHabits((prev) => prev.filter((h) => h.id !== habitId))
    }
  }

  const handleFreezeAwarded = () => {
    setMilestoneMessage('Streak Milestone Reached! +1 Streak Freeze earned and added to vault.')
    setTimeout(() => setMilestoneMessage(null), 5000)
    if (user && today) loadData(user.id, today)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <p className="animate-pulse">Loading Habit Tracker...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 text-white text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-6">
          <Shield className="w-8 h-8 text-emerald-400" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Habit Tracker</h1>
        <p className="text-slate-400 text-sm max-w-xs mb-8">
          Daily habits, quantifiable goals, and streak freezes that keep your momentum alive.
        </p>

        <div className="w-full max-w-xs space-y-3">
          <button
            onClick={() => handleOAuthSignIn('google')}
            className="w-full flex items-center justify-center gap-2 bg-white text-slate-900 font-medium py-3 rounded-xl hover:bg-slate-100 transition-all text-sm"
          >
            Continue with Google
          </button>
          <button
            onClick={() => handleOAuthSignIn('github')}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 border border-slate-800 text-white font-medium py-3 rounded-xl hover:bg-slate-800 transition-all text-sm"
          >
            Continue with GitHub
          </button>
        </div>
      </div>
    )
  }

  const todayLogs = logs.filter((l) => l.log_date === today)
  const filteredHabits = selectedCategory === 'All'
    ? habits
    : habits.filter((h) => h.category === selectedCategory)

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 pb-28">
      <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg font-bold text-slate-100">Habit Tracker</h1>
              {profile?.is_pro ? (
                <span className="bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                  Pro
                </span>
              ) : (
                <button
                  onClick={() => setIsUpgradeOpen(true)}
                  className="flex items-center gap-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded hover:bg-amber-500/20 transition-all"
                >
                  <Zap className="w-2.5 h-2.5 fill-amber-300" />
                  Upgrade
                </button>
              )}
            </div>
            <p className="text-xs text-slate-400">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-cyan-950/40 border border-cyan-800/50 px-3 py-1 rounded-full text-xs font-medium text-cyan-300">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span>{profile?.streak_freezes_available ?? 0} Freezes</span>
            </div>
            <button
              onClick={() => supabase.auth.signOut().then(() => setUser(null))}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Milestone celebration alert */}
      {milestoneMessage && (
        <div className="max-w-md mx-auto px-4 mt-3">
          <div className="bg-emerald-500/15 border border-emerald-500/40 rounded-xl p-3 flex items-center gap-2.5 text-xs text-emerald-300 animate-fadeIn">
            <Award className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{milestoneMessage}</span>
          </div>
        </div>
      )}

      <div className="max-w-md mx-auto px-4 mt-5 space-y-5">
        <Heatmap logs={logs} />

        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-300">Today&apos;s Habits</h2>
              {!profile?.is_pro && (
                <span className="text-[11px] text-slate-500 font-medium">
                  ({habits.length}/{FREE_HABIT_LIMIT})
                </span>
              )}
            </div>
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Habit</span>
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-slate-100 text-slate-900 border-white font-medium'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filteredHabits.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl">
                <p className="text-xs text-slate-400">No habits found in this category.</p>
              </div>
            ) : (
              filteredHabits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  log={todayLogs.find((l) => l.habit_id === habit.id)}
                  onProgress={handleProgress}
                  onArchive={handleArchiveHabit}
                  onFreezeAwarded={handleFreezeAwarded}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <NewHabitModal
        isOpen={isModalOpen}
        initialCategory={selectedCategory !== 'All' ? selectedCategory : 'General'}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCreateHabit}
      />

      <UpgradeModal
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
      />
    </main>
  )
}