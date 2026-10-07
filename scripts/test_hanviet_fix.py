import json
import sys
import glob
import re

sys.stdout.reconfigure(encoding='utf-8')

# 1. Base standard dictionary from kanji/*.json
kanji_to_hv = {}
for fp in sorted(glob.glob('src/data/kanji/*.json')):
    with open(fp, 'r', encoding='utf-8') as f:
        kd = json.load(f)
    for item in kd:
        k = item.get('kanji')
        hv = item.get('hanviet', '').strip().upper()
        if k and hv:
            kanji_to_hv[k] = hv

# 2. Comprehensive corrections for ANY kanji where kanji/*.json was wrong or archaic
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
}
kanji_to_hv.update(CORRECTIONS)

# Missing kanji from Jōyō & Jinmeiyō list
EXTRA_KANJI = {
    '柵': 'SÁCH', '雫': 'HẠ', '肘': 'TRỬU', '呑': 'THÔN', '牡': 'MẪU',
    '掻': 'TAO', '呆': 'NGAI', '呟': 'HUYỀN', '挨': 'AI', '坊': 'PHƯỜNG',
    '痩': 'SẤU', '奢': 'XA', '餅': 'BÍNH', '饉': 'CẬN', '罹': 'LY',
    '箋': 'TIÊN', '顎': 'NGẠC', '琶': 'TÀ', '噌': 'TĂNG', '煎': 'TIÊN',
    '馴': 'TUẦN', '麓': 'LỘC', '宛': 'UYỂN', '弛': 'THI', '炒': 'SAO',
    '捲': 'QUYỂN', '嘲': 'TRÀO', '腫': 'THỦNG', '謎': 'MÊ', '的': 'ĐÍCH',
    '箸': 'TRỨ', '鞄': 'BẠC', '喧': 'HUYÊN', '嘩': 'HOA', '錆': 'THƯƠNG',
    '剃': 'THẾ', '噛': 'GIẢO', '呟': 'HUYỀN', '囁': 'NHIẾP', '頷': 'HÀM',
    '跨': 'KHÓA', '這': 'GIÁ', '辿': 'SIỂN', '掴': 'QUẶC', '擦': 'SÁT',
    '睨': 'NGHỄ', '覗': 'TƯ', '填': 'ĐIỀN', '傲': 'NGẠO', '慢': 'MẠN',
    '杜': 'ĐỖ', '撰': 'SOẠN', '捗': 'DUỆ', '緻': 'TRÍ', '密': 'MẬT',
    '拉': 'LẠP', '致': 'TRÍ', '歪': 'OAI', '蔽': 'TẾ', '籠': 'LUNG',
    '塞': 'TẮC', '隙': 'KHÍCH', '爪': 'TRẢO', '罠': 'MÂN', '騙': 'PHIẾN',
    '躓': 'CHÍ', '躊': 'TRÙ', '躇': 'TRỪ', '怯': 'KHIẾP', '嗅': 'KHỨU',
    '唾': 'THOÁ', '咳': 'KHÁI', '嘔': 'ẨU', '吐': 'THỔ', '痣': 'CHÍ',
    '髭': 'TỲ', '膝': 'TẤT', '踵': 'CHỦNG', '瞼': 'KIỂM', '眉': 'MI',
    '股': 'CỔ', '脇': 'HIỆP', '臍': 'TỀ', '贅': 'CHUẾ', '沢': 'TRẠCH',
    '噂': 'ĐỒN', '嘘': 'HƯ', '喋': 'ĐIỆP', '曖': 'ÁI', '昧': 'MUỘI',
    '凄': 'THÊ', '凄': 'THÊ', '狡': 'GIẢO', '猾': 'HOẠT', '貪': 'THAM',
    '慾': 'DỤC', '婪': 'LAM', '蔑': 'MIỆT', '嫉': 'TẬT', '妬': 'ĐỐ',
    '拗': 'ẢO', '捏': 'NIỆT', '造': 'TẠO', '狡': 'GIẢO', '童': 'ĐỒNG',
}
kanji_to_hv.update(EXTRA_KANJI)

print(f"Total standard kanji lookup size: {len(kanji_to_hv)}")

def compute_word_hanviet(kanji_text):
    if not kanji_text:
        return ""
    # Extract kanji characters
    kanjis = re.findall(r'[\u4e00-\u9faf\u3400-\u4dbf]', kanji_text)
    if not kanjis:
        return ""
    hv_list = []
    for k in kanjis:
        hv_list.append(kanji_to_hv.get(k, ''))
    # If all found
    if all(hv_list):
        return " ".join(hv_list)
    return ""

print("Test word computes:")
print("大阪デパート ->", compute_word_hanviet("大阪デパート"))
print("新大阪 ->", compute_word_hanviet("新大阪"))
print("大阪城 ->", compute_word_hanviet("大阪城"))
print("大阪城公園 ->", compute_word_hanviet("大阪城公園"))
print("会社員 ->", compute_word_hanviet("会社員"))
print("大学 ->", compute_word_hanviet("大学"))
print("日本 ->", compute_word_hanviet("日本"))
print("不便 ->", compute_word_hanviet("不便"))
print("先生 ->", compute_word_hanviet("先生"))
print("学生 ->", compute_word_hanviet("学生"))
print("教師 ->", compute_word_hanviet("教師"))
print("万里の長城 ->", compute_word_hanviet("万里の長城"))
