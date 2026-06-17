'use client'
// src/components/GoalTracker.tsx

import { useState, useEffect, useCallback } from 'react'
import { Plus, CheckSquare, Square, Trash2, ChevronDown, Target } from 'lucide-react'

type GoalCategory = 'RELEASE' | 'SOCIAL_GROWTH' | 'PERFORMANCE' | 'BUSINESS' | 'LEARNING' | 'GENERAL'

interface Task  { id: string; title: string; done: boolean; order: number }
interface Goal  { id: string; title: string; category: GoalCategory; dueDate?: string; progress: number; tasks: Task[] }

const CAT: Record<GoalCategory, { label: string; color: string }> = {
  RELEASE:       { label: 'Release',       color: 'text-pink-400'   },
  SOCIAL_GROWTH: { label: 'Social Growth', color: 'text-blue-400'   },
  PERFORMANCE:   { label: 'Performance',   color: 'text-yellow-400' },
  BUSINESS:      { label: 'Business',      color: 'text-green-400'  },
  LEARNING:      { label: 'Learning',      color: 'text-purple-400' },
  GENERAL:       { label: 'General',       color: 'text-gray-400'   },
}

export default function GoalTracker({ artistId }: { artistId: string }) {
  const [goals, setGoals]               = useState<Goal[]>([])
  const [expanded, setExpanded]         = useState<string | null>(null)
  const [showForm, setShowForm]         = useState(false)
  const [taskInputs, setTaskInputs]     = useState<Record<string, string>>({})
  const [goalForm, setGoalForm]         = useState({ title: '', category: 'GENERAL' as GoalCategory, dueDate: '' })
  const [loading, setLoading]           = useState(true)

  const load = useCallback(async () => {
    const r = await fetch(`/api/goals?artistId=${artistId}`)
    if (r.ok) setGoals(await r.json())
    setLoading(false)
  }, [artistId])

  useEffect(() => { load() }, [load])

  async function createGoal(e: React.FormEvent) {
    e.preventDefault()
    const r = await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ artistId, ...goalForm }),
    })
    if (r.ok) { setGoalForm({ title: '', category: 'GENERAL', dueDate: '' }); setShowForm(false); load() }
  }

  async function addTask(goalId: string) {
    const title = taskInputs[goalId]?.trim()
    if (!title) return
    await fetch(`/api/goals/${goalId}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    })
    setTaskInputs(p => ({ ...p, [goalId]: '' }))
    load()
  }

  async function toggleTask(id: string, done: boolean) {
    await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done: !done }),
    })
    load()
  }

  async function delTask(id: string)  { await fetch(`/api/tasks/${id}`, { method: 'DELETE' }); load() }
  async function delGoal(id: string)  {
    if (!confirm('Delete this goal and all its tasks?')) return
    await fetch(`/api/goals/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div className="bg-gray-900 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-white font-semibold text-lg">Goals &amp; Tasks</h2>
          <p className="text-gray-400 text-xs mt-0.5">Track what you're working toward</p>
        </div>
        <button onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm px-3 py-1.5 rounded-lg transition-colors">
          <Plus size={14} /> Goal
        </button>
      </div>

      {showForm && (
        <form onSubmit={createGoal} className="mb-5 bg-gray-800 rounded-xl p-4 space-y-3">
          <input required placeholder="Goal title *" value={goalForm.title}
            onChange={e => setGoalForm(f => ({ ...f, title: e.target.value }))}
            className="w-full bg-gray-700 text-white text-sm rounded-lg px-3 py-2 placeholder-gray-500 outline-none focus:ring-1 focus:ring-purple-500" />
          <div className="grid grid-cols-2 gap-3">
            <select value={goalForm.category} onChange={e => setGoalForm(f => ({ ...f, category: e.target.value as GoalCategory }))}
              className="bg-gray-700 text-white text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-purple-500">
              {Object.entries(CAT).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
            </select>
            <input type="date" value={goalForm.dueDate}
              onChange={e => setGoalForm(f => ({ ...f, dueDate: e.target.value }))}
              className="bg-gray-700 text-white text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-purple-500" />
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 text-sm px-3 py-1.5 hover:text-white">Cancel</button>
            <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-4 py-1.5 rounded-lg">Create</button>
          </div>
        </form>
      )}

      {loading ? <p className="text-gray-500 text-sm">Loading…</p>
        : goals.length === 0 ? (
          <div className="text-center py-10">
            <Target size={32} className="text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Set your first goal to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {goals.map(goal => {
              const open = expanded === goal.id
              const done = goal.tasks.filter(t => t.done).length
              const total = goal.tasks.length
              return (
                <div key={goal.id} className="bg-gray-800 rounded-xl overflow-hidden">
                  <button onClick={() => setExpanded(open ? null : goal.id)} className="w-full p-3 text-left">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-white text-sm font-medium">{goal.title}</span>
                        <span className={`text-xs ${CAT[goal.category].color}`}>{CAT[goal.category].label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 text-xs">{done}/{total}</span>
                        <ChevronDown size={13} className={`text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                    <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-600 to-pink-500 rounded-full transition-all duration-500"
                        style={{ width: `${goal.progress}%` }} />
                    </div>
                    {goal.dueDate && (
                      <p className="text-gray-500 text-xs mt-1.5">
                        Due {new Date(goal.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    )}
                  </button>

                  {open && (
                    <div className="border-t border-gray-700 px-3 pb-3 pt-2 space-y-1">
                      {goal.tasks.map(task => (
                        <div key={task.id} className="flex items-center gap-2 group py-1">
                          <button onClick={() => toggleTask(task.id, task.done)}
                            className="flex-shrink-0 text-gray-400 hover:text-purple-400 transition-colors">
                            {task.done ? <CheckSquare size={15} className="text-purple-400" /> : <Square size={15} />}
                          </button>
                          <span className={`text-sm flex-1 ${task.done ? 'line-through text-gray-600' : 'text-gray-300'}`}>
                            {task.title}
                          </span>
                          <button onClick={() => delTask(task.id)}
                            className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                      <div className="flex gap-2 mt-2">
                        <input placeholder="Add a task…"
                          value={taskInputs[goal.id] ?? ''}
                          onChange={e => setTaskInputs(p => ({ ...p, [goal.id]: e.target.value }))}
                          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTask(goal.id))}
                          className="flex-1 bg-gray-700 text-white text-xs rounded-lg px-3 py-1.5 placeholder-gray-600 outline-none focus:ring-1 focus:ring-purple-500" />
                        <button onClick={() => addTask(goal.id)} className="text-purple-400 hover:text-purple-300 text-xs px-2">Add</button>
                      </div>
                      <div className="flex justify-end mt-1">
                        <button onClick={() => delGoal(goal.id)}
                          className="flex items-center gap-1 text-red-400 hover:text-red-300 text-xs">
                          <Trash2 size={11} /> Delete goal
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
    </div>
  )
}
