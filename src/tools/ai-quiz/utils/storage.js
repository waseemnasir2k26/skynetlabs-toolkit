const STORAGE_KEY = 'skynet_quiz_results'
const ADMIN_KEY = 'skynet_quiz_admin'

export function saveResult(answers, scores) {
  const result = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    timestamp: new Date().toISOString(),
    answers,
    scores,
  }

  const existing = getAllResults()
  existing.push(result)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))
  return result
}

export function getAllResults() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function getLastResult() {
  const results = getAllResults()
  return results.length > 0 ? results[results.length - 1] : null
}

export function clearResults() {
  localStorage.removeItem(STORAGE_KEY)
}

export function saveAnswersProgress(answers, currentQuestion) {
  localStorage.setItem(
    'skynet_quiz_progress',
    JSON.stringify({ answers, currentQuestion })
  )
}

export function getAnswersProgress() {
  try {
    const data = localStorage.getItem('skynet_quiz_progress')
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

export function clearProgress() {
  localStorage.removeItem('skynet_quiz_progress')
}
