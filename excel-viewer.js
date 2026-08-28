/*
 * 內嵌 Excel 檢視器
 *
 * 直接把 results/ 內的 .xlsx 以原有格式顯示在頁面上（合併儲存格、欄寬、
 * 填色、字型及外框都保留），不再提供下載連結。
 *
 * 表格內容由 tools/build_excel_previews.py 預先轉換並存放於
 * results-preview.js，所以本檔不需在瀏覽器解析 .xlsx，
 * 亦可在 file:// 下正常顯示。
 */
(() => {
  const data = window.EXCEL_PREVIEWS;

  function injectSharedCss(css) {
    if (!css || document.getElementById('xlsx-preview-css')) return;
    const style = document.createElement('style');
    style.id = 'xlsx-preview-css';
    style.textContent = css;
    document.head.append(style);
  }

  function fileNameOf(src) {
    return decodeURIComponent(String(src).split('/').pop());
  }

  function renderMessage(container, text, isError) {
    const p = document.createElement('p');
    p.className = isError ? 'excel-viewer-error' : 'excel-viewer-status';
    p.textContent = text;
    container.append(p);
  }

  function renderViewer(container, book, fileName) {
    container.innerHTML = '';

    // 檔名列，取代原本的下載連結
    const caption = document.createElement('p');
    caption.className = 'excel-viewer-file';
    const icon = document.createElement('span');
    icon.className = 'excel-viewer-file-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = 'XLS';
    const nameEl = document.createElement('span');
    nameEl.className = 'excel-viewer-file-name';
    nameEl.textContent = fileName;
    caption.append(icon, nameEl);
    container.append(caption);

    const frame = document.createElement('div');
    frame.className = 'excel-viewer-frame';
    const scroller = document.createElement('div');
    scroller.className = 'excel-viewer-scroll';
    frame.append(scroller);
    container.append(frame);

    const sheets = book.sheets || [];
    if (!sheets.length) {
      renderMessage(container, '此工作簿沒有可顯示的工作表。', false);
      return;
    }

    const tabs = document.createElement('div');
    tabs.className = 'excel-viewer-tabs';
    tabs.setAttribute('role', 'tablist');

    function showSheet(index) {
      scroller.innerHTML = sheets[index].html;
      scroller.scrollTop = 0;
      scroller.scrollLeft = 0;
      [...tabs.children].forEach((btn, i) => {
        btn.classList.toggle('active', i === index);
        btn.setAttribute('aria-selected', i === index ? 'true' : 'false');
      });
    }

    sheets.forEach((sheet, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'excel-viewer-tab';
      button.setAttribute('role', 'tab');
      button.textContent = sheet.name;
      button.addEventListener('click', () => showSheet(index));
      tabs.append(button);
    });

    // 工作表分頁列放在底部，與 Excel 一致
    container.append(tabs);
    showSheet(0);
  }

  function loadViewer(container) {
    const src = container.dataset.xlsxSrc;
    if (!src) return;
    const fileName = fileNameOf(src);

    if (!data || !data.books) {
      container.innerHTML = '';
      renderMessage(container, 'Excel 預覽資料未載入（results-preview.js）。', true);
      return;
    }

    const book = data.books[fileName];
    if (!book) {
      container.innerHTML = '';
      renderMessage(container, `找不到 ${fileName} 的預覽內容。`, true);
      return;
    }

    renderViewer(container, book, fileName);
  }

  function init() {
    if (data) injectSharedCss(data.css);
    document.querySelectorAll('.excel-viewer[data-xlsx-src]').forEach(loadViewer);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
