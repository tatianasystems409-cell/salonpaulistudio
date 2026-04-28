/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  isBefore,
  startOfDay
} from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface CalendarPickerProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  minDate?: Date;
  highlightDays?: Date[]; // For showing days with appointments in admin
}

export function CalendarPicker({ selectedDate, onDateSelect, minDate, highlightDays = [] }: CalendarPickerProps) {
  const [currentMonth, setCurrentMonth] = React.useState(startOfMonth(selectedDate));

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 }),
  });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const isDayHighlighted = (day: Date) => highlightDays.some(h => isSameDay(h, day));
  const isDayDisabled = (day: Date) => minDate ? isBefore(startOfDay(day), startOfDay(minDate)) : false;

  return (
    <div className="p-4 bg-white/40 backdrop-blur-md rounded-3xl border border-white/60">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-rose-900">
          {format(currentMonth, 'MMMM yyyy', { locale: es })}
        </h4>
        <div className="flex gap-2">
          <button 
            onClick={prevMonth}
            className="p-2 hover:bg-rose-50 rounded-full transition-colors text-rose-300"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
            onClick={nextMonth}
            className="p-2 hover:bg-rose-50 rounded-full transition-colors text-rose-300"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, idx) => (
          <div key={`${day}-${idx}`} className="text-[8px] font-bold text-rose-900/30 uppercase tracking-widest">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isDisabled = isDayDisabled(day);
          const hasHighlight = isDayHighlighted(day);

          return (
            <button
              key={idx}
              onClick={() => !isDisabled && onDateSelect(day)}
              disabled={isDisabled}
              className={cn(
                "h-10 w-full rounded-xl text-[10px] font-bold transition-all relative flex flex-col items-center justify-center",
                !isCurrentMonth && "opacity-20",
                isSelected ? "bg-rose-500 text-white shadow-lg shadow-rose-200" : "hover:bg-rose-50 text-rose-900",
                isDisabled && "opacity-10 cursor-not-allowed grayscale",
                hasHighlight && !isSelected && "after:content-[''] after:absolute after:bottom-1 after:w-1 after:h-1 after:bg-rose-500 after:rounded-full"
              )}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
}
