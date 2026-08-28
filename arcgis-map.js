/*
 * 步驟八：ArcGIS 地圖
 *
 * 用 ArcGIS Maps SDK for JavaScript 4.x 直接在頁面顯示二十三日的四個圖層
 * （走廊 Polygon、路線 Line、route_auxiliary 輔助點、正式再算點），
 * 資料來自 results/arcgis/*.geojson，座標系 WGS84 / EPSG:4326。
 *
 * API key 由 arcgis-config.js 提供；沒有 key 時自動改用 OpenStreetMap 底圖。
 */
(() => {
  const SDK_VERSION = '4.30';
  const SDK_CSS = `https://js.arcgis.com/${SDK_VERSION}/esri/themes/light/main.css`;
  const SDK_JS = `https://js.arcgis.com/${SDK_VERSION}/`;

  // 四個圖層：由下而上疊放，與資料包 README 的圖層次序一致
  const LAYERS = [
    {
      key: 'corridors',
      url: 'results/arcgis/corridors.geojson',
      title: '再算走廊（搜尋範圍）',
      renderer: {
        type: 'simple',
        symbol: {
          type: 'simple-fill',
          color: [156, 50, 32, 0.10],
          outline: { color: [156, 50, 32, 0.55], width: 0.8, style: 'dash' },
        },
      },
      popup: {
        title: '走廊 {corridor_order}｜{from_name} → {to_name}',
        fields: [
          ['segment', '路段'], ['distance_m', '距離 (m)'],
          ['corridor_width_m', '走廊寬 (m)'], ['bearing_deg', '方位角 (°)'],
          ['coordinate_status', '座標狀態'], ['gis_decision', 'GIS 判定'],
          ['constraint_basis', '限制依據'],
        ],
      },
      visible: true,
    },
    {
      key: 'lines',
      url: 'results/arcgis/lines.geojson',
      title: '再算線（方向示意）',
      renderer: {
        type: 'simple',
        symbol: {
          type: 'simple-line',
          color: [71, 41, 26, 0.85],
          width: 1.6,
        },
      },
      popup: {
        title: '線段 {line_order}｜{from_name} → {to_name}',
        fields: [
          ['segment', '路段'], ['distance_m', '距離 (m)'],
          ['bearing_deg', '方位角 (°)'], ['from_role', '起點類型'],
          ['to_role', '終點類型'], ['coordinate_status', '座標狀態'],
          ['gis_decision', 'GIS 判定'], ['direction_note', '方向說明'],
        ],
      },
      visible: true,
    },
    {
      key: 'auxiliary',
      url: 'results/arcgis/auxiliary-points.geojson',
      title: 'route_auxiliary 輔助點（不作地標）',
      renderer: {
        type: 'simple',
        symbol: {
          type: 'simple-marker',
          style: 'diamond',
          size: 7,
          color: [147, 112, 47, 0.9],
          outline: { color: [255, 246, 223, 0.95], width: 1 },
        },
      },
      popup: {
        title: '輔助點 {aux_id}｜{name}',
        fields: [
          ['aux_type', '類型'], ['route_role', '路徑角色'], ['segment', '路段'],
          ['coordinate_status', '座標狀態'], ['confidence', '信心'],
          ['record_level', '紀錄層級'], ['gis_decision', 'GIS 判定'],
          ['note', '註記'], ['source_1', '來源一'], ['source_2', '來源二'],
        ],
      },
      visible: true,
    },
    {
      key: 'formal',
      url: 'results/arcgis/formal-points.geojson',
      title: '正式再算點（待核補查）',
      renderer: {
        type: 'simple',
        symbol: {
          type: 'simple-marker',
          style: 'circle',
          size: 10,
          color: [156, 50, 32, 0.95],
          outline: { color: [255, 246, 223, 1], width: 1.8 },
        },
      },
      // 以行程次序標示正式點，方便閱讀路線
      labelingInfo: [{
        labelExpressionInfo: { expression: '$feature.point_order' },
        symbol: {
          type: 'text',
          color: [71, 41, 26, 1],
          haloColor: [255, 246, 223, 0.95],
          haloSize: 1.4,
          font: { size: 9, weight: 'bold' },
        },
        labelPlacement: 'above-center',
      }],
      popup: {
        title: '{point_order}．{name}',
        fields: [
          ['segment', '路段'], ['lon_wgs84', '經度 WGS84'], ['lat_wgs84', '緯度 WGS84'],
          ['radius_m', '誤差半徑 (m)'], ['confidence', '信心'],
          ['coordinate_status', '座標狀態'], ['gis_decision', 'GIS 判定'],
          ['auxiliary_nodes', '輔助節點'], ['note', '註記'],
          ['source_1', '來源一'], ['source_2', '來源二'],
        ],
      },
      visible: true,
    },
  ];

  // 全部圖層的整體範圍（由 results/arcgis 的座標算出）
  const EXTENT = { xmin: 115.9683, ymin: 27.4881, xmax: 117.2106, ymax: 28.2765 };

  let sdkPromise = null;

  function loadSdk() {
    if (sdkPromise) return sdkPromise;
    sdkPromise = new Promise((resolve, reject) => {
      if (window.require && window.require.toUrl) return resolve(window.require);
      const css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = SDK_CSS;
      document.head.append(css);

      const script = document.createElement('script');
      script.src = SDK_JS;
      script.onload = () => resolve(window.require);
      script.onerror = () => reject(new Error('無法載入 ArcGIS Maps SDK'));
      document.head.append(script);
    });
    return sdkPromise;
  }

  function popupTemplate(spec) {
    return {
      title: spec.title,
      content: [{
        type: 'fields',
        fieldInfos: spec.fields.map(([name, label]) => ({ fieldName: name, label })),
      }],
    };
  }

  function showError(container, message) {
    container.innerHTML = '';
    const box = document.createElement('div');
    box.className = 'arcgis-map-error';
    box.innerHTML = `<strong>地圖未能載入</strong><p></p>`;
    box.querySelector('p').textContent = message;
    container.append(box);
  }

  function build(container) {
    const status = document.createElement('div');
    status.className = 'arcgis-map-status';
    status.textContent = '載入 ArcGIS 地圖…';
    container.append(status);

    loadSdk().then((require) => {
      require([
        'esri/config', 'esri/Map', 'esri/views/MapView',
        'esri/layers/GeoJSONLayer', 'esri/widgets/Legend',
        'esri/widgets/LayerList', 'esri/widgets/Expand',
        'esri/widgets/ScaleBar', 'esri/geometry/Extent',
      ], (esriConfig, Map, MapView, GeoJSONLayer, Legend, LayerList, Expand, ScaleBar, Extent) => {
        const key = (window.ARCGIS_CONFIG && window.ARCGIS_CONFIG.apiKey) || '';
        if (key) esriConfig.apiKey = key;

        const layers = LAYERS.map((cfg) => new GeoJSONLayer({
          url: cfg.url,
          title: cfg.title,
          copyright: '《江右游日記》二十三日研究資料',
          renderer: cfg.renderer,
          popupTemplate: popupTemplate(cfg.popup),
          visible: cfg.visible !== false,
          ...(cfg.labelingInfo ? { labelingInfo: cfg.labelingInfo } : {}),
        }));

        const map = new Map({
          // 有 key 時用 Esri 地形底圖，否則退回 OpenStreetMap
          basemap: key ? 'arcgis/topographic' : 'osm',
          layers,
        });

        status.remove();
        const view = new MapView({
          container,
          map,
          extent: new Extent({ ...EXTENT, spatialReference: { wkid: 4326 } }),
          popup: { dockEnabled: false, defaultPopupTemplateEnabled: true },
        });

        view.when(() => {
          view.ui.add(new Expand({
            view,
            content: new Legend({ view }),
            expanded: false,
            expandTooltip: '圖例',
          }), 'bottom-left');
          view.ui.add(new Expand({
            view,
            content: new LayerList({ view }),
            expanded: false,
            expandTooltip: '圖層',
          }), 'top-right');
          view.ui.add(new ScaleBar({ view, unit: 'metric' }), 'bottom-right');
          return view.goTo(new Extent({ ...EXTENT, spatialReference: { wkid: 4326 } }).expand(1.15));
        }).catch((error) => {
          showError(container, error && error.message ? error.message : String(error));
        });
      }, (error) => {
        showError(container, error && error.message ? error.message : '模組載入失敗');
      });
    }).catch((error) => {
      showError(container, `${error.message}。請確認可連線至 js.arcgis.com。`);
    });
  }

  function init() {
    const containers = document.querySelectorAll('.arcgis-map[data-arcgis-map]');
    if (!containers.length) return;
    containers.forEach(build);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
