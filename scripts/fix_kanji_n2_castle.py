import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('src/data/kanji/n2.json', 'r', encoding='utf-8') as f:
    n2 = json.load(f)

for item in n2:
    if item.get('kanji') == '城':
        item['hanviet'] = 'THÀNH'
        item['meanings_vi'] = ['thành (thành trì, lâu đài)', 'thành trì']
        for ex in item.get('examples', []):
            if ex.get('word') == '城':
                ex['hanviet'] = 'THÀNH'
                ex['meaning'] = 'thành, lâu đài'
            elif ex.get('word') == '城下':
                ex['hanviet'] = 'THÀNH HẠ'
                ex['meaning'] = 'khu phố dưới chân thành'
            elif ex.get('word') == '大阪城':
                ex['hanviet'] = 'ĐẠI PHẢN THÀNH'
                ex['meaning'] = 'Lâu đài Osaka'
            elif ex.get('word') == '［お］城':
                ex['hanviet'] = 'THÀNH'
                ex['meaning'] = 'lâu đài'
            elif ex.get('word') == '大阪城公園':
                ex['hanviet'] = 'ĐẠI PHẢN THÀNH CÔNG VIÊN'
                ex['meaning'] = 'Công viên Lâu đài Osaka'
            elif '長城' in ex.get('word', ''):
                ex['hanviet'] = 'VẠN LÝ TRƯỜNG THÀNH'
                ex['meaning'] = 'Vạn Lý Trường Thành'

with open('src/data/kanji/n2.json', 'w', encoding='utf-8') as f:
    json.dump(n2, f, ensure_ascii=False, indent=2)

print("Updated 城 in src/data/kanji/n2.json successfully.")
