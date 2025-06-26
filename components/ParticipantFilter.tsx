
import React from 'react';

interface ParticipantFilterProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
}

const ParticipantFilter: React.FC<ParticipantFilterProps> = ({ searchTerm, onSearchTermChange }) => {
  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-2xl">
      <label htmlFor="participantSearch" className="block text-xl font-semibold text-gray-100 mb-3">
        <span role="img" aria-label="放大鏡" className="mr-2">🔍</span> 篩選參與者
      </label>
      <input
        type="search"
        id="participantSearch"
        value={searchTerm}
        onChange={(e) => onSearchTermChange(e.target.value)}
        placeholder="依姓名搜尋..."
        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
        aria-label="依姓名篩選參與者"
      />
    </div>
  );
};

export default ParticipantFilter;
