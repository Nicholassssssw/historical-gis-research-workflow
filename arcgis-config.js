/*
 * ArcGIS 設定（由 .env 的 ARCGIS_API_KEY 產生）
 *
 * 注意：本檔會隨網站公開發佈，key 對任何訪客可見。這是 ArcGIS
 * client-side key 的正常用法，但請務必在 ArcGIS Location Platform
 * 主控台為此 key 設定 referrer 限制（只允許本站網域），並只授予
 * 所需的 basemap 權限，以免額度被他人使用。
 *
 * key 留空時，地圖會自動改用 OpenStreetMap 底圖，其餘圖層照常顯示。
 */
window.ARCGIS_CONFIG = {
  apiKey: "AAPTab_2otRUacpwwQO4ORHSXmw..hKwhY-lfZs9LOqldY9MYuwyeE6JaMjzzXn_pZwJl6uSNwfSu2y7WEBR4ZkVwpDpL9qcRBI2D6iSj9vfi1mbvn-OrqZa9bqo1jXZzebiUHKrYTQIL7zYQbTWTxAXFGbh7szUNldZn15VpRzo1dWt7Rq7SN4Em6chcOQt62E79ixTM7XoAuvtANBIgsunVi1zbXB1NPhhpJiJJ38R8_Ks309ggWlsR5ECLPyGaMY6lEQRn-_RwrA..AT1_ZIEQdut2"
};
