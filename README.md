# 歷史地理資訊研究八步工作流程

這是一個兩頁式靜態網站：

- `index.html`：八步工作流程，每步包含 Prompt 與 Result。
- `teaching.html`：八步卡片式互動教學，包含打字動畫、題目驗證及 Prompt 複製。
- `teaching-content.js`：集中管理每一步的教學文字、題目、答案與最終 Prompt。
- `example23.js`：將《江右游日記》二十三日的實際資料、Prompt、Excel sheet 名稱及 ArcGIS 統計注入首頁。
- `results/jiangyou-23-eight-step.xlsx`：八步工作流程所用的最新研究工作簿。
- `results/jiangyou-23-step-sheets.xlsx`：分步交付工作簿；步驟一至七各自保存二十三日「經過」結果，並另設步驟一篩除 worksheet；步驟五改為精簡的經緯度／統一資料來源表，不再另設各 API 摘要 worksheet。每張 worksheet 頂部保存該步驟的專屬 Prompt。步驟八不設 Excel worksheet，改以 ArcGIS map 交付。
- `results/江右游日记_二十三日_步驟一_地名抽取.xlsx` 至 `results/江右游日记_二十三日_步驟七_原文推算.xlsx`：按步驟分開的二十三日獨立 Excel 檔案；首頁每個步驟的下載按鈕直接指向相應檔案。
- `results/jiangyou-23-arcgis-map.zip`：二十三日 ArcGIS 正式點、輔助點、有序線及走廊圖層。
- `results/jiangyou-23-eight-step-prompts.md`：從 project 規則及腳本抽出的八步 Prompt／結果索引。

## 目前示範案例

首頁目前使用《江右游日記》二十三日資料：25 筆經過、40 筆提及、15 個待核補查正式點、13 個輔助節點及 26 段有序線／走廊。正式座標仍標示為 pending/review；輔助節點不混入正式地標層。

## 加入研究內容

1. 把每一步的 Prompt 文字填入 `index.html` 對應的 `textarea`。
2. 把 Excel 成果檔案放入 `results/`，再把結果卡改為下載連結。
3. 步驟八可把 ArcGIS Web Map 的分享連結或 iframe 放入地圖結果欄。
4. 收到正式教學內容後，在 `teaching-content.js` 逐步替換 `intro`、`question`、`success` 和 `prompt`；`type` 可設為 `single` 或 `multiple`，正確選項使用 `correct: true`。

網站不需要後端，可直接使用 GitHub Pages 發佈。
