import { useState, useMemo } from 'react'
import { useLocalStorage } from '../shared/hooks/useLocalStorage'
import ToolLayout from '../shared/ToolLayout'
import ResultCard from '../shared/ResultCard'
import ExportButton from '../shared/ExportButton'
import ShareButton from '../shared/ShareButton'
import { generateId } from '../shared/utils'
import { useToast } from '../shared/Toast'

const PHASE_COLORS = [
  'var(--accent)',
  'var(--info)',
  'var(--warning)',
  'var(--success)',
  'var(--danger)',
  '#a78bfa',
  '#f472b6',
  '#34d399',
]

function toDateStr(d) {
  if (!d) return ''
  return typeof d === 'string' ? d : new Date(d).toISOString().split('T')[0]
}

function daysBetween(a, b) {
  const msPerDay = 86400000
  return Math.max(0, Math.round((new Date(b) - new Date(a)) / msPerDay))
}

function formatDate(d) {
  if (!d) return ''
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function App() {
  const toast = useToast()
  const [projectName, setProjectName] = useLocalStorage('skynet-timeline-projectName', '')
  const [startDate, setStartDate] = useLocalStorage('skynet-timeline-startDate', '')
  const [endDate, setEndDate] = useLocalStorage('skynet-timeline-endDate', '')
  const [phases, setPhases] = useLocalStorage('skynet-timeline-phases', [])
  const [milestones, setMilestones] = useLocalStorage('skynet-timeline-milestones', [])

  const [editingPhase, setEditingPhase] = useState(null)
  const [phaseName, setPhaseName] = useState('')
  const [phaseStart, setPhaseStart] = useState('')
  const [phaseEnd, setPhaseEnd] = useState('')
  const [phaseColor, setPhaseColor] = useState(PHASE_COLORS[0])
  const [phaseCompleted, setPhaseCompleted] = useState(false)

  const [milestoneName, setMilestoneName] = useState('')
  const [milestoneDate, setMilestoneDate] = useState('')

  const totalDays = useMemo(() => {
    if (!startDate || !endDate) return 0
    return daysBetween(startDate, endDate)
  }, [startDate, endDate])

  const totalWeeks = useMemo(() => Math.ceil(totalDays / 7), [totalDays])

  const resetPhaseForm = () => {
    setEditingPhase(null)
    setPhaseName('')
    setPhaseStart('')
    setPhaseEnd('')
    setPhaseColor(PHASE_COLORS[phases.length % PHASE_COLORS.length])
    setPhaseCompleted(false)
  }

  const handleAddPhase = () => {
    if (!phaseName || !phaseStart || !phaseEnd) return
    if (editingPhase) {
      setPhases(prev => prev.map(p =>
        p.id === editingPhase ? { ...p, name: phaseName, start: phaseStart, end: phaseEnd, color: phaseColor, completed: phaseCompleted } : p
      ))
      if (toast) toast('Phase updated', 'success')
    } else {
      const newPhase = {
        id: generateId(),
        name: phaseName,
        start: phaseStart,
        end: phaseEnd,
        color: phaseColor,
        completed: phaseCompleted,
      }
      setPhases(prev => [...prev, newPhase])
      if (toast) toast('Phase added', 'success')
    }
    resetPhaseForm()
  }

  const handleEditPhase = (phase) => {
    setEditingPhase(phase.id)
    setPhaseName(phase.name)
    setPhaseStart(phase.start)
    setPhaseEnd(phase.end)
    setPhaseColor(phase.color)
    setPhaseCompleted(phase.completed || false)
  }

  const handleDeletePhase = (id) => {
    setPhases(prev => prev.filter(p => p.id !== id))
    if (editingPhase === id) resetPhaseForm()
    if (toast) toast('Phase removed', 'info')
  }

  const handleAddMilestone = () => {
    if (!milestoneName || !milestoneDate) return
    setMilestones(prev => [...prev, { id: generateId(), name: milestoneName, date: milestoneDate }])
    setMilestoneName('')
    setMilestoneDate('')
    if (toast) toast('Milestone added', 'success')
  }

  const handleDeleteMilestone = (id) => {
    setMilestones(prev => prev.filter(m => m.id !== id))
    if (toast) toast('Milestone removed', 'info')
  }

  const completedPhases = phases.filter(p => p.completed).length
  const progressPct = phases.length > 0 ? Math.round((completedPhases / phases.length) * 100) : 0

  const getShareURL = () => {
    const url = new URL(window.location.href)
    url.search = ''
    if (projectName) url.searchParams.set('project', projectName)
    if (startDate) url.searchParams.set('start', startDate)
    if (endDate) url.searchParams.set('end', endDate)
    return url.toString()
  }

  return (
    <ToolLayout
      title="Project Timeline Generator"
      description="Plan projects with visual Gantt-style timelines, milestones, and progress tracking."
      category="Agency Operations"
      icon="📅"
    >
      <div id="timeline-export">
        {/* Project Setup */}
        <ResultCard title="Project Details" icon="📋">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-body)' }}>Project Name</label>
              <input
                type="text"
                value={projectName}
                onChange={e => setProjectName(e.target.value)}
                placeholder="e.g., Website Redesign"
                className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-body)' }}>Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-body)' }}>End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                min={startDate}
                className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
              />
            </div>
          </div>
          {totalDays > 0 && (
            <div className="mt-4 flex flex-wrap gap-4">
              <div className="rounded-lg px-4 py-2" style={{ background: 'var(--accent-soft)' }}>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Duration: </span>
                <span className="font-semibold text-sm" style={{ color: 'var(--accent)' }}>{totalDays} days ({totalWeeks} weeks)</span>
              </div>
              <div className="rounded-lg px-4 py-2" style={{ background: 'var(--bg-elevated)' }}>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Phases: </span>
                <span className="font-semibold text-sm" style={{ color: 'var(--text-heading)' }}>{phases.length}</span>
              </div>
              <div className="rounded-lg px-4 py-2" style={{ background: progressPct === 100 ? 'var(--success-soft)' : 'var(--bg-elevated)' }}>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Progress: </span>
                <span className="font-semibold text-sm" style={{ color: progressPct === 100 ? 'var(--success)' : 'var(--text-heading)' }}>{progressPct}%</span>
              </div>
            </div>
          )}
        </ResultCard>

        {/* Add Phase Form */}
        <ResultCard title={editingPhase ? 'Edit Phase' : 'Add Phase'} icon="🔧" className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Phase Name</label>
              <input
                type="text"
                value={phaseName}
                onChange={e => setPhaseName(e.target.value)}
                placeholder="e.g., Discovery"
                className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
              />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Start Date</label>
              <input
                type="date"
                value={phaseStart}
                onChange={e => setPhaseStart(e.target.value)}
                min={startDate}
                max={endDate}
                className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
              />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>End Date</label>
              <input
                type="date"
                value={phaseEnd}
                onChange={e => setPhaseEnd(e.target.value)}
                min={phaseStart || startDate}
                max={endDate}
                className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
              />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Color</label>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {PHASE_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setPhaseColor(c)}
                    className="w-7 h-7 rounded-md transition-transform"
                    style={{
                      background: c,
                      border: phaseColor === c ? '2px solid var(--text-heading)' : '2px solid transparent',
                      transform: phaseColor === c ? 'scale(1.15)' : 'scale(1)',
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="flex flex-col justify-end gap-2">
              <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: 'var(--text-muted)' }}>
                <input type="checkbox" checked={phaseCompleted} onChange={e => setPhaseCompleted(e.target.checked)} />
                Completed
              </label>
              <button
                onClick={handleAddPhase}
                disabled={!phaseName || !phaseStart || !phaseEnd}
                className="px-4 py-2 text-sm font-medium rounded-lg transition-all disabled:opacity-40"
                style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}
              >
                {editingPhase ? 'Update Phase' : 'Add Phase'}
              </button>
            </div>
          </div>
          {editingPhase && (
            <button onClick={resetPhaseForm} className="mt-2 text-xs underline" style={{ color: 'var(--text-muted)' }}>
              Cancel editing
            </button>
          )}
        </ResultCard>

        {/* Phase List */}
        {phases.length > 0 && (
          <ResultCard title="Phases" icon="📋" className="mt-6">
            <div className="space-y-2">
              {phases.map(phase => (
                <div
                  key={phase.id}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
                >
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: phase.color }} />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-sm" style={{ color: 'var(--text-heading)', textDecoration: phase.completed ? 'line-through' : 'none' }}>
                      {phase.name}
                    </span>
                    <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>
                      {formatDate(phase.start)} - {formatDate(phase.end)} ({daysBetween(phase.start, phase.end)} days)
                    </span>
                  </div>
                  {phase.completed && (
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--success-soft)', color: 'var(--success)' }}>Done</span>
                  )}
                  <button onClick={() => handleEditPhase(phase)} className="text-xs px-2 py-1 rounded" style={{ color: 'var(--info)' }}>Edit</button>
                  <button onClick={() => handleDeletePhase(phase.id)} className="text-xs px-2 py-1 rounded" style={{ color: 'var(--danger)' }}>Delete</button>
                </div>
              ))}
            </div>
          </ResultCard>
        )}

        {/* Add Milestone */}
        <ResultCard title="Milestones" icon="💎" className="mt-6">
          <div className="flex flex-wrap gap-3 mb-4">
            <input
              type="text"
              value={milestoneName}
              onChange={e => setMilestoneName(e.target.value)}
              placeholder="Milestone name"
              className="flex-1 min-w-[200px] px-3 py-2 rounded-lg text-sm focus:outline-none"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
            />
            <input
              type="date"
              value={milestoneDate}
              onChange={e => setMilestoneDate(e.target.value)}
              min={startDate}
              max={endDate}
              className="px-3 py-2 rounded-lg text-sm focus:outline-none"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
            />
            <button
              onClick={handleAddMilestone}
              disabled={!milestoneName || !milestoneDate}
              className="px-4 py-2 text-sm font-medium rounded-lg transition-all disabled:opacity-40"
              style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}
            >
              Add Milestone
            </button>
          </div>
          {milestones.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {milestones.map(m => (
                <div key={m.id} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--warning)' }}>&#9670;</span>
                  <span style={{ color: 'var(--text-heading)' }}>{m.name}</span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(m.date)}</span>
                  <button onClick={() => handleDeleteMilestone(m.id)} className="ml-1 text-xs" style={{ color: 'var(--danger)' }}>&times;</button>
                </div>
              ))}
            </div>
          )}
        </ResultCard>

        {/* Visual Timeline */}
        {startDate && endDate && totalDays > 0 && (phases.length > 0 || milestones.length > 0) && (
          <ResultCard title="Visual Timeline" icon="📊" className="mt-6">
            {/* Progress Bar */}
            {phases.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Overall Progress</span>
                  <span className="text-sm font-semibold" style={{ color: progressPct === 100 ? 'var(--success)' : 'var(--accent)' }}>{progressPct}%</span>
                </div>
                <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPct}%`, background: progressPct === 100 ? 'var(--success)' : 'var(--accent)' }}
                  />
                </div>
              </div>
            )}

            {/* Date labels */}
            <div className="flex items-center justify-between mb-2 text-xs" style={{ color: 'var(--text-muted)' }}>
              <span>{formatDate(startDate)}</span>
              {totalWeeks > 2 && (
                <span>Week {Math.ceil(totalWeeks / 2)}</span>
              )}
              <span>{formatDate(endDate)}</span>
            </div>

            {/* Timeline container */}
            <div className="relative rounded-lg overflow-hidden" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', minHeight: `${(phases.length * 44) + 60}px` }}>
              {/* Week grid lines */}
              {Array.from({ length: totalWeeks + 1 }, (_, i) => {
                const leftPct = totalDays > 0 ? (i * 7 / totalDays) * 100 : 0
                if (leftPct > 100) return null
                return (
                  <div
                    key={`grid-${i}`}
                    className="absolute top-0 bottom-0"
                    style={{ left: `${leftPct}%`, width: '1px', background: 'var(--border)', opacity: 0.5 }}
                  />
                )
              })}

              {/* Phase bars */}
              {phases.map((phase, idx) => {
                const phaseStartOffset = daysBetween(startDate, phase.start)
                const phaseDuration = daysBetween(phase.start, phase.end)
                const leftPct = (phaseStartOffset / totalDays) * 100
                const widthPct = Math.max(1, (phaseDuration / totalDays) * 100)
                return (
                  <div
                    key={phase.id}
                    className="absolute flex items-center rounded-md px-2 text-xs font-medium overflow-hidden"
                    title={`${phase.name}: ${formatDate(phase.start)} - ${formatDate(phase.end)} (${phaseDuration} days)`}
                    style={{
                      left: `${Math.min(leftPct, 100)}%`,
                      width: `${Math.min(widthPct, 100 - leftPct)}%`,
                      top: `${idx * 44 + 12}px`,
                      height: '32px',
                      background: phase.completed ? `${phase.color}66` : phase.color,
                      color: '#fff',
                      opacity: phase.completed ? 0.7 : 1,
                      minWidth: '24px',
                    }}
                  >
                    <span className="truncate">{phase.name}</span>
                    {phase.completed && <span className="ml-1">&#10003;</span>}
                  </div>
                )
              })}

              {/* Milestone markers */}
              {milestones.map(m => {
                const offset = daysBetween(startDate, m.date)
                const leftPct = (offset / totalDays) * 100
                return (
                  <div
                    key={m.id}
                    className="absolute flex flex-col items-center"
                    style={{ left: `${Math.min(leftPct, 99)}%`, bottom: '4px' }}
                    title={`${m.name}: ${formatDate(m.date)}`}
                  >
                    <div
                      className="w-4 h-4 rotate-45"
                      style={{ background: 'var(--warning)', border: '2px solid var(--bg-card)' }}
                    />
                    <span className="text-[10px] mt-0.5 whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{m.name}</span>
                  </div>
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-4">
              {phases.map(phase => (
                <div key={phase.id} className="flex items-center gap-1.5 text-xs">
                  <div className="w-3 h-3 rounded" style={{ background: phase.color }} />
                  <span style={{ color: 'var(--text-muted)' }}>{phase.name}</span>
                </div>
              ))}
              {milestones.length > 0 && (
                <div className="flex items-center gap-1.5 text-xs">
                  <span style={{ color: 'var(--warning)' }}>&#9670;</span>
                  <span style={{ color: 'var(--text-muted)' }}>Milestones</span>
                </div>
              )}
            </div>
          </ResultCard>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <ExportButton
          elementId="timeline-export"
          filename={`${projectName || 'project'}-timeline.pdf`}
          label="Export PDF"
        />
        <ShareButton getShareURL={getShareURL} />
      </div>
    </ToolLayout>
  )
}
