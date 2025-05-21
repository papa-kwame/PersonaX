import { useState } from 'react';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { format } from 'date-fns';

export default function DateRangePicker({ 
  initialRange, 
  onChange 
}) {
  const [state, setState] = useState([
    {
      startDate: initialRange.start,
      endDate: initialRange.end,
      key: 'selection'
    }
  ]);
  const [showPicker, setShowPicker] = useState(false);

  const handleSelect = (ranges) => {
    const { startDate, endDate } = ranges.selection;
    setState([ranges.selection]);
    onChange({ start: startDate, end: endDate });
  };

  return (
    <div className="date-range-picker">
      <div 
        className="date-range-display"
        onClick={() => setShowPicker(!showPicker)}
      >
        <i className="bi bi-calendar-range me-2"></i>
        {format(state[0].startDate, 'MMM d, yyyy')} - {format(state[0].endDate, 'MMM d, yyyy')}
        <i className={`bi bi-chevron-${showPicker ? 'up' : 'down'} ms-2`}></i>
      </div>
      
      {showPicker && (
        <div className="date-range-popover">
          <DateRange
            editableDateInputs={true}
            onChange={handleSelect}
            moveRangeOnFirstSelection={false}
            ranges={state}
          />
          <div className="text-end mt-2">
            <button 
              className="btn btn-sm btn-primary"
              onClick={() => setShowPicker(false)}
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}