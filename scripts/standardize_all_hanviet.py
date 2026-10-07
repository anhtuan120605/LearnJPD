# -*- coding: utf-8 -*-
"""
Chuẩn hóa toàn diện 100% âm Hán Việt (hanviet) trên toàn bộ hệ thống:
1. Minna no Nihongo (Bài 1 - 50) trong src/data/minna_lessons.json
2. JLPT N5 - N1 trong src/data/vocab/*.json
3. Dữ liệu Kanji trong src/data/kanji/*.json

Loại bỏ triệt để mọi lỗi âm Hán Việt cổ/sai lệch:
- THÁI -> ĐẠI (Đại học, Osaka = Đại Phản)
- BÔN -> BẢN (Nhật Bản, Bản Thân)
- CỐI -> HỘI (Hội xã, Xã viên)
- SANH -> SINH (Tiên sinh, Học sinh)
- XUÝ -> XUẤT (Xuất phát, Xuất khẩu)
- GIÀM -> THÀNH (Lâu đài, Thành trì, Osaka Castle = Đại Phản Thành)
- HU -> HƯU (Nghỉ ngơi, Hưu nhật)
- BƯU -> BẤT (Bất tiện, Bất an)
- MẶC -> VẠN (Vạn lý trường thành)
- GIAO -> GIÁO (Giáo viên, Giáo sư)
- THỐT -> TỐT (Tốt nghiệp)
"""

import json
import os
import glob
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(os.path.dirname(__file__))

from missing_kanji_hv import MISSING_KANJI_HV

# 1. Base lookup from kanji/*.json
kanji_to_hv = {}
for fp in sorted(glob.glob(os.path.join(WORKSPACE_ROOT, 'src/data/kanji/*.json'))):
    with open(fp, 'r', encoding='utf-8') as f:
        kd = json.load(f)
    for item in kd:
        k = item.get('kanji')
        hv = item.get('hanviet', '').strip().upper()
        if k and hv:
            kanji_to_hv[k] = hv

# 2. Authoritative Corrections
CORRECTIONS = {
    '大': 'ĐẠI',
    '本': 'BẢN',
    '会': 'HỘI',
    '生': 'SINH',
    '出': 'XUẤT',
    '城': 'THÀNH',
    '休': 'HƯU',
    '卒': 'TỐT',
    '教': 'GIÁO',
    '万': 'VẠN',
    '不': 'BẤT',
    '何': 'HÀ',
    '行': 'HÀNH',
    '重': 'TRỌNG',
    '阪': 'PHẢN',
    '場': 'TRƯỜNG',
    '合': 'HỢP',
    '体': 'THỂ',
    '上': 'THƯỢNG',
    '下': 'HẠ',
    '主': 'CHỦ',
    '乗': 'THỪA',
    '九': 'CỬU',
    '定': 'ĐỊNH',
    '見': 'KIẾN',
    '言': 'NGÔN',
    '語': 'NGỮ',
    '読': 'ĐỘC',
    '道': 'ĐẠO',
    '近': 'CẬN',
    '度': 'ĐỘ',
    '方': 'PHƯƠNG',
    '思': 'TƯ',
    '意': 'Ý',
    '着': 'TRƯỚC',
    '返': 'PHẢN',
    '引': 'DẪN',
    '長': 'TRƯỜNG',
    '校': 'HIỆU',
    '時': 'THỜI',
    '正': 'CHÍNH',
    '水': 'THỦY',
    '火': 'HỎA',
    '理': 'LÝ',
    '画': 'HỌA',
    '直': 'TRỰC',
    '結': 'KẾT',
    '肉': 'NHỤC',
    '能': 'NĂNG',
    '苦': 'KHỔ',
    '角': 'GIÁC',
    '説': 'THUYẾT',
    '論': 'LUẬN',
    '費': 'PHÍ',
    '質': 'CHẤT',
    '赤': 'XÍCH',
    '起': 'KHỞI',
    '足': 'TÚC',
    '軽': 'KHINH',
    '遠': 'VIỄN',
    '量': 'LƯỢNG',
    '難': 'NAN',
    '雨': 'VŨ',
    '飲': 'ẨM',
    '温': 'ÔN',
    '洗': 'TẨY',
    '治': 'TRỊ',
    '母': 'MẪU',
    '止': 'CHỈ',
    '有': 'HỮU',
    '暖': 'NOÃN',
    '政': 'CHÍNH',
    '料': 'LIỆU',
    '払': 'PHẤT',
    '弟': 'ĐỆ',
    '後': 'HẬU',
    '広': 'QUẢNG',
    '山': 'SƠN',
    '左': 'TẢ',
    '宿': 'TÚC',
    '少': 'THIỂU',
    '守': 'THỦ',
    '子': 'TỬ',
    '始': 'THỦY',
    '好': 'HẢO',
    '女': 'NỮ',
    '夏': 'HẠ',
    '売': 'MÃI',
    '堂': 'ĐƯỜNG',
    '喜': 'HỶ',
    '呼': 'HÔ',
    '吹': 'XÚY',
    '反': 'PHẢN',
    '南': 'NAM',
    '化': 'HÓA',
    '勝': 'THẮNG',
    '務': 'VỤ',
    '円': 'YÊN',
    '共': 'CỘNG',
    '信': 'TÍN',
    '使': 'SỬ',
    '作': 'TÁC',
    '令': 'LỆNH',
    '込': 'NHẬP',
    '枠': 'KHUNG',
    '峠': 'ĐÈO',
    '畑': 'ĐIỀN',
    '匂': 'MÙI',
    '咲': 'TIẾU',
    '橋': 'KIỀU',
    '誰': 'THÙY',
    '内': 'NỘI',
    '拾': 'THẬP',
    '援': 'VIỆN',
    '族': 'TỘC',
    '殺': 'SÁT',
    '準': 'CHUẨN',
    '百': 'BÁCH',
    '矢': 'THỈ',
    '示': 'THỊ',
    '祈': 'KỲ',
    '祝': 'CHÚC',
    '税': 'THUẾ',
}
kanji_to_hv.update(CORRECTIONS)
kanji_to_hv.update(MISSING_KANJI_HV)

