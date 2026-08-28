# 歷史地理資訊研究八步工作流程

這是一個兩頁式靜態網站：

- `index.html`：八步工作流程，每步包含 Prompt 與 Result。
- `teaching.html`：八步卡片式互動教學，包含打字動畫、題目驗證及 Prompt 複製。
- `teaching-content.js`：集中管理每一步的教學文字、題目、答案與最終 Prompt。

## 加入研究內容

1. 把每一步的 Prompt 文字填入 `index.html` 對應的 `textarea`。
2. 把 Excel 成果檔案放入 `results/`，再把結果卡改為下載連結。
3. 步驟八可把 ArcGIS Web Map 的分享連結或 iframe 放入地圖結果欄。
4. 收到正式教學內容後，在 `teaching-content.js` 逐步替換 `intro`、`question`、`success` 和 `prompt`；`type` 可設為 `single` 或 `multiple`，正確選項使用 `correct: true`。

網站不需要後端，可直接使用 GitHub Pages 發佈。
