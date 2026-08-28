# 《江右游日記》二十三日：八步 Prompt／結果索引

這份索引是由 project 內現有的抽取規則、配對腳本、地方志／API 查詢及 ArcGIS 輸出整理而成。步驟一的完整抽取規則見 `prompts/extract_places.txt`；其他步驟是按 project 實際工作流整理成可重做的操作 Prompt。

## 步驟一：抽地名

**Prompt**

請只處理《江右游日記》二十三日段落，按出現次序抽取具名地理實體。輸出序號、日期、地名、類別、細分類、行程（經過／提及）及原文；重複出現的地名保留每次紀錄。橋、城門、驛站、碼頭、私人住所、建築內部小物及修辭方向詞，另列入篩除表，不得當作正式地標。

**結果 worksheet／檔案**：`步驟一_抽地名`（二十三日經過 25 筆，Prompt 已置於 worksheet 頂部）＋`江右游日记_篩除`（二十三日經過篩除 15 筆）；`江右游日记_二十三日_步驟一_地名抽取.xlsx`

來源：`prompts/extract_places.txt`、`artifact_work/audit_jiangyou_context.py`

## 步驟二：配對古代地區同現代地區

**Prompt**

請把二十三日的每筆經過地點配對到 1636 年古代行政層級：承宣布政使司→府（直隸州）→州→縣，再配對現代省級、地級、縣級。保留古今關係、配對狀態、來源及衝突；現代同名不得單獨視為同一地點。

**結果 worksheet／檔案**：`步驟二_古今地區`（25 筆；Prompt 已置於 worksheet 頂部）；`江右游日记_二十三日_步驟二_古今地區.xlsx`

來源：`artifact_work/map_jiangyou_historical_modern.py`、`work_coord_lookup/add_chgis_steps_sheet.mjs`

## 步驟三：配對地方志（有距離資料）

**Prompt**

請在識典古籍閱讀地方志原文，只保留同時提及地名及方向、里數、界址、水系或相鄰關係的句子。輸出地方志書名、版本、原句、參照地點與匹配狀態；配不到時留空並標示未匹配，不可猜測經緯度。

**結果 worksheet／檔案**：`步驟三_地方志`（16 筆；其中 4 筆已有地方志配對：小隱岩、巴溪及五面峰兩次出現；Prompt 已置於 worksheet 頂部）；`江右游日记_二十三日_步驟三_地方志.xlsx`

來源：`artifact_work/jiangyou_context/shidian_gazetteer_matches.mjs`、`work_coord_lookup/add_steps3_5_sheets.mjs`

## 步驟四：設定經緯度範圍

**Prompt**

請以古今行政區 polygon、前後已確認錨點、地方志方向與里數設定候選經緯度範圍。保存 bbox、走廊及 WKT；區域級證據只支持搜尋範圍，不得用縣治或 bbox 中心冒充微地名精確座標。

**結果 worksheet／檔案**：`步驟四_座標範圍`（6 個二十三日相關行政區摘要；完整邊界頂點仍保留於原始研究工作簿；Prompt 已置於 worksheet 頂部）；`江右游日记_二十三日_步驟四_座標範圍.xlsx`

來源：`artifact_work/fetch_modern_admin_boundaries.py`、`work_coord_lookup/add_steps3_5_sheets.mjs`

## 步驟五：用 database 及 API 配對地點經緯度

**Prompt**

請在指定經緯度範圍內以 CHGIS/TGAZ、Wikidata、OpenStreetMap/Nominatim、Amap 及 Google Maps 交叉核查候選；只輸出序號、日期、地名、經度_WGS84、緯度_WGS84、資料來源。若沒有通過名稱、年代、行政區、地物類型及範圍限制的座標，經緯度留空，資料來源寫明查詢來源及未採用原因，不分開建立各 API 欄位。

**結果 worksheet／檔案**：`步驟五_API配對`（16 筆；只保留經緯度及統一資料來源欄；Prompt 已置於 worksheet 頂部）；`江右游日记_二十三日_步驟五_API配對.xlsx`

來源：`work_coord_lookup/add_chgis_steps_sheet.mjs`、`work_coord_lookup/run_six_step_api_search.mjs`、`artifact_work/jiangyou_geocoding/`

## 步驟六：透過地方志推算經緯度

**Prompt**

請用地方志的參照地點、方向、里程及母地物描述推算二十三日尚未定位地點的中心點。將結果限制在行政 polygon／走廊交集，輸出中心經緯度、誤差半徑、參照點、推算方法及證據狀態，並明確標示為 pending/review。

**結果 worksheet／檔案**：`步驟六_地方志推算`（15 筆推算中心點；步驟三直接地方志配對只有 4 筆，其餘 11 筆為原文／母地物／走廊綜合推算；Prompt 已置於 worksheet 頂部）；`江右游日记_二十三日_步驟六_地方志推算.xlsx`

來源：`work_coord_lookup/add_day19_day23_six_step_research.mjs`、`work_coord_lookup/add_day19_day23_supplement.mjs`

## 步驟七：透過原文推算經緯度

**Prompt**

請用二十三日原文明示方向、里數、前後站次序及橋／村／溪流／山路輔助節點，建立有序路徑鏈。將仍未有獨立座標的地名投影到錨點之間的路徑走廊，重新計算中心點及誤差半徑；只表述為約略位置。

**結果 worksheet／檔案**：`步驟七_原文推算`（26 段走廊；Prompt 已置於 worksheet 頂部）；`江右游日记_二十三日_步驟七_原文推算.xlsx`

來源：`work_coord_lookup/add_auxiliary_nodes_corridor_recalc.mjs`

## 步驟八：將經緯度以地圖呈現

**Prompt**

請把二十三日 WGS84 資料輸出為 ArcGIS 可讀的正式點、輔助點、有序線及走廊 polygon。以 point_order／line_order 保留文章次序，按 confidence、coordinate_status 及 gis_decision 分色；彈出資訊顯示原文、來源、方法及誤差半徑。

**結果**：二十三日 ArcGIS map（正式點 15、輔助點 13、有序線 26、走廊 26；不另設 Excel 結果）

來源：`work_coord_lookup/build_arcgis_map_package.mjs`、`artifact_work/build_arcgis_seven_paragraphs.mjs`

## 分步工作簿

`results/jiangyou-23-step-sheets.xlsx` 是本次分拆後的工作簿，只包含七張獨立結果 worksheet；每張 worksheet 都在頂部保存本步驟專屬 Prompt。步驟八按要求只交付 ArcGIS map，不混入 Excel 結果。原有 `results/jiangyou-23-eight-step.xlsx` 仍保留作完整研究工作簿。
