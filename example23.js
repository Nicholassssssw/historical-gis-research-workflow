/*
 * 《江右游日記》二十三日 example
 * Landing page data is kept here so the eight-step teaching page can stay
 * readable while every result remains tied to the workbook sheet and map
 * package produced by the research workflow.
 */
(() => {
  const escapeHtml = (value) => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const passSequence = [
    '贵溪城', '张真人墓', '五面峰', '一线天', '五面峰', '西华', '一线天',
    '西华', '一线天', '小隐岩', '罗塘', '象山', '朝真宫', '象山', '曹山',
    '崇仁', '大霍岭', '龙骨山', '骨岭', '幞头岭', '纯乡', '纯乡村',
    '干冈岭', '巴溪', '朱碧街'
  ];

  const steps = [
    {
      id: 1,
      title: '抽地名',
      prompt: '請只處理《江右游日記》二十三日段落，按出現次序抽取具名地理實體；輸出只保留行程欄等於「經過」的紀錄。輸出序號、日期、地名、類別、細分類、行程及原文；重複出現的地名保留每次紀錄。橋、城門、驛站、碼頭、私人住所、建築內部小物及修辭方向詞，另列入篩除表，不得當作正式地標。',
      sheet: '步驟一_抽地名',
      kind: 'Excel sheet',
      promptSource: 'project：prompts/extract_places.txt；二十三日 example 版',
      stats: ['經過 25 筆', '另有篩除 15 筆', '只含二十三日'],
      detail: '本分步檔只取「江右游日记_經過」二十三日 25 筆；另設「江右游日记_篩除」worksheet，保留二十三日經過的 15 筆 route_auxiliary／excluded，不混入提及。',
      sequence: passSequence,
      download: { href: 'results/江右游日记_二十三日_步驟一_地名抽取.xlsx', label: '下載步驟一獨立 Excel' }
    },
    {
      id: 2,
      title: '配對古代地區與現代地區',
      prompt: '請把二十三日的每筆經過地點配對到 1636 年古代行政層級：承宣布政使司→府（直隸州）→州→縣，再配對現代省級、地級、縣級。保留古今關係、配對狀態、來源及衝突；現代同名不得單獨視為同一地點。',
      sheet: '步驟二_古今地區',
      kind: 'Excel sheet',
      promptSource: 'project：artifact_work/map_jiangyou_historical_modern.py；add_chgis_steps_sheet.mjs',
      stats: ['二十三日 25 筆', '古代隸屬 confirmed 24', '古今關係 probable 15／review 9'],
      detail: '地區層級先作搜尋限制，未把府縣治所中心冒充山峰、洞穴或寺觀座標。',
      download: { href: 'results/江右游日记_二十三日_步驟二_古今地區.xlsx', label: '下載步驟二獨立 Excel' },
      details: [
        '廣信府・貴溪縣 → 江西省・鷹潭市・貴溪市（14 筆）',
        '撫州府・宜黃縣 → 江西省・撫州市・宜黃縣（1 筆）',
        '撫州府・崇仁縣 → 江西省・撫州市・崇仁縣（10 筆）'
      ]
    },
    {
      id: 3,
      title: '配對地方志（有距離資料）',
      prompt: '請在識典古籍閱讀地方志原文，只保留同時提及地名及方向、里數、界址、水系或相鄰關係的句子。輸出地方志書名、版本、原句、參照地點與匹配狀態；配不到時留空並標示未匹配，不可猜測經緯度。',
      sheet: '步驟三_地方志',
      kind: 'Excel sheet',
      promptSource: 'project：shidian_gazetteer_matches.mjs；add_steps3_5_sheets.mjs',
      stats: ['二十三日補查 16 筆', '匹配 4 筆（五面峰兩次＋小隱岩＋巴溪）', '未匹配 12 筆'],
      detail: '「小隱岩」、「巴溪」及兩次出現的「五面峰」已有帶地理資訊的地方志原句；其餘配不到的格位保留空白及待核狀態。',
      download: { href: 'results/江右游日记_二十三日_步驟三_地方志.xlsx', label: '下載步驟三獨立 Excel' },
      details: [
        '小隱岩：記為「在貴溪縣南二里，一名射虎岩」；可作母地物內的候選限制。',
        '巴溪：地方志記載其為旴江水系一段，並列出上游、下游及入界方向。',
        '五面峰（兩次出現）：以《大明一統名勝志》及《乾隆廣信府志》交叉配對，分別提供「縣西南七里」及「溪南五面峰下」等相對位置。'
      ]
    },
    {
      id: 4,
      title: '設定經緯度範圍',
      prompt: '請以古今行政區 polygon、前後已確認錨點、地方志方向與里數設定候選經緯度範圍。保存 bbox、走廊及 WKT；區域級證據只支持搜尋範圍，不得用縣治或 bbox 中心冒充微地名精確座標。',
      sheet: '步驟四_座標範圍',
      kind: 'Excel sheet',
      promptSource: 'project：fetch_modern_admin_boundaries.py；add_steps3_5_sheets.mjs',
      stats: ['二十三日相關行政區 6 個', '原始 WGS84 邊界頂點 35,546', '用作 limitation'],
      detail: '獨立分步檔只保留二十三日古今對照涉及的江西省、鷹潭／貴溪及撫州／宜黃／崇仁行政邊界摘要；完整頂點仍在原始工作簿。',
      download: { href: 'results/江右游日记_二十三日_步驟四_座標範圍.xlsx', label: '下載步驟四獨立 Excel' },
      details: [
        '邊界用途是 limitation：先做 bbox→polygon 篩選，再把地方志或路線走廊與其相交。',
        '近界候選仍保留 buffer 及 pending/review，不把行政邊界當作微地物位置。'
      ]
    },
    {
      id: 5,
      title: '用 Database 及 API 配對地點經緯度',
      prompt: '請在上述範圍內查詢 CHGIS/TGAZ、Wikidata、OpenStreetMap/Nominatim、Amap 及 Google Maps。比較名稱／異名、1636 年代、古今行政區、地物類型及候選點是否落在限制範圍；保留查詢結果、來源及拒收原因，不採用搜尋第一項作為自動答案。',
      sheet: '步驟五_API配對',
      kind: 'Excel sheet',
      promptSource: 'project：add_chgis_steps_sheet.mjs；run_six_step_api_search.mjs',
      stats: ['精簡表 16 筆', '統一資料來源欄', '直接接受 0 筆'],
      detail: '步驟五仍交叉查詢 CHGIS/TGAZ、OSM/Nominatim、Wikidata、Amap 及 Google Maps，但主表只保留序號、日期、地名、經緯度及一個統一「資料來源」欄；Amap／Google Maps只保留公開搜尋連結。',
      download: { href: 'results/江右游日记_二十三日_步驟五_API配對.xlsx', label: '下載步驟五獨立 Excel' },
      details: [
        '精簡主表只保留「序號、日期、地名、經度_WGS84、緯度_WGS84、資料來源」六欄。',
        '資料來源欄合併記錄已查詢的 CHGIS/TGAZ、OSM/Nominatim、Wikidata、Amap 及 Google Maps，以及沒有採用座標的原因。',
        '候選判定必須同時通過名稱、年代、上級行政及地物類型；橋梁、行政節點、近字水系或同名村落不能代替正式山峰／洞穴／遺址。'
      ]
    },
    {
      id: 6,
      title: '透過地方志推算經緯度',
      prompt: '請用地方志的參照地點、方向、里程及母地物描述推算二十三日尚未定位地點的中心點。將結果限制在行政 polygon／走廊交集，輸出中心經緯度、誤差半徑、參照點、推算方法及證據狀態，並明確標示為 pending/review。',
      sheet: '步驟六_地方志推算',
      kind: 'Excel sheet',
      promptSource: 'project：add_day19_day23_six_step_research.mjs；add_day19_day23_supplement.mjs',
      stats: ['推算 15 筆', '直接地方志配對 4 筆', '其餘 11 筆綜合推算'],
      detail: '步驟三只有 4 筆地方志直接配對；本步驟 15 筆是地方志片段、原文方向／里數、母地物及走廊交集的推算中心點，全部仍是 pending/review，並非 15 筆地方志命中。',
      download: { href: 'results/江右游日记_二十三日_步驟六_地方志推算.xlsx', label: '下載步驟六獨立 Excel' },
      details: [
        '相對較窄搜尋範圍：一線天約 900 m、西華約 1,100 m、朱碧街約 1,200 m。',
        '4 筆直接地方志配對是證據來源；其餘 11 筆借助原文距離／方向、母地物及走廊投影，不可當作地方志原句已命中。',
        '所有中心點都保留來源、方法、誤差半徑及 pending/review 判定。'
      ]
    },
    {
      id: 7,
      title: '透過原文推算經緯度',
      prompt: '請用二十三日原文明示方向、里數、前後站次序及橋／村／溪流／山路輔助節點，建立有序路徑鏈。將仍未有獨立座標的地名投影到錨點之間的路徑走廊，重新計算中心點及誤差半徑；只表述為約略位置。',
      sheet: '步驟七_原文推算',
      kind: 'Excel sheet',
      promptSource: 'project：add_auxiliary_nodes_corridor_recalc.mjs',
      stats: ['路徑鏈投影 8 筆', '輔助節點 13 筆', '正式點全部 pending/review'],
      detail: '大霍嶺至巴溪一段主要靠原文次序、里數及輔助節點連成路徑；其相對方向比單點絕對位置更可靠。',
      download: { href: 'results/江右游日记_二十三日_步驟七_原文推算.xlsx', label: '下載步驟七獨立 Excel' },
      details: [
        '正式點與輔助點分層；輔助點標 route_auxiliary + gis_decision=exclude。',
        '中心線用作順序與方向示意，走廊 polygon 用作下一輪搜尋限制，不代表作者一定沿中心線行走。'
      ]
    },
    {
      id: 8,
      title: '將經緯度以地圖呈現',
      prompt: '請把二十三日 WGS84 資料輸出為 ArcGIS 可讀的正式點、輔助點、有序線及走廊 polygon。以 point_order／line_order 保留文章次序，按 confidence、coordinate_status 及 gis_decision 分色；彈出資訊顯示原文、來源、方法及誤差半徑。',
      sheet: 'ArcGIS map（無 Excel worksheet）',
      kind: 'ArcGIS map',
      promptSource: 'project：build_arcgis_map_package.mjs；build_arcgis_seven_paragraphs.mjs',
      stats: ['正式點 15', '輔助點 13', '有序線 26／走廊 26'],
      detail: '二十三日專用資料包可直接加入 ArcGIS；建議先加走廊，再加線、輔助點，最後加正式點。',
      details: [
        '正式點：顯示作者經過的 15 筆待核補查點。',
        '輔助點：橋、村、溪流、山路等 13 筆，只作路徑約束，不混入正式地標層。',
        '所有圖層採 EPSG:4326／WGS84，保留 point_order、line_order、誤差半徑及來源。'
      ],
      download: { href: 'results/jiangyou-23-arcgis-map.zip', label: '下載二十三日 ArcGIS 資料包' },
      map: true
    }
  ];

  function sequenceMarkup(items) {
    return `<div class="example-sequence" aria-label="二十三日經過地點次序">${items.map((item, index) => `<span><b>${index + 1}</b>${escapeHtml(item)}</span>`).join('<i aria-hidden="true">→</i>')}</div>`;
  }

  function detailsMarkup(items) {
    if (!items?.length) return '';
    return `<ul class="example-details">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
  }

  function renderResult(step) {
    const panel = document.querySelector(`#step-${step.id} .result-panel`);
    const textarea = document.getElementById(`prompt-${step.id}`);
    if (!panel) return;
    if (textarea) textarea.value = step.prompt;
    const promptPanel = document.querySelector(`#step-${step.id} .prompt-panel`);
    if (promptPanel && step.promptSource) {
      let source = promptPanel.querySelector('.prompt-source');
      if (!source) {
        source = document.createElement('small');
        source.className = 'prompt-source';
        promptPanel.querySelector('.panel-label')?.after(source);
      }
      source.textContent = step.promptSource;
    }
    panel.className = `result-panel example-result-panel${step.map ? ' map-result-panel' : ''}`;
    const chips = step.stats.map((stat) => `<span class="data-pill">${escapeHtml(stat)}</span>`).join('');
    const sequence = step.sequence ? sequenceMarkup(step.sequence) : '';
    const map = step.map
      ? '<div class="arcgis-map" data-arcgis-map="jiangyou-23" role="application" aria-label="二十三日 ArcGIS 地圖"></div>'
        + '<p class="arcgis-map-note">WGS84 / EPSG:4326。圖層由下而上：再算走廊 → 再算線 → route_auxiliary 輔助點 → 正式再算點；'
        + '點擊任何圖徵可查看座標、判定分類、誤差半徑及證據來源。右上角可開關圖層，左下角為圖例。</p>'
      : '';
    const isExcel = Boolean(step.download && /\.xlsx?$/i.test(step.download.href));
    const download = step.download && !isExcel ? `<a class="download-link" href="${step.download.href}" download>${escapeHtml(step.download.label)} ↗</a>` : '';
    const excelViewer = isExcel ? `<div class="excel-viewer" data-xlsx-src="${escapeHtml(step.download.href)}"><p class="excel-viewer-status">載入 Excel 內容…</p></div>` : '';
    panel.innerHTML = `<div class="panel-label"><span>Result</span><small>${escapeHtml(step.kind)}</small></div><div class="result-summary"><strong>${escapeHtml(step.sheet)}</strong><div class="data-pills">${chips}</div><p>${escapeHtml(step.detail)}</p>${detailsMarkup(step.details)}${sequence}${map}${excelViewer}${download}</div>`;
  }

  const heroDescription = document.querySelector('.hero-copy > p:last-child');
  if (heroDescription) heroDescription.textContent = '以《江右游日記》二十三日為完整 example：由 25 筆經過地名、古今行政配對、地方志及 API 查詢，到 15 個待核座標、13 個輔助節點及 26 段 ArcGIS 路徑走廊。';

  steps.forEach(renderResult);
})();
