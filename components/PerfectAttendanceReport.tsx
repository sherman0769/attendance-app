
import React from 'react';
import { Participant } from '../types';

interface PerfectAttendanceReportProps {
  participants: Participant[]; // Already filtered for perfect attendance
  totalEvents: number;
  totalParticipants: number;
}

const PerfectAttendanceReport: React.FC<PerfectAttendanceReportProps> = ({
  participants,
  totalEvents,
  totalParticipants
}) => {
  if (totalParticipants === 0) {
    return (
      <div className="bg-gray-800 p-8 rounded-xl shadow-2xl text-center">
        <h2 className="text-3xl font-bold text-gray-100 mb-4">全勤報告</h2>
        <span role="img" aria-label="獎盃" className="text-6xl block mb-4">🏆</span>
        <p className="text-xl text-gray-300">系統中尚未新增任何參與者。</p>
        <p className="text-gray-400 mt-2">請在「管理簽到」標籤頁中新增參與者以檢視報告。</p>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-800 p-8 rounded-xl shadow-2xl">
      <h2 className="text-3xl font-bold text-gray-100 mb-6 text-center border-b border-gray-700 pb-4">
        <span role="img" aria-label="獎盃" className="mr-3">🏆</span>全勤之星！
      </h2>
      {participants.length > 0 ? (
        <>
          <p className="text-lg text-center text-green-400 mb-6" role="status">
            恭喜這 {participants.length} 位參與者完成了全部 {totalEvents} 場次的簽到！
          </p>
          <ul className="space-y-4">
            {participants.map((participant) => (
              <li
                key={participant.id}
                className="bg-gray-700 p-5 rounded-lg shadow-lg flex items-center space-x-4 transition-all duration-300 hover:shadow-green-500/30 hover:ring-2 hover:ring-green-500"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl font-bold" aria-hidden="true">
                  {participant.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xl font-semibold text-green-300">{participant.name}</p>
                  <p className="text-sm text-gray-400">達成全勤！</p>
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className="text-center py-10">
            <span role="img" aria-label="難過表情" className="text-5xl block mb-4">😔</span>
          <p className="text-xl text-gray-300" role="status">目前還沒有人達成全勤。</p>
          <p className="text-gray-400 mt-2">繼續記錄簽到情況，找出您的全勤之星！</p>
        </div>
      )}
    </div>
  );
};

export default PerfectAttendanceReport;
