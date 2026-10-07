import json
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('src/data/minna_lessons.json', 'r', encoding='utf-8') as f:
    minna = json.load(f)

# Common wrong Sino-Vietnamese readings
bad_patterns = [
    ('THÁI HỌC', 'ĐẠI HỌC'),
    ('CỐI XÃ', 'HỘI XÃ'),
    ('BÔN', 'BẢN'),
    ('TIÊN SANH', 'TIÊN SINH'),
    ('HỌC SANH', 'HỌC SINH'),
    ('GIAO SƯ', 'GIÁO SƯ'),
    ('GIAO VIÊN', 'GIÁO VIÊN'),
    ('GIÀM', 'THÀNH'),
    ('MẶC TRÀNG', 'VẠN LÝ TRƯỜNG'),
    ('TÂN THÁI', 'TÂN ĐẠI PHẢN'),
    ('THÁI GIÀM', 'ĐẠI PHẢN THÀNH'),
]

found = []
for l in minna:
    l_num = l.get('lesson')
    for w in l.get('words', []):
        hv = w.get('hanviet', '')
        kanji = w.get('kanji', '')
        for bad, good in bad_patterns:
            if bad in hv:
                found.append((l_num, kanji, hv, good))

print(f"Found {len(found)} known bad Hán Việt patterns in Minna:")
for x in found:
    print(f"  Lesson {x[0]}: {x[1]} -> HV: '{x[2]}' (should be '{x[3]}')")
