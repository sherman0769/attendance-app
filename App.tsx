import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Participant, ActiveTab } from './types';
import { TOTAL_SIGN_INS, MAX_PARTICIPANTS } from './constants';
import AddParticipantForm from './components/AddParticipantForm';
import EventSelector from './components/EventSelector';
import AttendanceTable from './components/AttendanceTable';
import PerfectAttendanceReport from './components/PerfectAttendanceReport';
import ParticipantFilter from './components/ParticipantFilter';
import { db } from './firebaseConfig'; // Import Firestore instance
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  writeBatch,
  Timestamp, // If you plan to use Timestamps
} from 'firebase/firestore';

const formatReadmeToHtml = (markdown: string): string => {
  let html = markdown;
  html = html.replace(/```([\s\S]*?)```/g, (match, code) => {
      const escapedCode = code.replace(/</g, "&lt;").replace(/>/g, "&gt;");
      return `<pre class="bg-gray-900 text-sm text-gray-200 p-4 my-4 rounded-md overflow-x-auto whitespace-pre">${escapedCode.trim()}</pre>`;
  });
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mt-4 mb-2 text-blue-400">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-5 mb-3 text-blue-300">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-extrabold mt-6 mb-4 text-blue-200">$1</h1>');
  html = html.replace(/^---$/gim, '<hr class="my-6 border-gray-600" />');
  html = html.replace(/^\*   (.*$)/gim, '<li class="ml-5 my-1 list-disc">$1</li>');
  html = html.replace(/^-   (.*$)/gim, '<li class="ml-5 my-1 list-disc">$1</li>');
  html = html.replace(/(<li class="ml-5 my-1 list-disc">.*?<\/li>\s*)+/g, (match) => `<ul class="list-inside mb-3">${match}</ul>`);
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
  html = html.replace(/__(.*?)__/gim, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
  html = html.replace(/_(.*?)_/gim, '<em>$1</em>');
  html = html.replace(/`([^`]+)`/gim, '<code class="bg-gray-700 text-yellow-300 px-1.5 py-0.5 rounded-md text-sm">$1</code>');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-teal-400 hover:text-teal-300 underline">$1</a>');
  html = html.split('\n').map(line => {
    if (line.trim() === '' || line.startsWith('<h') || line.startsWith('<ul') || line.startsWith('<li') || line.startsWith('<pre') || line.startsWith('<hr')) {
      return line;
    }
    return `<p class="my-2">${line}</p>`;
  }).join('\n');
  html = html.replace(/<p class="my-2">\s*<\/p>/g, '');
  return html;
};

const App: React.FC = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [newParticipantName, setNewParticipantName] = useState<string>('');
  const [currentEventIndex, setCurrentEventIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<ActiveTab>('manage');
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  const [showReadme, setShowReadme] = useState<boolean>(false);
  const [readmeContent, setReadmeContent] = useState<string>('');
  const [readmeError, setReadmeError] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);

  // Effect to fetch participants from Firestore
  useEffect(() => {
    if (!db) {
      setFirebaseError("Firestore 資料庫未成功初始化。請檢查 Firebase 設定及環境變數。簽到資料將無法儲存。");
      setIsLoading(false);
      return;
    }
    setFirebaseError(null);
    setIsLoading(true);
    const participantsCollectionRef = collection(db, 'participants');
    const q = query(participantsCollectionRef, orderBy('name', 'asc'));

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const fetchedParticipants: Participant[] = snapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
          attendance: doc.data().attendance,
        }));
        setParticipants(fetchedParticipants);
        setIsLoading(false);
      },
      (err) => {
        console.error("Error fetching participants from Firestore:", err);
        setFirebaseError("讀取參與者資料時發生錯誤。請稍後再試或檢查您的網路連線及 Firestore 安全性規則。");
        setError("無法從資料庫讀取參與者列表。");
        setIsLoading(false);
      }
    );

    return () => unsubscribe(); // Cleanup listener on component unmount
  }, []);


  const toggleReadme = useCallback(async () => {
    if (!showReadme && !readmeContent && !readmeError) {
      try {
        setReadmeError(null);
        const response = await fetch('/README.md');
        if (response.ok) {
          const text = await response.text();
          setReadmeContent(text);
        } else {
          console.error("Failed to fetch README:", response.status, response.statusText);
          setReadmeContent('');
          setReadmeError(`無法載入使用說明 (錯誤 ${response.status})。請確認 README.md 檔案存在於應用程式根目錄。`);
        }
      } catch (error) {
        console.error("Error fetching README:", error);
        setReadmeContent('');
        setReadmeError('載入使用說明時發生網路錯誤。');
      }
    }
    setShowReadme(prev => !prev);
  }, [showReadme, readmeContent, readmeError]);


  const handleAddParticipant = useCallback(async () => {
    if (!db) {
      setError("資料庫未連接，無法新增參與者。");
      return;
    }
    if (!newParticipantName.trim()) {
      setError('參與者姓名不能為空。');
      return;
    }
    if (participants.length >= MAX_PARTICIPANTS) {
      setError(`參與者人數不能超過 ${MAX_PARTICIPANTS} 人。`);
      return;
    }
    if (participants.some(p => p.name.toLowerCase() === newParticipantName.trim().toLowerCase())) {
      setError('已存在同名參與者。');
      return;
    }
    setError(null);
    setFirebaseError(null);
    try {
      const newParticipantData = {
        name: newParticipantName.trim(),
        attendance: Array(TOTAL_SIGN_INS).fill(false),
        // createdAt: Timestamp.now() // Optional: if you want to store creation time
      };
      await addDoc(collection(db, 'participants'), newParticipantData);
      setNewParticipantName('');
      // UI will update via onSnapshot
    } catch (err) {
      console.error("Error adding participant to Firestore:", err);
      setFirebaseError("新增參與者時發生錯誤，資料可能未儲存。");
      setError("新增參與者失敗，請檢查網路連線或稍後再試。");
    }
  }, [newParticipantName, participants]);

  const handleToggleAttendance = useCallback(async (participantId: string, eventIdx: number) => {
    if (!db) {
      setError("資料庫未連接，無法更新簽到狀態。");
      return;
    }
    const participant = participants.find(p => p.id === participantId);
    if (!participant) return;

    const newAttendance = [...participant.attendance];
    newAttendance[eventIdx] = !newAttendance[eventIdx];
    
    setError(null);
    setFirebaseError(null);
    try {
      const participantDocRef = doc(db, 'participants', participantId);
      await updateDoc(participantDocRef, { attendance: newAttendance });
      // UI will update via onSnapshot
    } catch (err) {
      console.error("Error updating attendance in Firestore:", err);
      setFirebaseError("更新簽到狀態時發生錯誤，資料可能未儲存。");
      setError("更新簽到狀態失敗，請檢查網路連線或稍後再試。");
      // Optionally revert local state if Firebase update fails and not using onSnapshot,
      // but with onSnapshot, the local state reflects Firestore's state.
    }
  }, [participants]);

  const handleDeleteParticipant = useCallback(async (participantId: string) => {
    if (!db) {
      setError("資料庫未連接，無法刪除參與者。");
      return;
    }
    setError(null);
    setFirebaseError(null);
    try {
      const participantDocRef = doc(db, 'participants', participantId);
      await deleteDoc(participantDocRef);
      // UI will update via onSnapshot
    } catch (err) {
      console.error("Error deleting participant from Firestore:", err);
      setFirebaseError("刪除參與者時發生錯誤，資料可能未移除。");
      setError("刪除參與者失敗，請檢查網路連線或稍後再試。");
    }
  }, []);

  const perfectlyAttendedParticipants = useMemo(() => {
    return participants.filter(p => p.attendance.every(attended => attended));
  }, [participants]);

  const filteredParticipants = useMemo(() => {
    if (!searchTerm.trim()) {
      return participants;
    }
    return participants.filter(p =>
      p.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
    );
  }, [participants, searchTerm]);

  const TabButton: React.FC<{tabName: ActiveTab, currentTab: ActiveTab, onClick: () => void, children: React.ReactNode}> = ({ tabName, currentTab, onClick, children }) => (
    <button
      onClick={onClick}
      className={`px-6 py-3 text-lg font-medium rounded-t-lg transition-colors duration-200 ease-in-out
                  ${activeTab === tabName 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-gray-200 text-blue-700 hover:bg-gray-300'}`}
      aria-current={activeTab === tabName ? 'page' : undefined}
    >
      {children}
    </button>
  );

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showReadme) {
        setShowReadme(false);
      }
    };
    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showReadme]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-6 text-center">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-pink-400 to-indigo-400">
            IMC盈科AI學習簽到系統
          </h1>
          <p className="mt-3 text-xl text-gray-300">追蹤簽到情況，表揚全勤參與者！(資料已啟用雲端儲存)</p>
        </header>

        <nav role="tablist" className="mb-8 flex justify-center items-center space-x-2 border-b-2 border-gray-600 pb-px">
          <TabButton tabName="manage" currentTab={activeTab} onClick={() => setActiveTab('manage')}>
            <span role="img" aria-label="管理" className="mr-2">📝</span> 管理簽到
          </TabButton>
          <TabButton tabName="report" currentTab={activeTab} onClick={() => setActiveTab('report')}>
            <span role="img" aria-label="報告" className="mr-2">🏆</span> 全勤報告
          </TabButton>
          <button
            onClick={toggleReadme}
            className="px-6 py-3 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
            aria-expanded={showReadme}
            aria-controls="readme-modal"
          >
            <span role="img" aria-label="書籍" className="mr-2">📖</span> 使用說明
          </button>
        </nav>

        {firebaseError && (
          <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-md shadow-sm" role="alert">
            <p className="font-semibold">資料庫提示:</p>
            <p>{firebaseError}</p>
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md shadow-sm" role="alert">
            <p className="font-semibold">錯誤:</p>
            <p>{error}</p>
          </div>
        )}

        <main id="tabpanel-container">
          {isLoading && (
            <div className="text-center py-10">
              <p className="text-2xl text-gray-300 animate-pulse">
                <span role="img" aria-label="沙漏" className="mr-2">⏳</span> 正在從雲端載入資料...
              </p>
            </div>
          )}
          {!isLoading && activeTab === 'manage' && (
            <div role="tabpanel" aria-labelledby="manage-tab" className="space-y-8">
              <AddParticipantForm
                newParticipantName={newParticipantName}
                onNameChange={setNewParticipantName}
                onAddParticipant={handleAddParticipant}
                participantCount={participants.length}
                disabled={!db} 
              />

              {participants.length > 0 && (
                 <ParticipantFilter
                    searchTerm={searchTerm}
                    onSearchTermChange={setSearchTerm}
                  />
              )}
             
              {participants.length > 0 ? (
                <>
                  <EventSelector
                    currentEventIndex={currentEventIndex}
                    onEventChange={setCurrentEventIndex}
                    totalEvents={TOTAL_SIGN_INS}
                  />
                  {filteredParticipants.length > 0 ? (
                    <AttendanceTable
                      participants={filteredParticipants}
                      currentEventIndex={currentEventIndex}
                      onToggleAttendance={handleToggleAttendance}
                      onDeleteParticipant={handleDeleteParticipant}
                      totalEvents={TOTAL_SIGN_INS}
                      disabled={!db}
                    />
                  ) : (
                    <div className="text-center py-10 bg-gray-700 rounded-lg shadow-xl">
                      <p className="text-xl text-gray-300">
                        沒有找到符合「<span className="font-semibold text-yellow-400">{searchTerm}</span>」的參與者。
                      </p>
                    </div>
                  )}
                </>
              ) : (
                   !firebaseError && !isLoading && // Only show if not loading and no major firebase error
                   <div className="text-center py-10 bg-gray-700 rounded-lg shadow-xl">
                      <p className="text-xl text-gray-300">還沒有參與者，請先新增！</p>
                   </div>
              )}
            </div>
          )}

          {!isLoading && activeTab === 'report' && (
            <div role="tabpanel" aria-labelledby="report-tab">
              <PerfectAttendanceReport
                participants={perfectlyAttendedParticipants}
                totalEvents={TOTAL_SIGN_INS}
                totalParticipants={participants.length}
              />
            </div>
          )}
        </main>
        
        <footer className="mt-12 text-center text-gray-400 text-sm">
            <p>&copy; {new Date().getFullYear()} IMC盈科AI學習簽到系統. 版權所有.</p>
            <p>用心打造，高效追蹤。資料儲存於雲端。</p>
        </footer>
      </div>

      {showReadme && (
        <div
          id="readme-modal"
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
          onClick={toggleReadme} 
          role="dialog"
          aria-modal="true"
          aria-labelledby="readme-modal-title"
        >
          <div
            className="bg-gray-800 p-6 sm:p-8 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto text-gray-200"
            onClick={(e) => e.stopPropagation()} 
          >
            <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
              <h2 id="readme-modal-title" className="text-2xl sm:text-3xl font-bold text-gray-100">
                <span role="img" aria-label="書籍" className="mr-3">📖</span> 使用說明
              </h2>
              <button
                onClick={toggleReadme}
                className="text-gray-400 hover:text-gray-200 text-3xl sm:text-4xl font-bold leading-none p-1"
                aria-label="關閉使用說明"
              >
                &times;
              </button>
            </div>
            {readmeError ? (
              <div className="text-center text-red-400 py-10">
                <p className="text-xl font-semibold">讀取說明失敗</p>
                <p>{readmeError}</p>
              </div>
            ) : readmeContent ? (
              <div 
                className="readme-content-container text-sm sm:text-base leading-relaxed" 
                style={{ whiteSpace: 'pre-line' }} 
                dangerouslySetInnerHTML={{ __html: formatReadmeToHtml(readmeContent) }} 
              />
            ) : (
              <p className="text-center text-xl py-10">載入中...</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;