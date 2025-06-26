# IMC盈科AI學習簽到系統 (雲端儲存版)

本專案是一個簡單易用的網頁應用程式，旨在協助使用者追蹤小型活動（最多100人，共6場次）的參與者簽到情況，並能快速識別出達成全勤的參與者。**此版本已整合 Firebase Firestore，可將簽到資料永久儲存在雲端。**

## 目錄
1.  [主要功能](#主要功能)
2.  [技術棧](#技術棧)
3.  [專案結構](#專案結構)
4.  [核心應用程式邏輯與資料流程](#核心應用程式邏輯與資料流程)
5.  [Firebase 設定與環境變數](#firebase-設定與環境變數)
    *   [建立 Firebase 專案](#1-建立-firebase-專案)
    *   [設定 Firestore 資料庫](#2-設定-firestore-資料庫)
    *   [取得 Firebase 設定檔](#3-取得-firebase-設定檔-sdk-snippet)
    *   [設定環境變數](#4-設定環境變數)
    *   [Firestore 安全性規則 (極重要！)](#5-firestore-安全性規則-極重要)
6.  [本地開發設定](#本地開發設定)
7.  [部署 (以 Vercel 為例)](#部署-以-vercel-為例)
8.  [使用教學](#使用教學)
9.  [錯誤處理與提示](#錯誤處理與提示)
10. [樣式與無障礙性](#樣式與無障礙性)

## 主要功能

*   **雲端資料持久化**：所有參與者資料和簽到狀態均儲存在您的 Firebase Firestore 資料庫中，資料不會因關閉瀏覽器或重新整理而遺失。
*   **即時同步**：資料在不同裝置或瀏覽器會話間（若使用相同 Firebase 專案）保持同步。
*   **新增參與者**：最多可登錄100位參與者。
*   **多場次簽到**：支援共6場次的簽到記錄（標示為「第一場」至「第六場」）。
*   **即時簽到管理**：針對目前選定的場次，方便地標記或取消標記參與者的出席狀態。
*   **參與者篩選**：在管理簽到頁面，可依姓名快速篩選參與者，方便查找。
*   **刪除參與者**：可從列表中移除不再需要或錯誤輸入的參與者，變更將同步至雲端。
*   **全勤報告**：自動產生全勤獎名單，表揚所有場次均出席的參與者。
*   **使用說明模態框**：內建使用說明，方便使用者隨時查閱。
*   **響應式設計**：介面適應不同螢幕尺寸。
*   **使用者友善**：直觀的繁體中文操作介面。

## 技術棧

*   **前端框架/函式庫**：React v19 (透過 esm.sh CDN)
*   **程式語言**：TypeScript (直接在瀏覽器中透過 esm.sh 執行，無編譯步驟)
*   **樣式**：Tailwind CSS (透過 CDN)
*   **資料儲存**：Firebase Firestore (雲端 NoSQL 資料庫)
*   **Firebase SDK**：v10.x.x (透過 esm.sh CDN)
*   **模組載入**：瀏覽器原生 ES Modules 搭配 Import Maps (在 `index.html` 中定義)

## 專案結構

```
.
├── README.md                   # 本說明檔案
├── firebaseConfig.ts           # Firebase 初始化與 Firestore 實例匯出
├── index.html                  # 應用程式進入點 HTML 檔案，包含 import map 和樣式表
├── index.tsx                   # React 應用程式掛載點
├── App.tsx                     # 主要的 React 應用程式組件，管理狀態與邏輯
├── components/                 # 存放可重用 UI 組件的資料夾
│   ├── AddParticipantForm.tsx  # 新增參與者表單組件
│   ├── AttendanceTable.tsx     # 顯示與管理簽到狀態的表格組件
│   ├── EventSelector.tsx       # 選擇目前簽到場次的下拉選單組件
│   ├── ParticipantFilter.tsx   # 依姓名篩選參與者的輸入框組件
│   └── PerfectAttendanceReport.tsx # 顯示全勤報告的組件
├── constants.ts                # 存放應用程式的全域常數
├── metadata.json               # 應用程式元數據 (名稱、描述)
└── types.ts                    # TypeScript 型別定義
```

*   **`index.html`**: 應用程式的 HTML 進入點。它設定了 `importmap` 以便瀏覽器能從 CDN 解析 React 和 Firebase 的模組路徑，載入 Tailwind CSS，並執行 `index.tsx`。
*   **`index.tsx`**: 將主要的 `<App />` React 組件掛載到 `index.html` 中的 `<div id="root">` 元素。
*   **`App.tsx`**: 這是應用程式的核心。
    *   管理大部分的狀態，包括參與者列表 (`participants`)、目前選取的活動 (`currentEventIndex`)、啟用的分頁 (`activeTab`)、搜尋詞 (`searchTerm`)、載入狀態 (`isLoading`)，以及各種錯誤狀態。
    *   處理所有 Firebase Firestore 的互動：
        *   使用 `onSnapshot` 監聽 `participants` 集合的即時變更。
        *   處理新增 (`handleAddParticipant`)、更新簽到 (`handleToggleAttendance`)、刪除參與者 (`handleDeleteParticipant`) 等操作，並將變更同步到 Firestore。
    *   管理「使用說明」模態框的顯示 (`showReadme`) 與內容載入 (`readmeContent`)。
    *   根據 `activeTab` 狀態，渲染「管理簽到」或「全勤報告」視圖。
    *   將狀態和回呼函數作為 props 傳遞給子組件。
*   **`components/`**: 此資料夾包含所有獨立的 UI 組件，使 `App.tsx` 更簡潔並促進可重用性。
    *   `AddParticipantForm.tsx`: 包含新增參與者所需的輸入框和按鈕。
    *   `AttendanceTable.tsx`: 負責顯示參與者列表、他們的簽到狀態，以及簽到和刪除按鈕。
    *   `EventSelector.tsx`: 一個下拉選單，讓使用者選擇目前要管理的簽到場次。
    *   `ParticipantFilter.tsx`: 一個輸入框，用於篩選 `AttendanceTable` 中顯示的參與者。
    *   `PerfectAttendanceReport.tsx`: 顯示已達成全勤的參與者列表。
*   **`types.ts`**: 定義應用程式中使用的 TypeScript 型別，例如 `Participant` 和 `ActiveTab`，增強程式碼的型別安全性。
*   **`constants.ts`**: 儲存全域常數，如 `TOTAL_SIGN_INS` 和 `MAX_PARTICIPANTS`，方便管理和修改。
*   **`firebaseConfig.ts`**: 初始化 Firebase 應用程式並匯出 Firestore 資料庫實例 (`db`)。它從環境變數中讀取 Firebase 設定，這是安全的做法。
*   **`metadata.json`**: 包含應用程式的基本元數據，如名稱和描述。
*   **`README.md`**: (本檔案) 提供專案的完整說明。

## 核心應用程式邏輯與資料流程

1.  **初始化與資料載入**:
    *   瀏覽器載入 `index.html`。
    *   `index.tsx` 將 `App` 組件渲染到 DOM 中。
    *   `App.tsx` 中的 `useEffect` 掛鉤執行：
        *   檢查 `firebaseConfig.ts` 中的 `db` 是否成功初始化。若否，設定 `firebaseError`。
        *   若 `db` 可用，設定 `isLoading` 為 `true`。
        *   建立一個 Firestore 查詢，以參與者姓名 (`name`) 升序排列，並訂閱 `participants` 集合的 `onSnapshot`。
        *   `onSnapshot` 首次觸發時，會從 Firestore 取得所有參與者資料，更新 `participants` 狀態，並設定 `isLoading` 為 `false`。
        *   之後，只要 Firestore 中的 `participants` 集合有任何變更，`onSnapshot` 都會再次觸發，即時更新 `participants` 狀態，從而自動更新 UI。

2.  **使用者互動與資料變更**:
    *   **新增參與者**:
        *   使用者在 `AddParticipantForm` 中輸入姓名並點擊「新增」。
        *   觸發 `App.tsx` 中的 `handleAddParticipant` 函數。
        *   該函數驗證輸入，然後使用 `addDoc` 將新的參與者物件（包含姓名和初始的 `attendance` 陣列）寫入 Firestore 的 `participants` 集合。
        *   由於 `onSnapshot` 的存在，UI 會自動更新以顯示新參與者。
    *   **切換簽到狀態**:
        *   使用者在 `AttendanceTable` 中點擊某位參與者的「簽到」或「取消簽到」按鈕。
        *   觸發 `App.tsx` 中的 `handleToggleAttendance` 函數。
        *   該函數更新對應參與者文件在 Firestore 中的 `attendance` 陣列。
        *   UI 自動更新。
    *   **刪除參與者**:
        *   使用者在 `AttendanceTable` 中點擊「刪除」按鈕。
        *   觸發 `App.tsx` 中的 `handleDeleteParticipant` 函數。
        *   該函數使用 `deleteDoc` 從 Firestore 中刪除對應的參與者文件。
        *   UI 自動更新。
    *   **篩選參與者**:
        *   使用者在 `ParticipantFilter` 輸入框中輸入文字。
        *   `searchTerm` 狀態在 `App.tsx` 中更新。
        *   `filteredParticipants` (一個 `useMemo` 衍生的狀態) 會根據 `searchTerm` 過濾 `participants` 列表。
        *   `AttendanceTable` 接收 `filteredParticipants` 並只顯示符合條件的參與者。此過程不涉及 Firestore。
    *   **切換場次**:
        *   使用者在 `EventSelector` 中選擇不同的場次。
        *   `currentEventIndex` 狀態在 `App.tsx` 中更新。
        *   `AttendanceTable` 使用 `currentEventIndex` 來決定「操作」欄位應針對哪個場次。

3.  **狀態管理**:
    *   主要狀態由 `App.tsx` 中的 `useState` 鉤子管理。
    *   `useMemo` 用於計算衍生狀態（如 `perfectlyAttendedParticipants`, `filteredParticipants`），以優化效能。

4.  **顯示「使用說明」**:
    *   點擊「使用說明」按鈕觸發 `toggleReadme`。
    *   首次點擊時，若 `readmeContent` 為空，則非同步 `fetch` `/README.md` 檔案內容。
    *   成功後，內容存入 `readmeContent` 狀態，`showReadme` 設為 `true`，模態框顯示。
    *   `formatReadmeToHtml` 函數將 Markdown 轉為 HTML 進行顯示。

## Firebase 設定與環境變數

**您必須先建立並設定一個 Firebase 專案才能使用此應用程式的雲端儲存功能。**

### 1. 建立 Firebase 專案
   - 前往 [Firebase Console](https://console.firebase.google.com/)。
   - 點擊「新增專案」，然後依照指示建立一個新的 Firebase 專案。

### 2. 設定 Firestore 資料庫
   - 在您的 Firebase 專案中，前往「建構」>「Firestore Database」。
   - 點擊「建立資料庫」。
   - 選擇「以**測試模式**啟動」(方便開發初期使用，**生產環境請務必設定安全規則**)。
   - 選擇離您最近的 Cloud Firestore 位置。
   - 點擊「啟用」。

### 3. 取得 Firebase 設定檔 (SDK snippet)
   - 在您的 Firebase 專案中，點擊左側導覽列的「專案總覽」旁邊的齒輪圖示 ⚙️，然後選擇「專案設定」。
   - 在「您的應用程式」區塊，點擊網頁圖示 `</>` (新增網頁應用程式)。
   - 為您的應用程式取一個暱稱 (例如：簽到系統)，然後點擊「註冊應用程式」。
   - Firebase 會提供一段設定檔程式碼 (Firebase SDK snippet)。您需要從這段程式碼中取得以下值：
     - `apiKey`
     - `authDomain`
     - `projectId`
     - `storageBucket`
     - `messagingSenderId`
     - `appId`
     - `measurementId` (可選)

### 4. 設定環境變數
   - **本應用程式透過環境變數讀取 Firebase 設定。您必須在您的託管環境 (例如 Vercel, Netlify, 或您的伺服器) 中設定以下環境變數：**
     - `REACT_APP_FIREBASE_API_KEY`：填入您的 `apiKey`
     - `REACT_APP_FIREBASE_AUTH_DOMAIN`：填入您的 `authDomain`
     - `REACT_APP_FIREBASE_PROJECT_ID`：填入您的 `projectId`
     - `REACT_APP_FIREBASE_STORAGE_BUCKET`：填入您的 `storageBucket`
     - `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`：填入您的 `messagingSenderId`
     - `REACT_APP_FIREBASE_APP_ID`：填入您的 `appId`
     - `REACT_APP_FIREBASE_MEASUREMENT_ID` (可選)：填入您的 `measurementId`

   - **重要提示**：**請勿**將這些金鑰直接寫入程式碼中或提交到公共的 Git 儲存庫。務必使用環境變數。`firebaseConfig.ts` 已設定為從 `process.env` 讀取這些變數。

### 5. Firestore 安全性規則 (極重要！)
   - 在開發初期，您可能使用了測試模式的安全性規則 (`allow read, write: if true;`)。
   - **對於生產環境，您必須設定更嚴格的 Firestore 安全性規則**，以保護您的資料免於未經授權的存取。
   - 您可以在 Firebase Console 的 Firestore Database >「規則」分頁中編輯安全性規則。
   - **範例 (僅供參考，請依實際需求調整，此範例仍非常寬鬆)：**
     ```firestore-rules
     rules_version = '2';
     service cloud.firestore {
       match /databases/{database}/documents {
         match /participants/{participantId} {
           // 為了讓目前應用程式能直接讀寫，暫時保持開放。
           // 在生產環境中，您應該根據您的驗證機制（如果有的話）
           // 或其他邏輯來限制讀寫權限。
           allow read, write: if true; // 非常不安全，僅供範例和快速原型開發
                                       // 考慮: allow read, write: if request.auth != null; (若有使用者驗證)
         }
       }
     }
     ```
   - **強烈建議您學習並實施符合您應用程式需求的安全性規則。** 若無適當規則，任何人都可以讀寫您的資料庫。

## 本地開發設定

1.  **取得程式碼**：複製或下載本倉庫的所有檔案到您的本地電腦。
2.  **Firebase 設定**：
    *   完成上述「Firebase 設定與環境變數」中的步驟 1-3，以建立您的 Firebase 專案並取得設定金鑰。
    *   **設定本地環境變數**：由於直接在瀏覽器開啟 `index.html` 通常無法讀取作業系統的環境變數，您有以下選擇：
        *   **選項 A (暫時性，不建議用於版本控制)**：
            *   *暫時* 修改 `firebaseConfig.ts`，將您的 Firebase 設定金鑰直接填入 `firebaseConfig` 物件中。
            *   **警告**：此方法僅供本地快速測試。**切勿將含有真實金鑰的 `firebaseConfig.ts` 檔案提交到 Git。** 在提交前務必還原成使用 `process.env`。
        *   **選項 B (建議，使用本地開發伺服器)**：
            *   使用一個支援 `.env` 檔案的輕量級本地開發伺服器（例如 `vite` 或 `live-server` 搭配特定設定）。
            *   在專案根目錄建立一個名為 `.env` 的檔案 (並確保將 `.env` 加入 `.gitignore` 中)。
            *   在 `.env` 檔案中填入您的 Firebase 金鑰，格式如下：
              ```
              REACT_APP_FIREBASE_API_KEY=YOUR_API_KEY
              REACT_APP_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
              REACT_APP_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
              REACT_APP_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
              REACT_APP_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
              REACT_APP_FIREBASE_APP_ID=YOUR_APP_ID
              ```
            *   透過該開發伺服器啟動應用程式。

3.  **執行應用程式**：
    *   如果您未使用本地開發伺服器 (選項 A 的一部分)，可以直接用瀏覽器開啟專案資料夾中的 `index.html` 檔案。
    *   如果您使用本地開發伺服器，請依照該伺服器的指示啟動。
4.  **Firestore 安全規則**：確保您的 Firestore 安全性規則允許來自 `localhost` 的讀寫操作（測試模式通常允許）。

## 部署 (以 Vercel 為例)

Vercel 非常適合託管此類前端應用程式。

1.  **推送至 Git 儲存庫**：將您的專案程式碼推送到一個 GitHub, GitLab, 或 Bitbucket 儲存庫。
2.  **連接 Vercel**：
    *   登入您的 Vercel 帳戶。
    *   點擊「Add New...」 > 「Project」。
    *   選擇「Import Git Repository」並連接到您存放專案的 Git 儲存庫。
3.  **專案設定**:
    *   Vercel 通常能自動識別這是一個靜態網站。如果需要手動設定：
        *   **Framework Preset**: 選擇 "Other" 或讓 Vercel 自動偵測。
        *   **Build Command**: 可以留空，因為此專案沒有傳統的建置步驟。
        *   **Output Directory**: 可以留空，或設為專案根目錄 (Vercel 會尋找 `index.html`)。
        *   **Install Command**: 可以留空。
4.  **設定環境變數 (極重要)**:
    *   在 Vercel 專案的設定頁面中，找到「Environment Variables」區塊。
    *   將您在「Firebase 設定與環境變數」步驟 4 中取得的所有 `REACT_APP_FIREBASE_...` 金鑰逐一新增為環境變數。
    *   例如：新增一個名為 `REACT_APP_FIREBASE_PROJECT_ID` 的變數，並將其值設為您的 Firebase Project ID。
5.  **部署**：點擊「Deploy」按鈕。Vercel 將部署您的應用程式。
6.  **Firestore 安全規則**：再次確認您的 Firestore 安全性規則已設定妥當，並考慮到您的應用程式網域。

## 使用教學

### 1. 開啟應用程式
   - 將專案部署到已設定好上述 Firebase 環境變數的託管服務 (如 Vercel)。
   - 在現代網頁瀏覽器中開啟應用程式的網址。
   - 應用程式啟動時會嘗試連接到您的 Firebase Firestore 資料庫。如果連接成功且環境變數設定正確，將會載入已儲存的參與者資料。否則，會顯示錯誤/提示訊息。

### 2. 管理簽到 (📝 管理簽到 分頁)
   與先前版本操作方式相同，但所有操作 (新增、標記簽到、刪除) 都會同步到雲端 Firestore 資料庫。
   - 如果 Firebase 未成功連接 (例如環境變數未設定)，新增、簽到、刪除等功能可能會被禁用或顯示錯誤訊息。

#### a. 新增參與者
   - 點擊頂部的「📝 管理簽到」分頁。
   - 在「新增參與者」區塊的「參與者姓名」輸入框中，輸入參與者的完整姓名。
   - 按下「➕ 新增參與者」按鈕。資料將儲存至 Firestore。

#### b. 篩選參與者
   - 在「篩選參與者」輸入框中輸入關鍵字，下方表格會即時顯示符合條件的參與者。此篩選為前端篩選。

#### c. 選擇目前簽到場次
   - 使用「目前簽到場次」下拉選單選擇要管理的場次。表格中的「操作」欄將針對此選定場次。

#### d. 標記/取消簽到
   - 在簽到表格中，找到對應參與者及目前選定場次，點擊「為第X場簽到」或「取消簽到」按鈕。狀態將更新至 Firestore。

#### e. 刪除參與者
   - 點擊參與者列最後的紅色「刪除」按鈕，確認後該參與者將從 Firestore 中移除。

### 3. 查看全勤報告 (🏆 全勤報告 分頁)
   - 點擊頂部的「🏆 全勤報告」分頁。
   - 此頁面會自動計算並顯示所有 `TOTAL_SIGN_INS` (預設6場) 均已簽到的參與者名單。

### 4. 查閱使用說明 (📖 使用說明 按鈕)
    - 點擊導覽列中的「📖 使用說明」按鈕。
    - 彈出視窗會顯示本 README 檔案的主要內容，供快速查閱。
    - 點擊視窗外部或右上角的「×」可關閉說明。

## 錯誤處理與提示

應用程式包含以下錯誤處理和提示機制：

*   **Firebase 連線錯誤 (`firebaseError`)**: 如果 Firebase 初始化失敗 (例如，`projectId` 未設定) 或讀取資料時出錯，會在頁面頂部顯示黃色的提示框。
*   **一般操作錯誤 (`error`)**: 如果新增參與者時姓名為空、參與者已存在、超過人數上限，或 Firestore 操作（新增、更新、刪除）失敗，會在頁面頂部顯示紅色的錯誤提示框。
*   **載入狀態 (`isLoading`)**: 從 Firestore 載入初始資料時，會顯示「正在從雲端載入資料...」的訊息。
*   **README 載入錯誤 (`readmeError`)**: 如果「使用說明」模態框無法載入 `README.md` 內容，會在模態框內顯示錯誤訊息。
*   **表單禁用狀態**: 如果 Firebase 未連接或已達參與者人數上限，新增參與者表單的按鈕和輸入框可能會被禁用。簽到表格的操作按鈕在 Firebase 未連接時也會被禁用。

## 樣式與無障礙性

*   **樣式**:
    *   主要使用 Tailwind CSS (透過 CDN 載入) 進行樣式設計，實現現代化且響應式的介面。
    *   少量內聯樣式和 `<style>` 標籤中的全域字體設定在 `index.html`。
    *   配色方案以深色模式為主 (slate, gray, blue)，提供舒適的視覺體驗。
*   **無障礙性 (Accessibility)**:
    *   盡可能使用語義化的 HTML 元素 (例如 `nav`, `main`, `header`, `footer`, `button`, `table` 結構)。
    *   為互動元素（按鈕、輸入框、選擇器）提供 `aria-label`, `aria-labelledby`, `aria-describedby`, `aria-current`, `aria-expanded`, `aria-controls`, `role` 等 ARIA 屬性，以增強螢幕閱讀器等輔助技術的可用性。
    *   確保表單元素與其標籤 (`<label htmlFor>`) 正確關聯。
    *   提供視覺焦點指示 (Tailwind CSS 預設提供)。

---

希望這份更新的說明能幫助您順利設定、理解、部署並使用已整合 Firebase 的「IMC盈科AI學習簽到系統」！
