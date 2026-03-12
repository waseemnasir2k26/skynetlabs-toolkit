import { useState, useMemo } from 'react'
import { useLocalStorage } from '../shared/hooks/useLocalStorage'
import ToolLayout from '../shared/ToolLayout'
import ResultCard from '../shared/ResultCard'
import CopyButton from '../shared/CopyButton'
import { useToast } from '../shared/Toast'
import { generateId } from '../shared/utils'

const QUESTION_TYPES = [
  { value: 'rating', label: 'Rating (1-5 Stars)' },
  { value: 'text', label: 'Text Response' },
  { value: 'multiple', label: 'Multiple Choice' },
  { value: 'nps', label: 'NPS (0-10)' },
]

function QuestionEditor({ question, onUpdate, onRemove, onMoveUp, onMoveDown, isFirst, isLast }) {
  const [editingOptions, setEditingOptions] = useState(false)

  return (
    <div
      className="rounded-lg p-4 space-y-3"
      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Question</label>
            <input
              type="text"
              value={question.text}
              onChange={e => onUpdate({ ...question, text: e.target.value })}
              placeholder="Enter your question..."
              className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
              style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
            />
          </div>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Type</label>
              <select
                value={question.type}
                onChange={e => onUpdate({ ...question, type: e.target.value, options: e.target.value === 'multiple' ? (question.options?.length ? question.options : ['Option 1', 'Option 2', 'Option 3']) : question.options })}
                className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
              >
                {QUESTION_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm pb-2 cursor-pointer" style={{ color: 'var(--text-body)' }}>
              <input
                type="checkbox"
                checked={question.required}
                onChange={e => onUpdate({ ...question, required: e.target.checked })}
                style={{ accentColor: 'var(--accent)' }}
              />
              Required
            </label>
          </div>
          {question.type === 'multiple' && (
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                Options (one per line)
              </label>
              {editingOptions ? (
                <textarea
                  value={(question.options || []).join('\n')}
                  onChange={e => onUpdate({ ...question, options: e.target.value.split('\n') })}
                  onBlur={() => setEditingOptions(false)}
                  rows={4}
                  autoFocus
                  className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none resize-y"
                  style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
                />
              ) : (
                <div
                  className="rounded-lg px-3 py-2 text-sm cursor-pointer"
                  style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-body)' }}
                  onClick={() => setEditingOptions(true)}
                >
                  {(question.options || []).filter(Boolean).map((opt, i) => (
                    <div key={i} className="py-0.5">{opt}</div>
                  ))}
                  {(!question.options || question.options.length === 0) && (
                    <span style={{ color: 'var(--text-muted)' }}>Click to add options...</span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            className="p-1.5 rounded transition-all"
            style={{ background: isFirst ? 'transparent' : 'var(--bg-card)', color: isFirst ? 'var(--text-muted)' : 'var(--text-body)', border: '1px solid var(--border)', opacity: isFirst ? 0.4 : 1 }}
            title="Move up"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
          </button>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            className="p-1.5 rounded transition-all"
            style={{ background: isLast ? 'transparent' : 'var(--bg-card)', color: isLast ? 'var(--text-muted)' : 'var(--text-body)', border: '1px solid var(--border)', opacity: isLast ? 0.4 : 1 }}
            title="Move down"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          <button
            onClick={onRemove}
            className="p-1.5 rounded transition-all"
            style={{ background: 'var(--danger-soft)', color: 'var(--danger)', border: '1px solid transparent' }}
            title="Remove question"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      </div>
    </div>
  )
}

function SurveyPreview({ title, intro, thankYou, questions }) {
  const [previewResponses, setPreviewResponses] = useState({})

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-heading)' }}>{title || 'Untitled Survey'}</h2>
        {intro && <p className="text-sm" style={{ color: 'var(--text-body)' }}>{intro}</p>}
      </div>

      {questions.map((q, idx) => (
        <div
          key={q.id}
          className="rounded-lg p-4"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        >
          <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-heading)' }}>
            {idx + 1}. {q.text || 'Untitled Question'}
            {q.required && <span style={{ color: 'var(--danger)' }}> *</span>}
          </p>

          {q.type === 'rating' && (
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setPreviewResponses(prev => ({ ...prev, [q.id]: star }))}
                  className="text-2xl transition-transform hover:scale-110"
                  style={{ color: (previewResponses[q.id] || 0) >= star ? 'var(--warning, #f59e0b)' : 'var(--text-muted)' }}
                >
                  {(previewResponses[q.id] || 0) >= star ? '\u2605' : '\u2606'}
                </button>
              ))}
            </div>
          )}

          {q.type === 'text' && (
            <textarea
              rows={3}
              placeholder="Type your response..."
              value={previewResponses[q.id] || ''}
              onChange={e => setPreviewResponses(prev => ({ ...prev, [q.id]: e.target.value }))}
              className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none resize-y"
              style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
            />
          )}

          {q.type === 'multiple' && (
            <div className="space-y-2">
              {(q.options || []).filter(Boolean).map((opt, i) => (
                <label key={i} className="flex items-center gap-2 cursor-pointer text-sm" style={{ color: 'var(--text-body)' }}>
                  <input
                    type="radio"
                    name={`preview-${q.id}`}
                    checked={previewResponses[q.id] === opt}
                    onChange={() => setPreviewResponses(prev => ({ ...prev, [q.id]: opt }))}
                    style={{ accentColor: 'var(--accent)' }}
                  />
                  {opt}
                </label>
              ))}
            </div>
          )}

          {q.type === 'nps' && (
            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: 11 }, (_, i) => i).map(n => (
                <button
                  key={n}
                  onClick={() => setPreviewResponses(prev => ({ ...prev, [q.id]: n }))}
                  className="w-9 h-9 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: previewResponses[q.id] === n ? 'var(--accent)' : 'var(--bg-input)',
                    color: previewResponses[q.id] === n ? 'var(--text-on-accent)' : 'var(--text-body)',
                    border: '1px solid var(--border)',
                  }}
                >
                  {n}
                </button>
              ))}
              <div className="w-full flex justify-between text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                <span>Not likely</span>
                <span>Very likely</span>
              </div>
            </div>
          )}
        </div>
      ))}

      {questions.length > 0 && (
        <div className="text-center">
          <button
            className="px-6 py-2.5 rounded-lg font-medium text-sm transition-all"
            style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}
          >
            Submit Feedback
          </button>
        </div>
      )}

      {thankYou && (
        <div className="text-center rounded-lg p-4" style={{ background: 'var(--accent-soft)', border: '1px solid var(--accent)' }}>
          <p className="text-sm font-medium" style={{ color: 'var(--accent)' }}>Thank You Message Preview:</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-body)' }}>{thankYou}</p>
        </div>
      )}
    </div>
  )
}

