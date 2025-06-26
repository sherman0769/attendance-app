import React from 'react';
import { Participant } from '../types';

interface AttendanceTableProps {
  participants: Participant[];
  currentEventIndex: number;
  onToggleAttendance: (participantId: string, eventIdx: number) => void;
  onDeleteParticipant: (participantId: string) => void;
  totalEvents: number;
  disabled?: boolean; // Optional: To disable if DB not connected
}

const AttendanceTable: React.FC<AttendanceTableProps> = ({
  participants,
  currentEventIndex,
  onToggleAttendance,
  onDeleteParticipant,
  totalEvents,
  disabled = false,
}) => {
  const numberToChinese = (num: number): string => {
    const chineseNumbers = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
     if (num <= 10) {
        return chineseNumbers[num];
    }
    return num.toString();
  };

  return (
    <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
        <h2 className="text-2xl font-semibold text-gray-100 p-6 border-b border-gray-700" id="attendance-table-heading">
          參與者簽到情況
        </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700" aria-labelledby="attendance-table-heading">
          <thead className="bg-gray-750">
            <tr>
              <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                姓名
              </th>
              {Array.from({ length: totalEvents }).map((_, i) => (
                <th key={i} scope="col" className="px-3 py-4 text-center text-xs font-medium text-gray-300 uppercase tracking-wider whitespace-nowrap">
                  第{numberToChinese(i + 1)}場
                </th>
              ))}
              <th scope="col" className="px-6 py-4 text-center text-xs font-medium text-gray-300 uppercase tracking-wider whitespace-nowrap">
                操作 (第{numberToChinese(currentEventIndex + 1)}場)
              </th>
              <th scope="col" className="px-6 py-4 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                刪除
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {participants.map((participant) => (
              <tr key={participant.id} className="hover:bg-gray-700 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">{participant.name}</td>
                {participant.attendance.map((attended, eventIdx) => (
                  <td key={eventIdx} className="px-3 py-4 whitespace-nowrap text-center text-lg">
                    {attended ? (
                      <span className="text-green-400" title={`第${numberToChinese(eventIdx + 1)}場 已簽到`}>✓</span>
                    ) : (
                      <span className="text-gray-500" title={`第${numberToChinese(eventIdx + 1)}場 缺席/未標記`}>-</span>
                    )}
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                  <button
                    onClick={() => onToggleAttendance(participant.id, currentEventIndex)}
                    className={`px-4 py-2 rounded-md font-semibold text-xs transition-transform transform hover:scale-105
                                ${participant.attendance[currentEventIndex]
                                  ? 'bg-yellow-500 hover:bg-yellow-600 text-gray-900'
                                  : 'bg-green-500 hover:bg-green-600 text-white'}
                                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    aria-label={`${participant.attendance[currentEventIndex] ? `取消 ${participant.name} 在第${numberToChinese(currentEventIndex + 1)}場的簽到` : `為 ${participant.name} 在第${numberToChinese(currentEventIndex + 1)}場簽到`}`}
                    disabled={disabled}
                  >
                    {participant.attendance[currentEventIndex] ? '取消簽到' : `為第${numberToChinese(currentEventIndex + 1)}場簽到`}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                  <button
                    onClick={() => onDeleteParticipant(participant.id)}
                    className={`px-4 py-2 rounded-md font-semibold text-xs bg-red-500 hover:bg-red-600 text-white transition-transform transform hover:scale-105 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    aria-label={`刪除參與者 ${participant.name}`}
                    disabled={disabled}
                  >
                    刪除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
       {participants.length === 0 && !disabled && ( // Show only if not disabled by db issue
        <p className="text-center py-8 text-gray-400">尚未新增任何參與者，或篩選結果無資料。</p>
      )}
      {disabled && (
         <p className="text-center py-8 text-red-400">資料庫未連接，簽到功能暫不可用。</p>
      )}
    </div>
  );
};

export default AttendanceTable;