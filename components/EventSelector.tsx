
import React from 'react';

interface EventSelectorProps {
  currentEventIndex: number;
  onEventChange: (index: number) => void;
  totalEvents: number;
}

const EventSelector: React.FC<EventSelectorProps> = ({
  currentEventIndex,
  onEventChange,
  totalEvents,
}) => {
  const numberToChinese = (num: number): string => {
    const chineseNumbers = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
    if (num <= 10) {
        return chineseNumbers[num];
    }
    // For numbers greater than 10, you might need a more complex conversion,
    // but for "第一場" to "第六場", direct mapping is fine.
    // This example keeps it simple for up to 10.
    return num.toString();
  };


  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-2xl">
      <label htmlFor="eventSelector" className="block text-xl font-semibold text-gray-100 mb-3">
       <span role="img" aria-label="日曆" className="mr-2">🗓️</span> 目前簽到場次
      </label>
      <select
        id="eventSelector"
        value={currentEventIndex}
        onChange={(e) => onEventChange(parseInt(e.target.value, 10))}
        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
        aria-label="選擇目前簽到場次"
      >
        {Array.from({ length: totalEvents }).map((_, index) => (
          <option key={index} value={index} className="py-2">
            第{numberToChinese(index + 1)}場
          </option>
        ))}
      </select>
    </div>
  );
};

export default EventSelector;