export default function App() {
  const [surveyTitle, setSurveyTitle] = useLocalStorage('skynet-feedback-survey-title', 'Client Feedback Survey')
  const [introText, setIntroText] = useLocalStorage('skynet-feedback-survey-intro', 'We value your feedback! Please take a moment to share your experience working with us.')
  const [thankYouMessage, setThankYouMessage] = useLocalStorage('skynet-feedback-survey-thankyou', 'Thank you for your feedback! We truly appreciate your time and insights.')
  const [questions, setQuestions] = useLocalStorage('skynet-feedback-survey-questions', [
    { id: generateId(), type: 'rating', text: 'How would you rate our overall service quality?', required: true, options: [] },
    { id: generateId(), type: 'nps', text: 'How likely are you to recommend us to a colleague?', required: true, options: [] },
    { id: generateId(), type: 'text', text: 'What did we do well?', required: false, options: [] },
    { id: generateId(), type: 'multiple', text: 'Which service did you use?', required: true, options: ['Web Design', 'SEO', 'Branding', 'Social Media', 'Other'] },
    { id: generateId(), type: 'text', text: 'How could we improve?', required: false, options: [] },
  ])
  const [responses] = useLocalStorage('skynet-feedback-survey-responses', [])
  const [activeTab, setActiveTab] = useState('builder')
  const toast = useToast()

  const addQuestion = () => {
    setQuestions(prev => [
      ...prev,
      { id: generateId(), type: 'rating', text: '', required: false, options: [] },
    ])
  }

  const updateQuestion = (id, updated) => {
    setQuestions(prev => prev.map(q => q.id === id ? updated : q))
  }

  const removeQuestion = (id) => {
    setQuestions(prev => prev.filter(q => q.id !== id))
  }

  const moveQuestion = (index, direction) => {
    const newQuestions = [...questions]
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= newQuestions.length) return
    const temp = newQuestions[index]
    newQuestions[index] = newQuestions[targetIndex]
    newQuestions[targetIndex] = temp
    setQuestions(newQuestions)
  }

  const generateSurveyLink = () => {
    const surveyData = {
      title: surveyTitle,
      intro: introText,
      thanks: thankYouMessage,
      q: questions.map(q => ({
        id: q.id,
        type: q.type,
        text: q.text,
        required: q.required,
        options: q.options,
      })),
    }
    const encoded = btoa(encodeURIComponent(JSON.stringify(surveyData)))
    const url = new URL(window.location.href)
    url.search = ''
    url.searchParams.set('survey', encoded)
    return url.toString()
  }

  const exportSurveyAsText = () => {
    let text = `${surveyTitle}\n${'='.repeat(surveyTitle.length)}\n\n`
    if (introText) text += `${introText}\n\n`
    text += `---\n\n`
    questions.forEach((q, i) => {
      text += `${i + 1}. ${q.text}${q.required ? ' *' : ''}\n`
      text += `   Type: ${QUESTION_TYPES.find(t => t.value === q.type)?.label || q.type}\n`
      if (q.type === 'multiple' && q.options?.length) {
        q.options.filter(Boolean).forEach(opt => {
          text += `   - ${opt}\n`
        })
      }
      if (q.type === 'rating') text += `   [ 1 ] [ 2 ] [ 3 ] [ 4 ] [ 5 ]\n`
      if (q.type === 'nps') text += `   [ 0 ] [ 1 ] [ 2 ] [ 3 ] [ 4 ] [ 5 ] [ 6 ] [ 7 ] [ 8 ] [ 9 ] [ 10 ]\n`
      text += '\n'
    })
    if (thankYouMessage) text += `---\n\nThank You: ${thankYouMessage}\n`
    return text
  }

  const aggregatedResults = useMemo(() => {
    if (!responses || responses.length === 0) return null
    const agg = {}
    questions.forEach(q => {
      const qResponses = responses.map(r => r[q.id]).filter(v => v !== undefined && v !== null && v !== '')
      if (q.type === 'rating') {
        const nums = qResponses.map(Number).filter(n => !isNaN(n))
        agg[q.id] = { avg: nums.length ? (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1) : 'N/A', count: nums.length }
      } else if (q.type === 'nps') {
        const nums = qResponses.map(Number).filter(n => !isNaN(n))
        const promoters = nums.filter(n => n >= 9).length
        const detractors = nums.filter(n => n <= 6).length
        const npsScore = nums.length ? Math.round(((promoters - detractors) / nums.length) * 100) : 0
        agg[q.id] = { nps: npsScore, count: nums.length, avg: nums.length ? (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1) : 'N/A' }
      } else if (q.type === 'multiple') {
        const counts = {}
        qResponses.forEach(v => { counts[v] = (counts[v] || 0) + 1 })
        agg[q.id] = { distribution: counts, count: qResponses.length }
      } else {
        agg[q.id] = { responses: qResponses, count: qResponses.length }
      }
    })
    return agg
  }, [responses, questions])

  const tabs = [
    { id: 'builder', label: 'Builder' },
    { id: 'preview', label: 'Preview' },
    { id: 'results', label: `Results${responses?.length ? ` (${responses.length})` : ''}` },
  ]

  return (
    <ToolLayout
      title="Client Feedback Survey Builder"
      description="Build custom client feedback surveys with multiple question types, preview them, and generate shareable links."
      category="Authority Building"
    >
      {/* Tabs */}
      <div className="flex gap-1 mb-6 rounded-lg p-1" style={{ background: 'var(--bg-elevated)' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all"
            style={{
              background: activeTab === tab.id ? 'var(--accent)' : 'transparent',
              color: activeTab === tab.id ? 'var(--text-on-accent)' : 'var(--text-muted)',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'builder' && (
        <div className="space-y-6">
          {/* Survey Settings */}
          <ResultCard title="Survey Settings" icon="&#9881;">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-heading)' }}>Survey Title</label>
                <input
                  type="text"
                  value={surveyTitle}
                  onChange={e => setSurveyTitle(e.target.value)}
                  placeholder="Enter survey title..."
                  className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none"
                  style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-heading)' }}>Introduction Text</label>
                <textarea
                  value={introText}
                  onChange={e => setIntroText(e.target.value)}
                  rows={2}
                  placeholder="Welcome message for survey respondents..."
                  className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none resize-y"
                  style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-heading)' }}>Thank You Message</label>
                <textarea
                  value={thankYouMessage}
                  onChange={e => setThankYouMessage(e.target.value)}
                  rows={2}
                  placeholder="Message shown after submission..."
                  className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none resize-y"
                  style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
                />
              </div>
            </div>
          </ResultCard>

          {/* Questions */}
          <ResultCard title={`Questions (${questions.length})`} icon="&#10067;">
            <div className="space-y-4">
              {questions.map((q, idx) => (
                <QuestionEditor
                  key={q.id}
                  question={q}
                  onUpdate={updated => updateQuestion(q.id, updated)}
                  onRemove={() => removeQuestion(q.id)}
                  onMoveUp={() => moveQuestion(idx, -1)}
                  onMoveDown={() => moveQuestion(idx, 1)}
                  isFirst={idx === 0}
                  isLast={idx === questions.length - 1}
                />
              ))}
              <button
                onClick={addQuestion}
                className="w-full py-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                style={{ background: 'var(--accent-soft)', color: 'var(--accent)', border: '2px dashed var(--accent)' }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Question
              </button>
            </div>
          </ResultCard>

          {/* Actions */}
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => {
                const url = generateSurveyLink()
                navigator.clipboard.writeText(url).then(() => {
                  if (toast) toast('Survey link copied to clipboard!', 'success')
                })
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Copy Survey Link
            </button>
            <CopyButton text={exportSurveyAsText()} label="Copy as Text" />
          </div>
        </div>
      )}

      {activeTab === 'preview' && (
        <SurveyPreview
          title={surveyTitle}
          intro={introText}
          thankYou={thankYouMessage}
          questions={questions}
        />
      )}

      {activeTab === 'results' && (
        <div className="space-y-6">
          {!responses || responses.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">&#128202;</div>
              <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-heading)' }}>No Responses Yet</h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Share your survey link to start collecting feedback. Responses will be stored locally and shown here.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="rounded-lg p-4 text-center" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                  <div className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>{responses.length}</div>
                  <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Total Responses</div>
                </div>
                {questions.filter(q => q.type === 'rating').slice(0, 1).map(q => (
                  <div key={q.id} className="rounded-lg p-4 text-center" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                    <div className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>{aggregatedResults?.[q.id]?.avg || 'N/A'}</div>
                    <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Avg Rating</div>
                  </div>
                ))}
                {questions.filter(q => q.type === 'nps').slice(0, 1).map(q => (
                  <div key={q.id} className="rounded-lg p-4 text-center" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                    <div className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>{aggregatedResults?.[q.id]?.nps ?? 'N/A'}</div>
                    <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>NPS Score</div>
                  </div>
                ))}
              </div>

              {questions.map(q => (
                <ResultCard key={q.id} title={q.text}>
                  {q.type === 'rating' && aggregatedResults?.[q.id] && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl font-bold" style={{ color: 'var(--accent)' }}>{aggregatedResults[q.id].avg}</span>
                        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>/ 5.0 ({aggregatedResults[q.id].count} responses)</span>
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <span key={star} className="text-xl" style={{ color: parseFloat(aggregatedResults[q.id].avg) >= star ? 'var(--warning, #f59e0b)' : 'var(--text-muted)' }}>
                            {parseFloat(aggregatedResults[q.id].avg) >= star ? '\u2605' : '\u2606'}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {q.type === 'nps' && aggregatedResults?.[q.id] && (
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-3xl font-bold" style={{ color: aggregatedResults[q.id].nps >= 0 ? 'var(--success)' : 'var(--danger)' }}>{aggregatedResults[q.id].nps}</span>
                        <span className="text-sm ml-2" style={{ color: 'var(--text-muted)' }}>NPS ({aggregatedResults[q.id].count} responses)</span>
                      </div>
                    </div>
                  )}
                  {q.type === 'multiple' && aggregatedResults?.[q.id] && (
                    <div className="space-y-2">
                      {Object.entries(aggregatedResults[q.id].distribution || {}).map(([opt, count]) => (
                        <div key={opt} className="flex items-center gap-3">
                          <span className="text-sm flex-1" style={{ color: 'var(--text-body)' }}>{opt}</span>
                          <div className="w-32 h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-input)' }}>
                            <div
                              className="h-full rounded-full"
                              style={{ background: 'var(--accent)', width: `${aggregatedResults[q.id].count > 0 ? (count / aggregatedResults[q.id].count) * 100 : 0}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {q.type === 'text' && aggregatedResults?.[q.id] && (
                    <div className="space-y-2">
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{aggregatedResults[q.id].count} responses</p>
                      {aggregatedResults[q.id].responses?.slice(0, 5).map((r, i) => (
                        <div key={i} className="rounded-lg px-3 py-2 text-sm" style={{ background: 'var(--bg-input)', color: 'var(--text-body)' }}>
                          "{r}"
                        </div>
                      ))}
                    </div>
                  )}
                </ResultCard>
              ))}
            </>
          )}
        </div>
      )}
    </ToolLayout>
  )
}
