'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const THRUST_AREAS = [
  'Revenue Growth', 'Cost Optimization', 'Customer Satisfaction',
  'People Development', 'Process Improvement', 'Innovation',
  'Compliance & Risk', 'Digital Transformation'
]

const UOM_TYPES = [
  { value: 'numeric_min', label: 'Numeric (Higher is better) — e.g. Sales' },
  { value: 'numeric_max', label: 'Numeric (Lower is better) — e.g. TAT, Cost' },
  { value: 'timeline', label: 'Timeline (Date-based completion)' },
  { value: 'zero', label: 'Zero-based (0 = Success) — e.g. Safety incidents' },
]

interface GoalRow {
  title: string
  description: string
  thrust_area: string
  uom_type: string
  target: string
  weightage: string
}

const emptyGoal = (): GoalRow => ({
  title: '', description: '', thrust_area: THRUST_AREAS[0],
  uom_type: 'numeric_min', target: '', weightage: ''
})

export default function NewGoalPage() {
  const [goals, setGoals] = useState<GoalRow[]>([emptyGoal()])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const totalWeightage = goals.reduce((sum, g) => sum + (parseFloat(g.weightage) || 0), 0)
  const weightageValid = totalWeightage === 100
  const canAddMore = goals.length < 8

  const updateGoal = (index: number, field: keyof GoalRow, value: string) => {
    setGoals(prev => prev.map((g, i) => i === index ? { ...g, [field]: value } : g))
  }

  const addGoal = () => {
    if (canAddMore) setGoals(prev => [...prev, emptyGoal()])
  }

  const removeGoal = (index: number) => {
    if (goals.length > 1) setGoals(prev => prev.filter((_, i) => i !== index))
  }

  const validate = () => {
    for (const g of goals) {
      if (!g.title.trim()) return 'All goals must have a title'
      if (!g.target.trim()) return 'All goals must have a target'
      const w = parseFloat(g.weightage)
      if (isNaN(w) || w < 10) return 'Each goal must have at least 10% weightage'
    }
    if (!weightageValid) return `Total weightage must be exactly 100% (currently ${totalWeightage}%)`
    return ''
  }

  const handleSubmit = async () => {
    const err = validate()
    if (err) { setError(err); return }

    setSubmitting(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    // Check existing goals count
    const { count } = await supabase
      .from('goals')
      .select('*', { count: 'exact', head: true })
      .eq('employee_id', user.id)

    if ((count ?? 0) + goals.length > 8) {
      setError(`You can have max 8 goals. You already have ${count}.`)
      setSubmitting(false)
      return
    }

    const inserts = goals.map(g => ({
      employee_id: user.id,
      title: g.title.trim(),
      description: g.description.trim(),
      thrust_area: g.thrust_area,
      uom_type: g.uom_type,
      target: parseFloat(g.target),
      weightage: parseFloat(g.weightage),
      status: 'submitted'
    }))

    const { error: insertError } = await supabase.from('goals').insert(inserts)

    if (insertError) {
      setError('Something went wrong. Try again.')
      setSubmitting(false)
    } else {
      router.push('/dashboard/employee')
      router.refresh()
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Create Goal Sheet</h1>
        <p className="text-gray-500 text-sm mt-1">Add up to 8 goals. Total weightage must equal 100%.</p>
      </div>

      {/* Weightage tracker */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Total Weightage</p>
          <p className={`text-2xl font-bold ${weightageValid ? 'text-green-600' : totalWeightage > 100 ? 'text-red-500' : 'text-yellow-500'}`}>
            {totalWeightage}%
            <span className="text-sm font-normal text-gray-400 ml-2">/ 100%</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{goals.length}/8 goals</span>
          {weightageValid && (
            <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium">✓ Valid</span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-gray-100 rounded-full mb-6 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${totalWeightage > 100 ? 'bg-red-400' : weightageValid ? 'bg-green-500' : 'bg-blue-500'}`}
          style={{ width: `${Math.min(totalWeightage, 100)}%` }}
        />
      </div>

      {/* Goal cards */}
      <div className="space-y-4">
        {goals.map((goal, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-700">Goal {index + 1}</h3>
              {goals.length > 1 && (
                <button onClick={() => removeGoal(index)}
                  className="text-xs text-red-400 hover:text-red-600 transition">
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Goal Title *</label>
                <input
                  value={goal.title}
                  onChange={e => updateGoal(index, 'title', e.target.value)}
                  placeholder="e.g. Increase quarterly sales revenue"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                <textarea
                  value={goal.description}
                  onChange={e => updateGoal(index, 'description', e.target.value)}
                  placeholder="Brief description of this goal..."
                  rows={2}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Thrust Area *</label>
                <select
                  value={goal.thrust_area}
                  onChange={e => updateGoal(index, 'thrust_area', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {THRUST_AREAS.map(a => <option key={a}>{a}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Unit of Measurement *</label>
                <select
                  value={goal.uom_type}
                  onChange={e => updateGoal(index, 'uom_type', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {UOM_TYPES.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Target *</label>
                <input
                  value={goal.target}
                  onChange={e => updateGoal(index, 'target', e.target.value)}
                  placeholder={goal.uom_type === 'timeline' ? 'e.g. 30 (days)' : 'e.g. 500000'}
                  type="number"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Weightage % * <span className="text-gray-400">(min 10%)</span>
                </label>
                <input
                  value={goal.weightage}
                  onChange={e => updateGoal(index, 'weightage', e.target.value)}
                  placeholder="e.g. 25"
                  type="number"
                  min={10}
                  max={100}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add goal button */}
      {canAddMore && (
        <button onClick={addGoal}
          className="mt-4 w-full border-2 border-dashed border-gray-200 text-gray-400 hover:border-blue-300 hover:text-blue-500 rounded-2xl py-4 text-sm font-medium transition">
          + Add Another Goal
        </button>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-4">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="mt-6 flex gap-3 justify-end">
        <button onClick={() => router.back()}
          className="px-5 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition">
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="px-6 py-2.5 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-60 font-medium">
          {submitting ? 'Submitting...' : 'Submit Goals for Approval'}
        </button>
      </div>
    </div>
  )
}