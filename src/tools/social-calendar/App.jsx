import { useState, useMemo, useCallback } from 'react'
import { useLocalStorage } from '../shared/hooks/useLocalStorage'
import ToolLayout from '../shared/ToolLayout'
import ResultCard from '../shared/ResultCard'
import ShareButton from '../shared/ShareButton'
import { generateId } from '../shared/utils'
import { useToast } from '../shared/Toast'

const PLATFORMS = ['Instagram', 'LinkedIn', 'Twitter', 'Facebook', 'TikTok']
const CONTENT_TYPES = ['Post', 'Story', 'Reel', 'Article', 'Thread']

const PLATFORM_COLORS = {
  Instagram: '#E1306C',
  LinkedIn: '#0077B5',
  Twitter: '#1DA1F2',
  Facebook: '#4267B2',
  TikTok: '#00f2ea',
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year, month) {
  const day = new Date(year, month, 1).getDay()
  return day === 0 ? 6 : day - 1
}

function formatMonthYear(year, month) {
  return new Date(year, month, 1).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
}

function padZero(n) {
  return n < 10 ? '0' + n : '' + n
}

function dateKey(year, month, day) {
  return `${year}-${padZero(month + 1)}-${padZero(day)}`
}

export default function App() {
  const toast = useToast()
  const now = new Date()
  const [currentYear, setCurrentYear] = useState(now.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(now.getMonth())
  const [posts, setPosts] = useLocalStorage('skynet-social-calendar-posts', [])

  const [modalOpen, setModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [postPlatform, setPostPlatform] = useState('Instagram')
  const [postType, setPostType] = useState('Post')
  const [postCaption, setPostCaption] = useState('')
  const [postTime, setPostTime] = useState('09:00')

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(y => y - 1)
    } else {
      setCurrentMonth(m => m - 1)
    }
  }

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(y => y + 1)
    } else {
      setCurrentMonth(m => m + 1)
    }
  }

  const goToday = () => {
    setCurrentYear(now.getFullYear())
    setCurrentMonth(now.getMonth())
  }

  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth)

  const calendarCells = useMemo(() => {
    const cells = []
    for (let i = 0; i < firstDay; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(d)
    while (cells.length % 7 !== 0) cells.push(null)
    return cells
  }, [firstDay, daysInMonth])

  const postsByDate = useMemo(() => {
    const map = {}
    posts.forEach(p => {
      if (!map[p.date]) map[p.date] = []
      map[p.date].push(p)
    })
    return map
  }, [posts])

  const monthPosts = useMemo(() => {
    const prefix = `${currentYear}-${padZero(currentMonth + 1)}`
    return posts.filter(p => p.date.startsWith(prefix))
  }, [posts, currentYear, currentMonth])

  const monthStats = useMemo(() => {
    const byPlatform = {}
    PLATFORMS.forEach(p => { byPlatform[p] = 0 })
    monthPosts.forEach(p => {
      byPlatform[p.platform] = (byPlatform[p.platform] || 0) + 1
    })
    return { total: monthPosts.length, byPlatform }
  }, [monthPosts])

  const openModal = (day) => {
    setSelectedDate(dateKey(currentYear, currentMonth, day))
    setEditingId(null)
    setPostPlatform('Instagram')
    setPostType('Post')
    setPostCaption('')
    setPostTime('09:00')
    setModalOpen(true)
  }

  const openEditModal = (post) => {
    setSelectedDate(post.date)
    setEditingId(post.id)
    setPostPlatform(post.platform)
    setPostType(post.contentType)
    setPostCaption(post.caption)
    setPostTime(post.time)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingId(null)
  }

  const handleSavePost = () => {
    if (!selectedDate) return

    if (editingId) {
      setPosts(prev => prev.map(p =>
        p.id === editingId
          ? { ...p, platform: postPlatform, contentType: postType, caption: postCaption, time: postTime }
          : p
      ))
      if (toast) toast('Post updated', 'success')
    } else {
      setPosts(prev => [...prev, {
        id: generateId(),
        date: selectedDate,
        platform: postPlatform,
        contentType: postType,
        caption: postCaption,
        time: postTime,
      }])
      if (toast) toast('Post scheduled', 'success')
    }
    closeModal()
  }

  const handleDeletePost = useCallback((id) => {
    setPosts(prev => prev.filter(p => p.id !== id))
    if (toast) toast('Post deleted', 'info')
    closeModal()
  }, [setPosts, toast])

  const isToday = (day) => {
    return day && currentYear === now.getFullYear() && currentMonth === now.getMonth() && day === now.getDate()
  }

  return (
    <ToolLayout
      title="Social Media Content Calendar"
      description="Plan and visualize your social media content with a monthly calendar view."
      category="Authority Building"
      icon="📱"
      maxWidth="wide"
    >
      {/* Month Stats */}
      <ResultCard title="Monthly Stats" icon="📊" className="mb-6">
        <div className="flex flex-wrap gap-3">
          <div className="rounded-lg px-4 py-2" style={{ background: 'var(--accent-soft)' }}>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Posts: </span>
            <span className="font-bold text-sm" style={{ color: 'var(--accent)' }}>{monthStats.total}</span>
          </div>
          {PLATFORMS.map(p => (
            monthStats.byPlatform[p] > 0 && (
              <div key={p} className="rounded-lg px-3 py-2 flex items-center gap-2" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: PLATFORM_COLORS[p] }} />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{p}: </span>
                <span className="font-semibold text-xs" style={{ color: 'var(--text-heading)' }}>{monthStats.byPlatform[p]}</span>
              </div>
            )
          ))}
        </div>
      </ResultCard>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
        >
          &larr; Prev
        </button>
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-heading)' }}>
            {formatMonthYear(currentYear, currentMonth)}
          </h2>
          <button
            onClick={goToday}
            className="px-3 py-1 rounded text-xs"
            style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
          >
            Today
          </button>
        </div>
        <button
          onClick={nextMonth}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
        >
          Next &rarr;
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        {/* Day Headers */}
        <div className="grid grid-cols-7">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
            <div
              key={d}
              className="py-2 text-center text-xs font-semibold"
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Day Cells */}
        <div className="grid grid-cols-7">
          {calendarCells.map((day, idx) => {
            const key = day ? dateKey(currentYear, currentMonth, day) : `empty-${idx}`
            const dayPosts = day ? (postsByDate[key] || []) : []
            const today = isToday(day)

            return (
              <div
                key={key}
                onClick={() => day && openModal(day)}
                className="min-h-[90px] sm:min-h-[110px] p-1.5 cursor-pointer transition-colors relative"
                style={{
                  background: today ? 'var(--accent-soft)' : day ? 'var(--bg-card)' : 'var(--bg-elevated)',
                  borderRight: '1px solid var(--border)',
                  borderBottom: '1px solid var(--border)',
                  opacity: day ? 1 : 0.3,
                }}
              >
                {day && (
                  <>
                    <span
                      className="text-xs font-medium"
                      style={{ color: today ? 'var(--accent)' : 'var(--text-heading)' }}
                    >
                      {day}
                    </span>
                    {/* Post dots */}
                    <div className="flex flex-wrap gap-0.5 mt-1">
                      {dayPosts.slice(0, 6).map(p => (
                        <div
                          key={p.id}
                          onClick={(e) => { e.stopPropagation(); openEditModal(p) }}
                          className="w-2.5 h-2.5 rounded-full cursor-pointer transition-transform hover:scale-150"
                          style={{ background: PLATFORM_COLORS[p.platform] || 'var(--accent)' }}
                          title={`${p.platform} ${p.contentType}: ${p.caption || 'No caption'}`}
                        />
                      ))}
                      {dayPosts.length > 6 && (
                        <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>+{dayPosts.length - 6}</span>
                      )}
                    </div>
                    {/* Post previews */}
                    <div className="mt-1 space-y-0.5 hidden sm:block">
                      {dayPosts.slice(0, 2).map(p => (
                        <div
                          key={p.id}
                          onClick={(e) => { e.stopPropagation(); openEditModal(p) }}
                          className="text-[10px] leading-tight truncate rounded px-1 py-0.5 cursor-pointer"
                          style={{
                            background: `${PLATFORM_COLORS[p.platform]}20`,
                            color: PLATFORM_COLORS[p.platform],
                            borderLeft: `2px solid ${PLATFORM_COLORS[p.platform]}`,
                          }}
                        >
                          {p.time} {p.contentType}
                        </div>
                      ))}
                      {dayPosts.length > 2 && (
                        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>+{dayPosts.length - 2} more</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-3 justify-center">
        {PLATFORMS.map(p => (
          <div key={p} className="flex items-center gap-1.5 text-xs">
            <div className="w-3 h-3 rounded-full" style={{ background: PLATFORM_COLORS[p] }} />
            <span style={{ color: 'var(--text-muted)' }}>{p}</span>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={closeModal}
        >
          <div
            className="w-full max-w-md rounded-2xl p-6"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-heading)' }}>
                {editingId ? 'Edit Post' : 'Schedule Post'}
              </h3>
              <button onClick={closeModal} className="text-lg" style={{ color: 'var(--text-muted)' }}>&times;</button>
            </div>
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
              Date: <span style={{ color: 'var(--text-heading)' }}>
                {selectedDate && new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Platform</label>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map(p => (
                    <button
                      key={p}
                      onClick={() => setPostPlatform(p)}
                      className="px-3 py-1.5 text-xs rounded-lg transition-all"
                      style={{
                        background: postPlatform === p ? `${PLATFORM_COLORS[p]}25` : 'var(--bg-elevated)',
                        color: postPlatform === p ? PLATFORM_COLORS[p] : 'var(--text-muted)',
                        border: `1px solid ${postPlatform === p ? PLATFORM_COLORS[p] : 'var(--border)'}`,
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Content Type</label>
                <select
                  value={postType}
                  onChange={e => setPostType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
                >
                  {CONTENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Time</label>
                <input
                  type="time"
                  value={postTime}
                  onChange={e => setPostTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
                />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Caption / Notes</label>
                <textarea
                  value={postCaption}
                  onChange={e => setPostCaption(e.target.value)}
                  rows={3}
                  placeholder="Write your caption or notes here..."
                  className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none resize-none"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
                />
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={handleSavePost}
                className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-all"
                style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}
              >
                {editingId ? 'Update Post' : 'Schedule Post'}
              </button>
              {editingId && (
                <button
                  onClick={() => handleDeletePost(editingId)}
                  className="px-4 py-2.5 text-sm font-medium rounded-lg transition-all"
                  style={{ background: 'var(--danger-soft)', color: 'var(--danger)', border: '1px solid var(--danger)' }}
                >
                  Delete
                </button>
              )}
              <button
                onClick={closeModal}
                className="px-4 py-2.5 text-sm rounded-lg"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-body)' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scheduled Posts for this month (list view) */}
      {monthPosts.length > 0 && (
        <ResultCard title="Scheduled Posts This Month" icon="📋" className="mt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th className="text-left py-2 px-2 font-medium" style={{ color: 'var(--text-muted)' }}>Date</th>
                  <th className="text-left py-2 px-2 font-medium" style={{ color: 'var(--text-muted)' }}>Time</th>
                  <th className="text-left py-2 px-2 font-medium" style={{ color: 'var(--text-muted)' }}>Platform</th>
                  <th className="text-left py-2 px-2 font-medium" style={{ color: 'var(--text-muted)' }}>Type</th>
                  <th className="text-left py-2 px-2 font-medium" style={{ color: 'var(--text-muted)' }}>Caption</th>
                  <th className="text-right py-2 px-2 font-medium" style={{ color: 'var(--text-muted)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {monthPosts
                  .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
                  .map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className="py-2 px-2" style={{ color: 'var(--text-body)' }}>
                        {new Date(p.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="py-2 px-2" style={{ color: 'var(--text-body)' }}>{p.time}</td>
                      <td className="py-2 px-2">
                        <span className="inline-flex items-center gap-1.5 text-xs">
                          <span className="w-2 h-2 rounded-full" style={{ background: PLATFORM_COLORS[p.platform] }} />
                          <span style={{ color: PLATFORM_COLORS[p.platform] }}>{p.platform}</span>
                        </span>
                      </td>
                      <td className="py-2 px-2" style={{ color: 'var(--text-body)' }}>{p.contentType}</td>
                      <td className="py-2 px-2 max-w-[200px] truncate" style={{ color: 'var(--text-muted)' }}>{p.caption || '-'}</td>
                      <td className="py-2 px-2 text-right">
                        <button onClick={() => openEditModal(p)} className="text-xs px-2 py-1 mr-1" style={{ color: 'var(--info)' }}>Edit</button>
                        <button onClick={() => handleDeletePost(p.id)} className="text-xs px-2 py-1" style={{ color: 'var(--danger)' }}>Del</button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </ResultCard>
      )}

      <div className="mt-6 flex justify-center">
        <ShareButton getShareURL={() => window.location.origin + '/social-calendar'} />
      </div>
    </ToolLayout>
  )
}
