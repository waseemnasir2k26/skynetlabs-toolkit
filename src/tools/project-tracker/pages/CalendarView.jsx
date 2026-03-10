import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';
import { getHealthStatus, healthColors, formatDate } from '../utils/helpers';

export default function CalendarView() {
  const { projects } = useProjects();
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const today = () => setCurrentDate(new Date());

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push({ day: null, date: null });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ day: d, date: dateStr });
    }

    return days;
  }, [year, month]);

  const deadlineMap = useMemo(() => {
    const map = {};
    projects.forEach(p => {
      // Project end dates
      if (p.estimatedEndDate) {
        if (!map[p.estimatedEndDate]) map[p.estimatedEndDate] = [];
        map[p.estimatedEndDate].push({ type: 'deadline', project: p });
      }
      // Phase end dates
      (p.phases || []).forEach(phase => {
        if (phase.endDate) {
          if (!map[phase.endDate]) map[phase.endDate] = [];
          map[phase.endDate].push({ type: 'phase', project: p, phase });
        }
      });
      // Start dates
      if (p.startDate) {
        if (!map[p.startDate]) map[p.startDate] = [];
        map[p.startDate].push({ type: 'start', project: p });
      }
    });
    return map;
  }, [projects]);

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Calendar</h1>
        <p className="text-text-secondary text-sm mt-1">Project deadlines and milestones</p>
      </div>

      <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <button onClick={prevMonth} className="p-2 text-text-secondary hover:text-text-primary transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
          </button>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">{monthName}</h2>
            <button onClick={today} className="px-3 py-1 text-xs bg-border text-text-secondary rounded-full hover:bg-border-light transition-colors">
              Today
            </button>
          </div>
          <button onClick={nextMonth} className="p-2 text-text-secondary hover:text-text-primary transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-border">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center py-2 text-xs font-semibold text-text-muted uppercase">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {calendarDays.map((item, idx) => {
            const events = item.date ? (deadlineMap[item.date] || []) : [];
            const isToday = item.date === todayStr;

            return (
              <div
                key={idx}
                className={`min-h-[80px] md:min-h-[100px] p-1.5 border-b border-r border-border ${
                  item.day ? 'bg-bg-darkest' : 'bg-bg-dark/50'
                }`}
              >
                {item.day && (
                  <>
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium ${
                      isToday ? 'bg-primary text-white' : 'text-text-secondary'
                    }`}>
                      {item.day}
                    </span>
                    <div className="mt-1 space-y-0.5">
                      {events.slice(0, 3).map((event, eIdx) => {
                        const health = getHealthStatus(event.project);
                        const colors = {
                          deadline: 'bg-status-red/30 text-status-red',
                          phase: 'bg-status-amber/30 text-status-amber',
                          start: 'bg-status-green/30 text-status-green',
                        };
                        return (
                          <Link
                            key={eIdx}
                            to={`/project-tracker/project/${event.project.id}`}
                            className={`block text-[10px] leading-tight px-1.5 py-0.5 rounded truncate ${colors[event.type]} hover:opacity-80 transition-opacity`}
                          >
                            {event.type === 'phase'
                              ? `${event.phase.name}`
                              : event.type === 'start'
                              ? `Start: ${event.project.name}`
                              : `Due: ${event.project.name}`}
                          </Link>
                        );
                      })}
                      {events.length > 3 && (
                        <span className="text-[10px] text-text-muted px-1.5">+{events.length - 3} more</span>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-text-secondary">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-status-green/30" />
          Project Start
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-status-amber/30" />
          Phase Deadline
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-status-red/30" />
          Project Deadline
        </div>
      </div>

      {/* Upcoming deadlines list */}
      <div className="bg-bg-card border border-border rounded-xl p-6">
        <h3 className="font-semibold mb-4">Upcoming Deadlines</h3>
        {(() => {
          const upcoming = [];
          projects.forEach(p => {
            if (p.estimatedEndDate && p.estimatedEndDate >= todayStr && p.status === 'active') {
              upcoming.push({ date: p.estimatedEndDate, label: `${p.name} - Project Due`, project: p, type: 'deadline' });
            }
            (p.phases || []).forEach(phase => {
              if (phase.endDate && phase.endDate >= todayStr && phase.status !== 'completed') {
                upcoming.push({ date: phase.endDate, label: `${p.name} - ${phase.name}`, project: p, type: 'phase' });
              }
            });
          });
          upcoming.sort((a, b) => a.date.localeCompare(b.date));

          if (upcoming.length === 0) return <p className="text-text-muted text-sm">No upcoming deadlines</p>;

          return (
            <div className="space-y-2">
              {upcoming.slice(0, 10).map((item, idx) => (
                <Link
                  key={idx}
                  to={`/project-tracker/project/${item.project.id}`}
                  className="flex items-center justify-between p-3 bg-bg-darkest rounded-lg hover:bg-bg-input transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${item.type === 'deadline' ? 'bg-status-red' : 'bg-status-amber'}`} />
                    <span className="text-sm">{item.label}</span>
                  </div>
                  <span className="text-xs text-text-muted">{formatDate(item.date)}</span>
                </Link>
              ))}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
