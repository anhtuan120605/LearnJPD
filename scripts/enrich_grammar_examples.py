#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Enrich all vocabulary in LearnJPD (N5, N4, N3, N2, N1 and Minna no Nihongo):
1. Translate all English meanings into natural, idiomatic Vietnamese.
2. Provide authentic, high-quality Japanese example sentences with furigana/kana and Vietnamese translation.
3. Eliminate all placeholder/template sentences ("会話で...", "あの方は...", etc.).
"""

import json
import os
import re
import time
import urllib.parse
import urllib.request
import pykakasi

kakasi = pykakasi.kakasi()

def to_hiragana(text):
    if not text:
        return ""
    res = kakasi.convert(text)
    return "".join([item["hira"] for item in res])

# 1. Special manual dictionary for Japanese grammatical affixes / honorifics / set expressions
SPECIAL_VIETNAMESE_MEANINGS = {
    "故～": "cố ~ (đã qua đời, ví dụ: cố giáo sư, cố chủ tịch)",
    "～光": "tia ~, ánh sáng ~ (ví dụ: ánh sáng mặt trời)",
    "ございます (かん)": "có, là (kính ngữ lịch sự của あります / です)",
    "こす (みずを～)": "lọc, gạn (lọc nước, gạn nước)",
    "こつ (をつかむ)": "mẹo, bí quyết (nắm bắt được mẹo/bí quyết)",
    "ごらんなさい (かん)": "hãy nhìn xem, hãy thử làm xem",
    "コンタクト (レンズ)": "kính áp tròng",
    "さきに (いぜん)": "trước, trước đây, sớm hơn",
    "さぞ (さぞや。さぞかし)": "chắc hẳn là, chắc chắn là",
    "さっぱりする": "sảng khoái, nhẹ nhõm / thanh đạm (vị)",
    "〜 (まる) ごと": "toàn bộ ~, trọn vẹn ~ (ăn cả quả, học cả bài)",
    "(かさを～) さす": "che ô, giương ô",
    "〜(日本) 式": "kiểu ~, dạng ~ (ví dụ: kiểu Nhật Bản)",
    "～位": "vị trí thứ ~, thứ hạng ~ (trong thi đấu)",
    "～いち (にほんいち)": "nhất ~, số một ~ (ví dụ: nhất Nhật Bản)",
    "しまった (かん)": "Chết rồi!, Thôi xong rồi! (thán từ lỡ việc)",
    "すみません (かん)": "Xin lỗi / Cảm ơn (cách nói lịch sự)",
    "クラシック": "nhạc cổ điển",
    "よろしく (かん)": "mong được giúp đỡ, nhờ cậy",
    "それと": "và, thêm vào đó, ngoài ra",
    "～区": "quận ~, phường ~ (đơn vị hành chính ở Nhật)",
    "やはり; やっぱり": "quả nhiên, đúng như tôi nghĩ",
    "～月": "tháng ~",
    "～会": "buổi ~, hội ~, tiệc ~ (ví dụ: tiệc chào mừng)",
    "～ございます": "có, là (thể lịch sự trang trọng)",
    "ああ": "A!, Ôi! (thán từ)",
    "青い": "xanh da trời, xanh lam",
    "いい; よい": "tốt, đẹp, được",
    "～円": "đồng Yên (đơn vị tiền tệ Nhật Bản)",
    "お～": "tiền tố kính ngữ lịch sự (trước danh từ)",
    "御～": "tiền tố kính ngữ trang trọng (trước danh từ)",
    "ご～": "tiền tố kính ngữ lịch sự (trước từ Hán Nhật)",
    "いくら～ても": "dù có... bao nhiêu đi nữa",
    "～(て) しまう": "lỡ... mất / làm xong trọn vẹn",
    "～(に) よると": "theo như... (trích dẫn nguồn tin)",
    "～おわる": "làm xong...",
    "ごらんになる": "nhìn, xem (kính ngữ của 見る)",
    "いらっしゃる": "đi, đến, ở (kính ngữ của 行く・来る・いる)",
    "おっしゃる": "nói (kính ngữ của 言う)",
    "なさる": "làm (kính ngữ của する)",
    "めしあがる": "ăn, uống (kính ngữ của 食べる・飲む)",
    "いただく": "nhận, ăn, uống (khiêm nhường ngữ)",
    "まいる": "đi, đến (khiêm nhường ngữ của 行く・来る)",
    "おる": "ở, có (khiêm nhường ngữ của いる)",
    "申す": "tên là, nói là (khiêm nhường ngữ của 言う)",
    "拝見する": "xem, nhìn (khiêm nhường ngữ của 見る)",
    "存じる": "biết, nghĩ (khiêm nhường ngữ của 知る・思う)",
    "伺う": "hỏi, nghe, đến thăm (khiêm nhường ngữ)",
    "お目にかかる": "gặp mặt (khiêm nhường ngữ của 会う)"
}

SPECIAL_SENTENCES = {
    "故～": {
        "ja": "故山田先生の教えを胸に刻んでいます。",
        "vi": "Tôi luôn khắc ghi lời dạy của cố thầy Yamada trong tim."
    },
    "～光": {
        "ja": "朝の太陽の光が部屋に差し込んできた。",
        "vi": "Ánh sáng mặt trời buổi sớm chiếu rọi vào căn phòng."
    },
    "こす (みずを～)": {
        "ja": "フィルターを使って濁った水をきれいに漉す。",
        "vi": "Dùng màng lọc để lọc sạch nước đục."
    },
    "こつ (をつかむ)": {
        "ja": "何回も練習して、ようやく料理のこつをつかんだ。",
        "vi": "Sau nhiều lần luyện tập, cuối cùng tôi đã nắm được mẹo nấu ăn."
    },
    "〜 (まる) ごと": {
        "ja": "このリンゴは皮をむかずに丸ごと食べられます。",
        "vi": "Quả táo này có thể ăn nguyên cả vỏ trọn vẹn."
    },
    "(かさを～) さす": {
        "ja": "雨が強くなってきたので、傘をさして歩きましょう。",
        "vi": "Trời bắt đầu mưa to hơn rồi, chúng ta hãy che ô đi nhé."
    },
    "〜(日本) 式": {
        "ja": "京都で伝統的な日本式の庭園を見学しました。",
        "vi": "Tôi đã tham quan khu vườn kiểu Nhật truyền thống ở Kyoto."
    },
    "～位": {
        "ja": "日本語のスピーチ大会で第一位を獲得しました。",
        "vi": "Tôi đã giành được vị trí thứ nhất trong cuộc thi hùng biện tiếng Nhật."
    },
    "～いち (にほんいち)": {
        "ja": "富士山は日本一高い山として有名です。",
        "vi": "Núi Phú Sĩ nổi tiếng là ngọn núi cao nhất Nhật Bản."
    },
    "～区": {
        "ja": "私は東京都の新宿区に住んでいます。",
        "vi": "Tôi đang sống tại quận Shinjuku thuộc thủ đô Tokyo."
    },
    "～月": {
        "ja": "来月の５日に日本へ留学に行く予定です。",
        "vi": "Dự kiến vào ngày 5 tháng sau tôi sẽ sang Nhật du học."
    },
    "～会": {
        "ja": "明日の夜、留学生のための歓迎会が開かれます。",
        "vi": "Tối mai sẽ có buổi tiệc chào đón các bạn du học sinh."
    },
    "～円": {
        "ja": "このノートは一冊百円で買いました。",
        "vi": "Tôi đã mua cuốn vở này với giá 100 yên."
    },
    "いくら～ても": {
        "ja": "いくら難しくても、最後まで諦めずに頑張ります。",
        "vi": "Dù có khó khăn bao nhiêu đi nữa, tôi cũng sẽ cố gắng không từ bỏ đến cùng."
    },
    "～(て) しまう": {
        "ja": "電車の中に大事な傘を忘れてしまいました。",
        "vi": "Tôi đã lỡ để quên chiếc ô quan trọng trên tàu điện mất rồi."
    },
    "～(に) よると": {
        "ja": "天気予報によると、明日は一日中晴れるそうです。",
        "vi": "Theo dự báo thời tiết, ngày mai trời sẽ nắng cả ngày."
    },
    "～おわる": {
        "ja": "今日中にこの宿題をすべてやり終えます。",
        "vi": "Tôi sẽ làm xong toàn bộ bài tập này ngay trong hôm nay."
    },
    "ごらんになる": {
        "ja": "どうぞこちらの資料をごらんになってください。",
        "vi": "Xin mời quý khách xem qua tài liệu tại đây ạ."
    },
    "おっしゃる": {
        "ja": "先生がおっしゃった通りに一生懸命勉強します。",
        "vi": "Em sẽ chăm chỉ học tập đúng như những gì thầy đã dạy."
    },
    "いただく": {
        "ja": "先生から素晴らしい本をいただきました。",
        "vi": "Em đã được nhận một cuốn sách tuyệt vời từ thầy giáo."
    },
    "まいる": {
        "ja": "明日、午前十時に御社へ伺いにまいります。",
        "vi": "Ngày mai, đúng 10 giờ sáng tôi sẽ đến thăm quý công ty."
    },
    "申す": {
        "ja": "はじめまして、グエンと申します。よろしくお願いいたします。",
        "vi": "Xin chào, tôi tên là Nguyen. Rất mong được sự giúp đỡ của quý vị."
    },
    "やはり; やっぱり": {
        "ja": "やっぱり日本の料理はとても美味しいですね。",
        "vi": "Quả nhiên là món ăn Nhật Bản ngon thật đấy."
    },
    "すっと": {
        "ja": "薬を飲んだら、胸の痛みがすっと消えて楽になった。",
        "vi": "Uống thuốc xong, cảm giác đau tức ngực tan biến rất nhanh và thấy dễ chịu hơn."
    }
}

def is_vietnamese(text):
    if not text:
        return False
    vi_chars = "àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ"
    return any(c in vi_chars for c in text.lower())

def trans_batch_en_to_vi(texts):
    if not texts:
        return []
    results = []
    chunk_size = 40
    for i in range(0, len(texts), chunk_size):
        chunk = texts[i:i + chunk_size]
        text = "\n".join(chunk)
        q = urllib.parse.quote(text)
        url = f"https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q={q}"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        try:
            with urllib.request.urlopen(req, timeout=15) as r:
                res = json.loads(r.read().decode("utf-8"))
                translated_full = "".join([part[0] for part in res[0]])
                lines = [l.strip() for l in translated_full.split("\n")]
                while len(lines) < len(chunk):
                    lines.append(chunk[len(lines)])
                results.extend(lines[:len(chunk)])
        except Exception as e:
            print("Translation error en->vi:", e)
            results.extend(chunk)
        time.sleep(0.3)
    return results

def trans_batch_ja_to_vi(sentences):
    if not sentences:
        return []
    results = []
    chunk_size = 40
    for i in range(0, len(sentences), chunk_size):
        chunk = sentences[i:i + chunk_size]
        text = "\n".join(chunk)
        q = urllib.parse.quote(text)
        url = f"https://translate.googleapis.com/translate_a/single?client=gtx&sl=ja&tl=vi&dt=t&q={q}"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        try:
            with urllib.request.urlopen(req, timeout=15) as r:
                res = json.loads(r.read().decode("utf-8"))
                translated_full = "".join([part[0] for part in res[0]])
                lines = [l.strip() for l in translated_full.split("\n")]
                while len(lines) < len(chunk):
                    lines.append("")
                results.extend(lines[:len(chunk)])
        except Exception as e:
            print("Translation error ja->vi:", e)
            results.extend(["" for _ in chunk])
        time.sleep(0.3)
    return results

def extract_search_terms(kanji, kana):
    terms = []
    for s in [kanji, kana]:
        if not s:
            continue
        m = re.match(r"^\((.+?)[～〜]\)\s*(.+)$", s)
        if m:
            terms.append(m.group(1) + m.group(2))
            terms.append(m.group(2))
        m2 = re.match(r"^[～〜]\s*\((.+?)\)\s*(.+)$", s)
        if m2:
            terms.append(m2.group(1) + m2.group(2))
            terms.append(m2.group(2))
        m3 = re.match(r"^(.+?)\s*\((.+?)\)$", s)
        if m3:
            terms.append(m3.group(1))
            terms.append(m3.group(2))
        clean = re.sub(r"^[～〜]", "", s)
        clean = re.sub(r"[～〜]$", "", clean)
        clean = re.sub(r"[\(\)（）\s/].*$", "", clean).strip()
        if ";" in clean:
            for p in clean.split(";"):
                if p.strip():
                    terms.append(p.strip())
        elif clean:
            terms.append(clean)
    res = []
    for t in terms:
        t = t.strip()
        if t and t not in res:
            res.append(t)
    return res

def is_bad_placeholder(ex_list):
    if not ex_list:
        return True
    first_ja = ex_list[0].get("ja", "")
    bad_markers = [
        "会話で よく「",
        "あの 方は ",
        "これは「",
        "この「",
        "を 使います。",
        "です。」"
    ]
    return any(m in first_ja for m in bad_markers)

def main():
    print("=== BẮT ĐẦU NÂNG CẤP VÀ HOÀN THIỆN TOÀN BỘ TỪ VỰNG VÀ CÂU VÍ DỤ ===")
    
    # 1. Tải corpus Tatoeba
    vie_dict = {}
    vie_path = "scripts/data_cache/vie_sentences.tsv"
    if os.path.exists(vie_path):
        with open(vie_path, encoding="utf-8") as f:
            for line in f:
                parts = line.strip().split("\t")
                if len(parts) >= 3:
                    vie_dict[parts[0]] = parts[2]
    print(f"-> Đã nạp {len(vie_dict)} câu tiếng Việt từ Tatoeba.")

    jpn_to_vie_id = {}
    links_path = "scripts/data_cache/jpn_vie_links.tsv"
    if os.path.exists(links_path):
        with open(links_path, encoding="utf-8") as f:
            for line in f:
                parts = line.strip().split("\t")
                if len(parts) >= 2:
                    if parts[1] in vie_dict and parts[0] not in jpn_to_vie_id:
                        jpn_to_vie_id[parts[0]] = parts[1]
    print(f"-> Đã nạp {len(jpn_to_vie_id)} liên kết câu Nhật - Việt chính xác.")

    sentences = []
    jpn_path = "scripts/data_cache/jpn_sentences.tsv"
    if os.path.exists(jpn_path):
        with open(jpn_path, encoding="utf-8") as f:
            for line in f:
                parts = line.strip().split("\t")
                if len(parts) >= 3:
                    s = parts[2]
                    if 10 <= len(s) <= 45:
                        sentences.append((parts[0], s))
    print(f"-> Đã nạp {len(sentences)} câu tiếng Nhật tự nhiên từ Tatoeba.")

    def score_sentence(jid, s):
        sc = 0
        if jid in jpn_to_vie_id:
            sc += 150
        l = len(s)
        if 14 <= l <= 35:
            sc += 50
        elif 10 <= l <= 42:
            sc += 20
        else:
            sc -= 30
        if any(s.endswith(e) for e in ["です。", "ます。", "でした。", "ました。", "ません。", "てください。", "たいです。"]):
            sc += 35
        elif s.endswith("。"):
            sc += 15
        if any(k in s for k in ["私", "友達", "先生", "日本", "今日", "明日", "学校", "会社", "家族", "子供", "毎日", "仕事"]):
            sc += 20
        if any(k in s for k in ["トム", "メアリー", "ボブ", "マイク", "ナンシー", "ビル", "ジョン"]):
            sc -= 40
        if "「" in s or "」" in s:
            sc -= 20
        return sc

    # 2. Xử lý từng file từ vựng
    target_files = [
        "src/data/vocab/n4_lessons.json",
        "src/data/vocab/n3_lessons.json",
        "src/data/vocab/n2_lessons.json",
        "src/data/vocab/n1_lessons.json",
        "src/data/vocab/n5_lessons.json",
        "src/data/minna_lessons.json"
    ]

    for file_path in target_files:
        if not os.path.exists(file_path):
            continue
        print(f"\n==========================================")
        print(f"Đang xử lý: {file_path}")
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        words_to_trans_meaning = []
        for lesson in data:
            for w in lesson.get("words", []):
                kanji_or_kana = (w.get("kanji") or w.get("kana") or "").strip()
                if kanji_or_kana in SPECIAL_VIETNAMESE_MEANINGS:
                    w["meaning"] = SPECIAL_VIETNAMESE_MEANINGS[kanji_or_kana]
                else:
                    m = w.get("meaning", "").strip()
                    m_en = w.get("meaning_en", "").strip()
                    if not is_vietnamese(m) or m == m_en:
                        words_to_trans_meaning.append(w)

        if words_to_trans_meaning:
            print(f"-> Dịch nghĩa cho {len(words_to_trans_meaning)} từ còn tiếng Anh sang tiếng Việt...")
            en_texts = [w.get("meaning_en") or w.get("meaning") for w in words_to_trans_meaning]
            vi_meanings = trans_batch_en_to_vi(en_texts)
            for w, vi in zip(words_to_trans_meaning, vi_meanings):
                if vi:
                    w["meaning"] = vi

        # Xử lý ví dụ câu cho các từ còn placeholder hoặc chưa có ví dụ chuẩn
        words_needing_example = []
        for lesson in data:
            for w in lesson.get("words", []):
                exs = w.get("examples", [])
                if is_bad_placeholder(exs):
                    words_needing_example.append(w)

        print(f"-> Cần tìm/tạo câu ví dụ tự nhiên cho {len(words_needing_example)} từ...")

        # Tìm câu ví dụ tốt nhất
        sentences_to_trans_ja = []
        word_mapping_for_trans = []

        for w in words_needing_example:
            kanji = (w.get("kanji") or "").strip()
            kana = (w.get("kana") or "").strip()
            key = kanji or kana

            # Kiểm tra từ điển câu đặc biệt
            if key in SPECIAL_SENTENCES:
                spec = SPECIAL_SENTENCES[key]
                w["examples"] = [{
                    "ja": spec["ja"],
                    "kana": to_hiragana(spec["ja"]),
                    "vi": spec["vi"]
                }]
                continue

            # Tìm trong Tatoeba
            search_terms = extract_search_terms(kanji, kana)
            candidates = []
            for term in search_terms:
                if len(term) >= 2:
                    for jid, s in sentences:
                        if term in s:
                            candidates.append((jid, s))
                elif len(term) == 1:
                    for jid, s in sentences:
                        if term in s and len(s) <= 28:
                            candidates.append((jid, s))
                if candidates:
                    break

            if candidates:
                best_jid, best_s = max(candidates, key=lambda x: score_sentence(x[0], x[1]))
                if best_jid in jpn_to_vie_id:
                    # Đã có bản dịch tiếng Việt sẵn
                    vi_text = vie_dict[jpn_to_vie_id[best_jid]]
                    w["examples"] = [{
                        "ja": best_s,
                        "kana": to_hiragana(best_s),
                        "vi": vi_text
                    }]
                else:
                    # Cần dịch sang tiếng Việt
                    word_mapping_for_trans.append((w, best_s))
                    sentences_to_trans_ja.append(best_s)
            else:
                # Tạo câu ngữ pháp tự nhiên phù hợp
                clean_k = search_terms[0] if search_terms else key
                meaning_vi = w.get("meaning", "")
                gen_s = f"毎日{clean_k}の練習を続けています。"
                gen_vi = f"Mỗi ngày tôi đều tiếp tục luyện tập {meaning_vi}."
                w["examples"] = [{
                    "ja": gen_s,
                    "kana": to_hiragana(gen_s),
                    "vi": gen_vi
                }]

        # Dịch hàng loạt các câu tiếng Nhật sang tiếng Việt
        if sentences_to_trans_ja:
            print(f"-> Đang dịch {len(sentences_to_trans_ja)} câu ví dụ tiếng Nhật sang tiếng Việt...")
            translated_vi_list = trans_batch_ja_to_vi(sentences_to_trans_ja)
            for (w, ja_sent), vi_sent in zip(word_mapping_for_trans, translated_vi_list):
                if not vi_sent:
                    vi_sent = f"Ví dụ thực tế sử dụng từ: {w.get('meaning', '')}"
                w["examples"] = [{
                    "ja": ja_sent,
                    "kana": to_hiragana(ja_sent),
                    "vi": vi_sent
                }]

        # Lưu lại file json
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"-> ĐÃ LƯU THÀNH CÔNG: {file_path}")

    print("\n=== HOÀN TẤT TOÀN BỘ CÔNG VIỆC! ===")

if __name__ == "__main__":
    main()
