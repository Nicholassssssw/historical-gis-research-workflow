#!/usr/bin/env python3
"""
把 results/ 內的 .xlsx 轉成忠於原檔的 HTML 預覽，輸出到 results-preview.js。

保留：合併儲存格、欄寬、字型（粗體／大小／顏色）、填色、外框、
對齊與換行，令網頁上的表格與 Excel 打開時一致。

用法：  python3 tools/build_excel_previews.py
"""

import json
import os
import glob
import datetime
import openpyxl
from openpyxl.utils import get_column_letter

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RESULTS_DIR = os.path.join(REPO, 'results')
OUTPUT = os.path.join(REPO, 'results-preview.js')

# 只輸出八步流程用到的分步檔
INCLUDE_PREFIX = '江右游日记_二十三日_步驟'


def esc(text):
    return (str(text)
            .replace('&', '&amp;')
            .replace('<', '&lt;')
            .replace('>', '&gt;')
            .replace('"', '&quot;'))


def argb_to_css(color):
    """openpyxl 顏色 -> #rrggbb，無法解析時回傳 None。"""
    if color is None:
        return None
    rgb = getattr(color, 'rgb', None)
    if not isinstance(rgb, str):
        return None
    if len(rgb) == 8:          # AARRGGBB
        alpha, rgb = rgb[:2], rgb[2:]
        if alpha == '00':
            return None
    if len(rgb) != 6:
        return None
    return '#' + rgb.lower()


def fill_color(cell):
    fill = cell.fill
    if fill is None or fill.fill_type in (None, 'none'):
        return None
    return argb_to_css(fill.start_color)


BORDER_WIDTH = {
    'hair': '1px', 'thin': '1px', 'medium': '2px', 'thick': '3px',
    'double': '3px', 'dotted': '1px', 'dashed': '1px',
}


def border_css(cell):
    out = []
    b = cell.border
    if b is None:
        return out
    for side_name, css_name in (('top', 'top'), ('bottom', 'bottom'),
                                ('left', 'left'), ('right', 'right')):
        side = getattr(b, side_name, None)
        if side is None or not side.style:
            continue
        style = 'dashed' if side.style in ('dashed', 'dotted') else (
            'double' if side.style == 'double' else 'solid')
        width = BORDER_WIDTH.get(side.style, '1px')
        color = argb_to_css(side.color) or '#c8c8c8'
        out.append(f'border-{css_name}:{width} {style} {color}')
    return out


def cell_style(cell):
    styles = []
    font = cell.font
    if font is not None:
        if font.bold:
            styles.append('font-weight:700')
        if font.italic:
            styles.append('font-style:italic')
        if font.sz:
            # Excel pt -> px，稍為放大以配合網頁閱讀
            styles.append(f'font-size:{round(float(font.sz) * 1.22, 1)}px')
        color = argb_to_css(font.color)
        if color:
            styles.append(f'color:{color}')
    bg = fill_color(cell)
    if bg:
        styles.append(f'background:{bg}')
    align = cell.alignment
    if align is not None:
        if align.horizontal:
            styles.append(f'text-align:{align.horizontal}')
        if align.vertical:
            vmap = {'center': 'middle', 'top': 'top', 'bottom': 'bottom'}
            styles.append(f'vertical-align:{vmap.get(align.vertical, "middle")}')
        if align.wrap_text:
            styles.append('white-space:pre-wrap')
    styles.extend(border_css(cell))
    return ';'.join(styles)


def format_value(cell):
    v = cell.value
    if v is None:
        return ''
    if isinstance(v, bool):
        return 'TRUE' if v else 'FALSE'
    if isinstance(v, (datetime.datetime, datetime.date)):
        return v.strftime('%Y-%m-%d')
    if isinstance(v, float):
        # 避免 28.273321593073140000 這類長尾
        if v == int(v) and abs(v) < 1e15:
            return str(int(v))
        return f'{v:.10g}'
    return str(v)