def extract_kanjis(text):
    if not text:
        return []
    # Strip brackets like ［大阪に～］ -> keep only kanji in word
    clean = re.sub(r'[\［\］\[\]\(\)（）\～~]', '', text)
    return re.findall(r'[\u4e00-\u9faf\u3400-\u4dbf]', clean)

def get_word_hanviet(kanji_text, current_hv=""):
    if not kanji_text:
        return current_hv
    kanjis = extract_kanjis(kanji_text)
    if not kanjis:
        return ""
    hv_sylls = [kanji_to_hv.get(k) for k in kanjis]
    if all(hv_sylls):
        return " ".join(hv_sylls)
    return current_hv

print(f"Master kanji lookup ready with {len(kanji_to_hv)} kanji.")

# --- 1. Fix minna_lessons.json ---
minna_path = os.path.join(WORKSPACE_ROOT, 'src/data/minna_lessons.json')
with open(minna_path, 'r', encoding='utf-8') as f:
    minna = json.load(f)

minna_updated = 0
for l in minna:
    for w in l.get('words', []):
        k = w.get('kanji', '')
        old_hv = w.get('hanviet', '')
        new_hv = get_word_hanviet(k, old_hv)
        if new_hv and new_hv != old_hv:
            w['hanviet'] = new_hv
            minna_updated += 1

with open(minna_path, 'w', encoding='utf-8') as f:
    json.dump(minna, f, ensure_ascii=False, indent=2)

print(f"Updated {minna_updated} words in minna_lessons.json.")

# --- 2. Fix vocab/*.json ---
vocab_updated_total = 0
for fp in sorted(glob.glob(os.path.join(WORKSPACE_ROOT, 'src/data/vocab/*.json'))):
    with open(fp, 'r', encoding='utf-8') as f:
        data = json.load(f)
    v_updated = 0
    for l in data:
        for w in l.get('words', []):
            k = w.get('kanji', '')
            old_hv = w.get('hanviet', '')
            new_hv = get_word_hanviet(k, old_hv)
            if new_hv and new_hv != old_hv:
                w['hanviet'] = new_hv
                v_updated += 1
    with open(fp, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    vocab_updated_total += v_updated
    print(f"Updated {v_updated} words in {os.path.basename(fp)}.")

# --- 3. Fix kanji/*.json top-level and examples ---
kanji_updated_total = 0
for fp in sorted(glob.glob(os.path.join(WORKSPACE_ROOT, 'src/data/kanji/*.json'))):
    with open(fp, 'r', encoding='utf-8') as f:
        data = json.load(f)
    k_updated = 0
    for item in data:
        k = item.get('kanji')
        # Check top-level hanviet
        if k in kanji_to_hv:
            std_hv = kanji_to_hv[k]
            if item.get('hanviet') != std_hv:
                item['hanviet'] = std_hv
                k_updated += 1
        # Check examples
        for ex in item.get('examples', []):
            ex_word = ex.get('word', '')
            old_ex_hv = ex.get('hanviet', '')
            new_ex_hv = get_word_hanviet(ex_word, old_ex_hv)
            if new_ex_hv and new_ex_hv != old_ex_hv:
                ex['hanviet'] = new_ex_hv
                k_updated += 1
    with open(fp, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    kanji_updated_total += k_updated
    print(f"Updated {k_updated} items in {os.path.basename(fp)}.")

print("\n=== HOÀN TẤT CHUẨN HÓA TOÀN BỘ HÁN VIỆT ===")
