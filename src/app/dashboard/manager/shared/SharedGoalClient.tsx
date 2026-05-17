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
  { value: 'numeric_min', label: 'Numeric (Higher is better)' },
  { value: 'numeric_max', label: 'Numeric (Lower is better)' },
  { value: 'timeline', label: 'Timeline (Date-based)' },
  { value: 'zero', label: 'Zero-based (0 = Success)' },
]

export default function SharedGoalClient({ managerId, teamMembers }: {
  managerId: string
  teamMembers: { id: string; name: string; department: string }[]
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [thrustArea, setThrustArea] = useState(THRUST_AREAS[0])
  const [uomType, setUomType] = useState('numeric_min')
  const [target, setTarget] = useState('')
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [defaultWeightage, setDefaultWeightage] = useState('10')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const toggleMember = (id: string) => {
    setSelectedMembers(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    )
  }

  const handlePush = async () => {
    if (!title.trim()) return setError('Goal title is required')
    if (!target.trim()) return setError('Target is required')
    if (selectedMembers.length === 0) return setError('Select at least one team member')
    const w = parseFloat(defaultWeightage)
    if (isNaN(w) || w < 10) return setError('Default weightage must be at least 10%')

    setSubmitting(true)
    setError('')

    // Generate one shared group ID for all linked goals
    const sharedGroupId = crypto.randomUUID()

    const inserts = selectedMembers.map((memberId) => ({
      employee_id: memberId,
      title: title.trim(),
      description: description.trim(),
      thrust_area: thrustArea,
      uom_type: uomType,
      target: parseFloat(target),
      shared_target: parseFloat(target),
      weightage: w,
      status: 'approved', // shared goals are pre-approved
      is_shared: true,
      primary_owner_id: selectedMembers[0],
      shared_group_id: sharedGroupId,
    }))

    const { error: insertError } = await supabase.from('goals').insert(inserts)

    if (insertError) {
      setError('Something went wrong. Try again.')
      setSubmitting(false)
      return
    }

    // Audit log
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('audit_logs').insert({
      entity_type: 'goal',
      entity_id: user?.id,
      changed_by: user?.id,
      change_description: `Manager pushed shared goal "${title}" to ${selectedMembers.length} employees`
    })

    setSubmitting(false)
    setSuccess(true)
    setTimeout(() => {
      setSuccess(false)
      router.push('/dashboard/manager')
      router.refresh()
    }, 2000)
  }

  return (
    <div className="max-w-2xl mx-auto px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#f1f5f9]">Push Shared Goal</h1>
        <p className="text-slate-300 text-sm mt-1">Push a departmental KPI to multiple team members. They can only adjust weightage.</p>
      </div>

      {success && (
        <div className="rounded-xl p-4 mb-4 text-sm font-medium" style={{ backgroundColor: '#233141', border: '1px solid #2a3347', color: '#c7f0d7' }}>
          ✓ Shared goal pushed successfully to {selectedMembers.length} employees!
        </div>
      )}

      <div className="rounded-3xl border shadow-sm p-6 space-y-4" style={{ backgroundColor: '#1e2433', borderColor: '#2a3347' }}>
        <div>
          <label className="block text-xs font-medium text-[#f1f5f9] mb-1">Goal Title * <span className="text-slate-400">(read-only for recipients)</span></label>
          <input value={title} onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Reduce customer complaints by Q3"
            className="w-full border rounded-lg px-3 py-2 text-sm bg-[#243147] text-[#f1f5f9] placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#fbbf24]"
            style={{ borderColor: '#2a3347' }} />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#f1f5f9] mb-1">Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)}
            rows={2} placeholder="Context for this shared goal..."
            className="textarea-match focus:ring-[#fbbf24] text-[#f1f5f9]"
            style={{ borderColor: '#2a3347' }} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-[#f1f5f9] mb-1">Thrust Area</label>
            <select value={thrustArea} onChange={e => setThrustArea(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm bg-[#243147] text-[#f1f5f9] focus:outline-none focus:ring-2 focus:ring-[#fbbf24]"
              style={{ borderColor: '#2a3347' }}>
              {THRUST_AREAS.map(a => <option key={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#f1f5f9] mb-1">UoM Type</label>
            <select value={uomType} onChange={e => setUomType(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm bg-[#243147] text-[#f1f5f9] focus:outline-none focus:ring-2 focus:ring-[#fbbf24]"
              style={{ borderColor: '#2a3347' }}>
              {UOM_TYPES.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#f1f5f9] mb-1">Target * <span className="text-slate-400">(read-only for recipients)</span></label>
            <input type="number" value={target} onChange={e => setTarget(e.target.value)}
              placeholder="e.g. 50"
              className="w-full border rounded-lg px-3 py-2 text-sm bg-[#243147] text-[#f1f5f9] placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#fbbf24]"
              style={{ borderColor: '#2a3347' }} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#f1f5f9] mb-1">Default Weightage % <span className="text-slate-400">(recipients can change)</span></label>
            <input type="number" value={defaultWeightage} onChange={e => setDefaultWeightage(e.target.value)}
              min={10} max={100}
              className="w-full border rounded-lg px-3 py-2 text-sm bg-[#243147] text-[#f1f5f9] placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#fbbf24]"
              style={{ borderColor: '#2a3347' }} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#f1f5f9] mb-2">Push To * <span className="text-slate-400">(select team members)</span></label>
          {teamMembers.length === 0 ? (
            <p className="text-sm text-slate-400">No team members found</p>
          ) : (
            <div className="space-y-2">
              <button
                onClick={() => setSelectedMembers(
                  selectedMembers.length === teamMembers.length ? [] : teamMembers.map(m => m.id)
                )}
                className="text-xs text-[#fbbf24] hover:underline">
                {selectedMembers.length === teamMembers.length ? 'Deselect all' : 'Select all'}
              </button>
              {teamMembers.map(m => (
                <label key={m.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${selectedMembers.includes(m.id) ? 'border-[#fbbf24] bg-[#2a3347]' : 'border-[#2a3347] hover:bg-[#243147]'}`}>
                  <input type="checkbox" checked={selectedMembers.includes(m.id)}
                    onChange={() => toggleMember(m.id)}
                    className="accent-[#fbbf24]" />
                  <div>
                    <p className="text-sm font-medium text-[#f1f5f9]">{m.name}</p>
                    <p className="text-xs text-slate-400">{m.department}</p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="text-sm rounded-xl p-3" style={{ backgroundColor: '#3a1f1f', border: '1px solid #7f1d1d', color: '#fecaca' }}>{error}</div>
        )}

        <div className="flex gap-3 justify-end pt-2">
          <button onClick={() => router.back()}
            className="px-5 py-2.5 text-sm text-slate-200 border rounded-xl hover:bg-[#243147] transition"
            style={{ borderColor: '#2a3347' }}>
            Cancel
          </button>
          <button onClick={handlePush} disabled={submitting}
            className="px-6 py-2.5 text-sm rounded-xl transition disabled:opacity-60 font-medium"
            style={{ backgroundColor: '#fbbf24', color: '#1e2433' }}>
            {submitting ? 'Pushing...' : `Push to ${selectedMembers.length} Employee${selectedMembers.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  )
}