import React, { useState, useEffect } from 'react';
import { 
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  eachDayOfInterval, format, isSameMonth, isSameDay, 
  isWithinInterval, isBefore, isAfter, addMonths, subMonths, isWeekend
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './App.css';

const WallCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date(2022, 0, 1)); // Default to Jan 2022 to match inspiration
  const [selectionRange, setSelectionRange] = useState({ start: null, end: null });
  const [hoverDate, setHoverDate] = useState(null);
  const [notes, setNotes] = useState({});

  // Load notes on mount
  useEffect(() => {
    const saved = localStorage.getItem('calendar_notes');
    if (saved) setNotes(JSON.parse(saved));
  }, []);

  // Save notes on change
  useEffect(() => {
    localStorage.setItem('calendar_notes', JSON.stringify(notes));
  }, [notes]);

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const onDayClick = (day) => {
    if (selectionRange.start && selectionRange.end) {
      setSelectionRange({ start: day, end: null });
    } else if (selectionRange.start) {
      if (isBefore(day, selectionRange.start)) {
        setSelectionRange({ start: day, end: null });
      } else {
        setSelectionRange({ ...selectionRange, end: day });
      }
    } else {
      setSelectionRange({ start: day, end: null });
    }
  };

  const currentMonthKey = format(currentMonth, 'yyyy-MM');
  const currentNotes = notes[currentMonthKey] || '';

  const handleNotesChange = (e) => {
    setNotes({
      ...notes,
      [currentMonthKey]: e.target.value
    });
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStarts: 1 }); // Monday start
  const endDate = endOfWeek(monthEnd, { weekStarts: 1 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  const getCellClasses = (day) => {
    const isOtherMonth = !isSameMonth(day, monthStart);
    const isStart = selectionRange.start && isSameDay(day, selectionRange.start);
    const isEnd = selectionRange.end && isSameDay(day, selectionRange.end);
    let inRange = false;

    if (selectionRange.start && selectionRange.end) {
      inRange = isWithinInterval(day, { start: selectionRange.start, end: selectionRange.end });
    } else if (selectionRange.start && hoverDate && isAfter(hoverDate, selectionRange.start)) {
      inRange = isWithinInterval(day, { start: selectionRange.start, end: hoverDate });
    }

    const isWknd = isWeekend(day);

    let wrapperClass = "date-cell-wrapper";
    if (inRange && !isOtherMonth && !isStart && !isEnd) wrapperClass += " in-range";
    if (isStart && !isOtherMonth) wrapperClass += " range-start in-range";
    if (isEnd && !isOtherMonth) wrapperClass += " range-end in-range";
    if (isStart && !selectionRange.end && !hoverDate) wrapperClass = wrapperClass.replace(" in-range", "");

    let cellClass = "date-cell";
    if (isOtherMonth) {
      cellClass += " other-month";
    } else {
      if (isStart || isEnd) cellClass += " selected";
      if (isWknd && !isStart && !isEnd) cellClass += " weekend";
    }

    return { wrapperClass, cellClass };
  };

  return (
    <div className="calendar-container">
      {/* Spiral Binding */}
      <div className="spiral-binding">
        {[...Array(30)].map((_, i) => (
          <div key={i} className="spiral-ring" />
        ))}
      </div>

      {/* Top Section */}
      <div className="top-section">
        <img src="/hero.png" alt="Hero representation" className="hero-image" />
        <div className="date-overlay">
          <div className="month-controls">
            <button onClick={handlePrevMonth} aria-label="Previous month"><ChevronLeft size={24} /></button>
            <div className="date-display">
              <h2>{format(currentMonth, 'yyyy')}</h2>
              <h1>{format(currentMonth, 'MMMM')}</h1>
            </div>
            <button onClick={handleNextMonth} aria-label="Next month"><ChevronRight size={24} /></button>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="bottom-section">
        
        {/* Notes Area */}
        <div className="notes-area">
          <div className="notes-header">Notes...</div>
          <div className="notes-lines-container">
            <div className="notes-lines" />
            <textarea 
              className="notes-textarea" 
              value={currentNotes}
              onChange={handleNotesChange}
              spellCheck="false"
            />
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="calendar-grid-area">
          <div className="calendar-header-row">
            {weekDays.map(day => (
              <div key={day} className="day-name">{day}</div>
            ))}
          </div>
          <div className="calendar-grid" onMouseLeave={() => setHoverDate(null)}>
            {days.map(day => {
              const { wrapperClass, cellClass } = getCellClasses(day);
              return (
                <div 
                  key={day.toString()} 
                  className={wrapperClass}
                  onMouseEnter={() => !isSameMonth(day, monthStart) ? null : setHoverDate(day)}
                  onClick={() => !isSameMonth(day, monthStart) ? null : onDayClick(day)}
                >
                  <div className={cellClass}>
                    {format(day, 'd')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default WallCalendar;
