import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function DraggableCalendar({ dateRange, postsByDate, platformMap, onPostClick, onPostMove }) {
  const [activePost, setActivePost] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  );

  // Build calendar grid with leading empty cells for alignment
  const firstDate = new Date(dateRange[0] + 'T00:00:00');
  const startDow = firstDate.getDay();

  const handleDragStart = (event) => {
    const postId = event.active.id;
    // Find the post across all dates
    for (const posts of Object.values(postsByDate)) {
      const post = posts.find(p => p.id === postId);
      if (post) {
        setActivePost(post);
        break;
      }
    }
  };

  const handleDragEnd = (event) => {
    setActivePost(null);
    const { active, over } = event;
    if (!over) return;
    const targetDate = over.id; // droppable id is the date string
    if (targetDate && active.id) {
      onPostMove(active.id, targetDate);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="calendar-grid">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {WEEKDAYS.map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Cells */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty leading cells */}
          {Array.from({ length: startDow }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[100px] sm:min-h-[130px] bg-dark-800/30 rounded-lg" />
          ))}

          {/* Date cells */}
          {dateRange.map(date => {
            const posts = postsByDate[date] || [];
            const d = new Date(date + 'T00:00:00');
            const isToday = date === new Date().toISOString().split('T')[0];

            return (
              <DroppableCell
                key={date}
                date={date}
                dayNum={d.getDate()}
                isToday={isToday}
                posts={posts}
                platformMap={platformMap}
                onPostClick={onPostClick}
              />
            );
          })}
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activePost ? (
          <div className="bg-dark-600 border border-primary rounded-md px-2 py-1 shadow-xl shadow-primary/10 text-xs text-white max-w-[200px] truncate opacity-90">
            {activePost.contentType.emoji} {activePost.hook}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function DroppableCell({ date, dayNum, isToday, posts, platformMap, onPostClick }) {
  const { setNodeRef, isOver } = useDroppable({ id: date });

  return (
    <div
      ref={setNodeRef}
      className={`calendar-cell min-h-[100px] sm:min-h-[130px] rounded-lg p-1.5 sm:p-2 transition-all flex flex-col ${
        isOver
          ? 'bg-primary/10 border-primary ring-1 ring-primary/30'
          : 'bg-dark-700 border-dark-500 hover:border-dark-400'
      } border ${isToday ? 'ring-1 ring-primary/40' : ''}`}
    >
      <div className={`text-xs font-medium mb-1 ${isToday ? 'text-primary' : 'text-gray-400'}`}>
        {dayNum}
      </div>
      <div className="flex-1 space-y-1 overflow-y-auto max-h-[120px] scrollbar-thin">
        {posts.map(post => (
          <DraggablePost
            key={post.id}
            post={post}
            platform={platformMap[post.platform]}
            onClick={() => onPostClick(post)}
          />
        ))}
      </div>
    </div>
  );
}

function DraggablePost({ post, platform, onClick }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: post.id,
  });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`group cursor-pointer rounded-md px-1.5 py-1 text-[10px] sm:text-xs transition-all hover:ring-1 hover:ring-white/20 ${
        isDragging ? 'opacity-30' : 'opacity-100'
      }`}
      title={post.hook}
    >
      <div className="flex items-center gap-1">
        <div
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: platform?.color || '#666' }}
        />
        <span className="truncate text-gray-300 group-hover:text-white">
          {post.contentType.emoji} {post.hook.substring(0, 28)}{post.hook.length > 28 ? '...' : ''}
        </span>
      </div>
    </div>
  );
}
