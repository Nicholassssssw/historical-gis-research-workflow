/*
 * 教學內容集中設定區
 * 之後提供正式內容時，只需要替換每一步的 intro、question、success 和 prompt。
 * correct: true 代表正確選項；type 可使用 single 或 multiple。
 */
window.TEACHING_STEPS = [
  {
    numeral: '壹',
    stepLabel: '步驟一',
    title: '抽地名',
    intro: '先判斷文本來源時期，再辨識文本中的具名地理實體。每個候選地名都要保留日期、原句，以及作者實際經過或僅作提及的判斷。\n\n以下為示範內容；你提供正式教學文字後，可直接替換。',
    question: {
      type: 'single',
      prompt: '抽取地名時，應優先採用哪一種判斷方法？',
      options: [
        { label: '只按照模型記憶補充資料', correct: false },
        { label: '以文本原句及可追溯證據判斷', correct: true },
        { label: '所有帶方向詞的名詞都當成地名', correct: false }
      ]
    },
    success: '正確。文本證據是第一層依據；模型不應自行補充原文沒有提供的異名、府縣或經緯度。',
    prompt: `按出現次序抽取文章內的地名放入excel，欄位如下：序號、日期、地名、類別（行政區、部落、村莊）、細分類、行程（經過、提及）、原文；重複出現的地名保留每次紀錄；將行程為經過及行程為提及分開兩張sheet。

以下的地名請放入另建的篩除sheet：
1. 橋梁；
2. 城門和普通城關，例如東門、西門、南門；
3. 驛站、鋪舍及一般道路節點；
4. 小型碼頭、馬頭、渡口、埠、市場及臨時泊船點；
5. 私人住宅、人物住所、別墅、山莊、私人園圃；
6. 建築群內部的單一殿堂、亭、龕、房舍；
7. 只表示方向、比較、修辭或典故而不能指向實際位置的詞。

上述項目若有助復原行程，標為 route_auxiliary，但 gis_decision 必須為 exclude；不得猜測其經緯度。不是具名地理實體者標為 excluded。小村莊、寺祠和洞穴不能只按名稱後綴保留，必須檢查其專名穩定性、外部對應、唯一定位可能、地理文化意義，以及是否只是姓氏住宅、小祠、小坳或臨時停泊處。重要但證據不足者標為 pending/review；尺度過小且無法定位者標為 exclude。`,
    result: 'Excel worksheets：步驟一_抽地名（經過 25 筆）＋江右游日记_篩除（經過篩除 15 筆）'
  },
  {
    numeral: '貳',
    stepLabel: '步驟二',
    title: '配對古代地區與現代地區',
    intro: '古代行政區與現代行政區不可直接視為同一空間。配對時要保留兩套欄位，並清楚記錄對應證據及不確定性。',
    question: {
      type: 'multiple',
      prompt: '哪些資料適合用作古今地區配對證據？（可多選）',
      options: [
        { label: '原文明示的府、州、縣或行政界線', correct: true },
        { label: '與旅行年代相符的歷史行政區資料', correct: true },
        { label: '只因現代同名便直接視為同一地點', correct: false },
        { label: '前後已確認行程地點形成的路線', correct: true }
      ]
    },
    success: '正確。歷史歸屬、年代與行程路線需要互相印證；現代同名只能作候選，不能單獨完成配對。',
    prompt: '將行程為經過的地點歸納出古代的地區：次序由大區域至小（承宣佈政使司>府（直隸州）>州>縣）；再進行古今對比，配對古代同現代地名。',
    result: 'Excel worksheet：步驟二_古今地區（25 筆）'
  },
  {
    numeral: '叁',
    stepLabel: '步驟三',
    title: '配對地方志（有距離資料）',
    intro: '地方志的價值在於提供鄉里、方向、里程與相鄰地點。搜尋結果要保留原志文字、卷次與版本，避免把後人轉引當成原始證據。',
    question: {
      type: 'multiple',
      prompt: '地方志配對結果至少應保存哪些資料？（可多選）',
      options: [
        { label: '地方志名稱、卷次與版本', correct: true },
        { label: '相關原句與方向／里程描述', correct: true },
        { label: '研究者沒有來源的直覺判斷', correct: false },
        { label: '被描述地點與參照地點', correct: true }
      ]
    },
    success: '正確。原句、版本、參照點與距離資料共同構成可重查的證據鏈。',
    prompt: '請在識典古籍閱讀地方志原文，只保留同時提及地名及方向、里數、界址、水系或相鄰關係的句子。輸出地方志書名、版本、原句、參照地點與匹配狀態；配不到時留空並標示未匹配，不可猜測經緯度。https://www.shidianguji.com/',
    result: 'Excel worksheet：步驟三_地方志（16 筆；已補入五面峰 2 筆雙地方志配對）'
  },
  {
    numeral: '肆',
    stepLabel: '步驟四',
    title: '設定經緯度範圍',
    intro: '定位前先限定搜尋範圍。範圍可以來自歷史行政區邊界、前後站點、方向與里程，但不能用縣治座標冒充具體地物位置。',
    question: {
      type: 'single',
      prompt: '資料只證明某寺位於縣境內，應如何處理？',
      options: [
        { label: '直接使用縣治座標作寺廟座標', correct: false },
        { label: '標示縣境範圍並保留待核狀態', correct: true },
        { label: '隨機選取縣內一個中心點', correct: false }
      ]
    },
    success: '正確。區域級證據只能支持搜尋範圍，不能轉化成虛假的精確座標。',
    prompt: '請以古今行政區 polygon、前後已確認錨點、地方志方向與里數設定候選經緯度範圍。保存 bbox、走廊及 WKT；區域級證據只支持搜尋範圍，不得用縣治或 bbox 中心冒充微地名精確座標。',
    result: 'Excel worksheet：步驟四_座標範圍（34 個行政區摘要）'
  },
  {
    numeral: '伍',
    stepLabel: '步驟五',
    title: '用 Database 及 API 配對地點經緯度',
    intro: '在既定範圍內查詢多個地名來源，應同時比較名稱、年代、行政區與空間位置，並保留每個候選的資料來源。',
    question: {
      type: 'multiple',
      prompt: '評估資料庫候選座標時應比較哪些因素？（可多選）',
      options: [
        { label: '地名及異名', correct: true },
        { label: '歷史／現代行政區', correct: true },
        { label: '候選座標是否落在設定範圍', correct: true },
        { label: '只選搜尋結果排第一的項目', correct: false }
      ]
    },
    success: '正確。搜尋排序不是歷史地理證據；候選必須經過名稱、區域及空間範圍的綜合比較。',
    prompt: '請在指定經緯度範圍內以 CHGIS/TGAZ、Wikidata、OpenStreetMap/Nominatim、Amap 及 Google Maps 交叉核查候選；只輸出序號、日期、地名、經度_WGS84、緯度_WGS84、資料來源。若沒有通過名稱、年代、行政區、地物類型及範圍限制的座標，經緯度留空，資料來源寫明查詢來源及未採用原因，不分開建立各 API 欄位。',
    result: 'Excel worksheet：步驟五_API配對（16 筆；只保留經緯度及統一資料來源）'
  },
  {
    numeral: '陸',
    stepLabel: '步驟六',
    title: '透過地方志推算經緯度',
    intro: '當資料庫沒有直接座標，而地方志提供可靠方向與里程，可從已確認參照點推算位置；結果必須附上推算方法與誤差範圍。',
    question: {
      type: 'single',
      prompt: '地方志推算所得座標應如何標示？',
      options: [
        { label: '標示為唯一且完全準確的位置', correct: false },
        { label: '標示為推算位置並附方法與誤差', correct: true },
        { label: '刪除所有未能直接配對的地名', correct: false }
      ]
    },
    success: '正確。推算結果可以有研究價值，但必須與已確認座標分開，並保留可重算的參數。',
    prompt: '請用地方志中的參照地點、方向與里程推算候選地名的可能經緯度，列出參照座標、換算方法、推算結果及誤差範圍，並明確標示為推算位置。',
    result: 'Excel worksheet：步驟六_地方志推算（15 筆；直接地方志配對 4 筆，其餘為綜合推算）'
  },
  {
    numeral: '柒',
    stepLabel: '步驟七',
    title: '透過原文推算經緯度',
    intro: '原文可提供行程先後、方向、距離與停宿節點。不過文本出現次序不等於地理鄰近，只有明確空間證據才適合用作推算。',
    question: {
      type: 'multiple',
      prompt: '哪些原文線索可支持相對位置推算？（可多選）',
      options: [
        { label: '明示方向', correct: true },
        { label: '明示里程或行走時間', correct: true },
        { label: '已確認的上一站及下一站', correct: true },
        { label: '地名在文章中較早出現', correct: false }
      ]
    },
    success: '正確。推算需要方向、距離或可靠錨點；純粹文本先後只能證明敘事順序。',
    prompt: '請用原文明示的方向、里程／時間及前後已確認行程地點，推算尚未定位地名的相對位置。純粹文本先後不得表述為地理鄰近；證據不足時維持資料不足。',
    result: 'Excel worksheet：步驟七_原文推算（26 段走廊）'
  },
  {
    numeral: '捌',
    stepLabel: '步驟八',
    title: '將經緯度以地圖呈現',
    intro: '製圖是證據整理的最後階段。確認座標、推算座標及資料不足項目應以不同視覺語言呈現，彈出資訊亦要保留來源與原句。',
    question: {
      type: 'multiple',
      prompt: 'ArcGIS 地圖應保留哪些可核查資訊？（可多選）',
      options: [
        { label: '地名與經緯度', correct: true },
        { label: '座標資料來源及判定分類', correct: true },
        { label: '文本證據原句', correct: true },
        { label: '把所有推算位置標成已確認', correct: false }
      ]
    },
    success: '正確。地圖不只顯示點位，也要讓使用者理解每個位置的證據、來源及不確定性。',
    prompt: '請把已確認及推算經緯度匯入 ArcGIS，以不同符號區分座標判定。每個地點的彈出資訊須顯示地名、經緯度、資料來源、判定分類及證據原句；不要把推算路線描述為已證實的歷史道路。',
    result: 'ArcGIS map：正式點 15、輔助點 13、有序線 26、走廊 26'
  }
];
