import React from 'react';
import { MAX_PARTICIPANTS } from '../constants';

interface AddParticipantFormProps {
  newParticipantName: string;
  onNameChange: (name: string) => void;
  onAddParticipant: () => void;
  participantCount: number;
  disabled?: boolean; // Optional: To disable if DB not connected
}

const AddParticipantForm: React.FC<AddParticipantFormProps> = ({
  newParticipantName,
  onNameChange,
  onAddParticipant,
  participantCount,
  disabled = false
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled) return;
    onAddParticipant();
  };

  const canAddMore = participantCount < MAX_PARTICIPANTS;

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-2xl">
      <h2 className="text-2xl font-semibold text-gray-100 mb-6 border-b border-gray-700 pb-3">
        <span role="img" aria-label="新增使用者" className="mr-2">👤</span>新增參與者
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4" aria-labelledby="add-participant-heading">
        <div>
          <label htmlFor="participantName" className="block text-sm font-medium text-gray-300 mb-1">
            參與者姓名
          </label>
          <input
            type="text"
            id="participantName"
            value={newParticipantName}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="輸入姓名 (例如, 陳大文)"
            className={`w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!canAddMore || disabled}
            aria-describedby={!canAddMore ? "max-participants-note" : undefined}
          />
        </div>
        <button
          type="submit"
          className={`w-full py-3 px-6 text-lg font-semibold rounded-lg transition-colors duration-200 ease-in-out flex items-center justify-center
                      ${(!canAddMore || disabled)
                        ? 'bg-gray-500 text-gray-300 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'}`}
          disabled={!canAddMore || disabled}
        >
          <span role="img" aria-label="加號" className="mr-2 text-xl">➕</span> 新增參與者
        </button>
        {disabled && !canAddMore && (
           <p className="text-sm text-yellow-400 mt-2 text-center" role="status">
            資料庫未連接或已達到參與者上限。
          </p>
        )}
        {!disabled && !canAddMore && (
          <p id="max-participants-note" className="text-sm text-yellow-400 mt-2 text-center" role="status">
            已達到最大參與者上限 ({MAX_PARTICIPANTS}人)。
          </p>
        )}
         {disabled && canAddMore && (
          <p className="text-sm text-red-400 mt-2 text-center" role="status">
            資料庫未連接，無法新增。
          </p>
        )}
      </form>
       <p className="text-sm text-gray-400 mt-4 text-center" aria-live="polite">
         目前參與者: {participantCount} / {MAX_PARTICIPANTS}
       </p>
    </div>
  );
};

export default AddParticipantForm;