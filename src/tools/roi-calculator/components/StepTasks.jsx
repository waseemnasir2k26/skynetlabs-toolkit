import React from 'react'
import { TASK_FREQUENCIES, EXAMPLE_TASKS } from '../utils/constants'

function TaskCard({ task, onUpdate, onRemove, index }) {
  return (
    <div className="glass rounded-xl p-4 sm:p-5 space-y-4 gradient-border group hover:border-primary-500/20 transition-all duration-300">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-primary-500/60">TASK #{index + 1}</span>
        <button
          onClick={() => onRemove(task.id)}
          className="text-gray-600 hover:text-red-400 transition-colors p-1"
          title="Remove task"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <div>
        <input
          type="text"
          value={task.name}
          onChange={(e) => onUpdate(task.id, 'name', e.target.value)}
          placeholder="Task name (e.g., Email Management)"
          className="w-full px-4 py-2.5 rounded-lg bg-dark-300 border border-dark-400 text-white text-sm placeholder-gray-600 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none transition-colors"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Hours / Week</label>
          <input
            type="number"
            min="0.5"
            max="168"
            step="0.5"
            value={task.hoursPerWeek}
            onChange={(e) => onUpdate(task.id, 'hoursPerWeek', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2.5 rounded-lg bg-dark-300 border border-dark-400 text-white text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Hourly Cost ($)</label>
          <input
            type="number"
            min="1"
            step="1"
            value={task.hourlyCost}
            onChange={(e) => onUpdate(task.id, 'hourlyCost', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2.5 rounded-lg bg-dark-300 border border-dark-400 text-white text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Frequency</label>
          <select
            value={task.frequency}
            onChange={(e) => onUpdate(task.id, 'frequency', e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg bg-dark-300 border border-dark-400 text-white text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none transition-colors appearance-none cursor-pointer"
          >
            {TASK_FREQUENCIES.map((f) => (
              <option key={f.label} value={f.label}>{f.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="text-right">
        <span className="text-xs text-gray-500">
          Est. annual cost:{' '}
          <span className="text-primary-400 font-semibold">
            ${(task.hoursPerWeek * task.hourlyCost * 52).toLocaleString()}
          </span>
        </span>
      </div>
    </div>
  )
}

export default function StepTasks({ tasks, onChange, onNext, onBack }) {
  const addTask = () => {
    const newTask = {
      id: Date.now().toString(),
      name: '',
      hoursPerWeek: 5,
      hourlyCost: 30,
      frequency: 'Weekly',
    }
    onChange([...tasks, newTask])
  }

  const updateTask = (id, field, value) => {
    onChange(tasks.map((t) => (t.id === id ? { ...t, [field]: value } : t)))
  }

  const removeTask = (id) => {
    if (tasks.length > 1) {
      onChange(tasks.filter((t) => t.id !== id))
    }
  }

  const loadExamples = () => {
    onChange(EXAMPLE_TASKS.map((t) => ({ ...t, id: Date.now().toString() + t.id })))
  }

  const isValid = tasks.length > 0 && tasks.every((t) => t.name && t.hoursPerWeek > 0 && t.hourlyCost > 0)

  const totalWeeklyHours = tasks.reduce((sum, t) => sum + (t.hoursPerWeek || 0), 0)
  const totalAnnualCost = tasks.reduce((sum, t) => sum + (t.hoursPerWeek || 0) * (t.hourlyCost || 0) * 52, 0)

  return (
    <div className="w-full max-w-3xl mx-auto px-4 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Add your manual tasks
        </h2>
        <p className="text-gray-400 text-sm sm:text-base">
          List the repetitive tasks you want to automate
        </p>
      </div>

      {/* Quick action */}
      <div className="flex justify-center mb-6">
        <button
          onClick={loadExamples}
          className="text-sm text-primary-400/70 hover:text-primary-400 transition-colors underline underline-offset-4 decoration-primary-500/30"
        >
          Load example tasks for demo
        </button>
      </div>

      {/* Summary bar */}
      <div className="glass rounded-xl p-4 mb-6 flex flex-wrap gap-6 justify-center">
        <div className="text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Tasks</p>
          <p className="text-lg font-bold text-white">{tasks.length}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Weekly Hours</p>
          <p className="text-lg font-bold text-primary-400">{totalWeeklyHours}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Annual Cost</p>
          <p className="text-lg font-bold text-primary-400">${totalAnnualCost.toLocaleString()}</p>
        </div>
      </div>

      {/* Task list */}
      <div className="space-y-4 mb-6">
        {tasks.map((task, i) => (
          <TaskCard
            key={task.id}
            task={task}
            index={i}
            onUpdate={updateTask}
            onRemove={removeTask}
          />
        ))}
      </div>

      {/* Add task button */}
      <button
        onClick={addTask}
        className="w-full py-3 rounded-xl border-2 border-dashed border-dark-400 text-gray-500 hover:border-primary-500/40 hover:text-primary-400 transition-all duration-300 text-sm font-medium"
      >
        <svg className="inline-block w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Add Another Task
      </button>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-xl font-medium text-sm text-gray-400 hover:text-white border border-dark-400 hover:border-gray-500 transition-all duration-300"
        >
          <svg className="inline-block mr-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!isValid}
          className={`
            px-8 py-3 rounded-xl font-semibold text-sm transition-all duration-300
            ${isValid
              ? 'bg-primary-500 text-dark hover:bg-primary-400 shadow-lg shadow-primary/30 hover:shadow-primary/50'
              : 'bg-dark-400 text-gray-600 cursor-not-allowed'
            }
          `}
        >
          Next Step
          <svg className="inline-block ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}