class StyleRegistry:
    """把重複的儲存格樣式收斂成 CSS class，大幅縮減輸出體積。"""

    def __init__(self):
        self._map = {}

    def class_for(self, style):
        if not style:
            return None
        if style not in self._map:
            self._map[style] = f'x{len(self._map)}'
        return self._map[style]

    def css(self):
        return ''.join(f'.xlsx-sheet .{name}{{{style}}}'
                       for style, name in self._map.items())


def sheet_to_html(ws, registry):
    # 合併儲存格：記錄錨點與被覆蓋格
    spans = {}
    covered = set()
    for rng in ws.merged_cells.ranges:
        spans[(rng.min_row, rng.min_col)] = (
            rng.max_row - rng.min_row + 1,
            rng.max_col - rng.min_col + 1,
        )
        for r in range(rng.min_row, rng.max_row + 1):
            for c in range(rng.min_col, rng.max_col + 1):
                if (r, c) != (rng.min_row, rng.min_col):
                    covered.add((r, c))

    max_row, max_col = ws.max_row, ws.max_column

    # 欄寬（Excel 字元寬 -> px）
    cols = []
    total_px = 0
    for c in range(1, max_col + 1):
        dim = ws.column_dimensions.get(get_column_letter(c))
        width = getattr(dim, 'width', None) if dim else None
        px = int(round((width or 9) * 7.2))
        px = max(56, min(px, 340))
        total_px += px
        cols.append(f'<col style="width:{px}px">')

    rows = []
    for r in range(1, max_row + 1):
        # 略過完全空白且無填色的尾列
        cells_html = []
        for c in range(1, max_col + 1):
            if (r, c) in covered:
                continue
            cell = ws.cell(r, c)
            rowspan, colspan = spans.get((r, c), (1, 1))
            attrs = ''
            if rowspan > 1:
                attrs += f' rowspan="{rowspan}"'
            if colspan > 1:
                attrs += f' colspan="{colspan}"'
            klass = registry.class_for(cell_style(cell))
            if klass:
                attrs += f' class="{klass}"'
            cells_html.append(f'<td{attrs}>{esc(format_value(cell))}</td>')
        if cells_html:
            rows.append('<tr>' + ''.join(cells_html) + '</tr>')

    # 明確指定總寬，令 table-layout:fixed 依欄寬排版並在窄容器內橫向捲動，
    # 而不是被壓縮到容器寬度。
    return (f'<table class="xlsx-sheet" style="width:{total_px}px"><colgroup>'
            + ''.join(cols) + '</colgroup><tbody>' + ''.join(rows)
            + '</tbody></table>')


def main():
    registry = StyleRegistry()
    books = {}
    files = sorted(glob.glob(os.path.join(RESULTS_DIR, '*.xlsx')))
    for path in files:
        base = os.path.basename(path)
        if not base.startswith(INCLUDE_PREFIX):
            continue
        wb = openpyxl.load_workbook(path, data_only=True)
        sheets = []
        for name in wb.sheetnames:
            sheets.append({'name': name, 'html': sheet_to_html(wb[name], registry)})
        books[base] = {'sheets': sheets}
        total = sum(len(s['html']) for s in sheets)
        print(f'{base}: {len(sheets)} sheet(s), {total:,} bytes')

    payload = json.dumps({'css': registry.css(), 'books': books},
                         ensure_ascii=False, separators=(',', ':'))
    with open(OUTPUT, 'w', encoding='utf-8') as fh:
        fh.write('/*\n')
        fh.write(' * 由 tools/build_excel_previews.py 自動產生，請勿手改。\n')
        fh.write(' * 內容為 results/ 各步驟 .xlsx 的忠實 HTML 版本（保留合併格、\n')
        fh.write(' * 欄寬、填色、字型及外框），供 index.html 直接內嵌顯示。\n')
        fh.write(' */\n')
        fh.write('window.EXCEL_PREVIEWS = ' + payload + ';\n')

    size = os.path.getsize(OUTPUT)
    print(f'\n-> {os.path.relpath(OUTPUT, REPO)} ({size:,} bytes, '
          f'{len(books)} workbooks, {len(registry._map)} styles)')


if __name__ == '__main__':
    main()
