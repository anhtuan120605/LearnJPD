// Cơ sở dữ liệu Mẹo nhớ & Chiết tự (Mnemonics & Radical Breakdown) cho Kanji N5 - N1
export interface KanjiMnemonicItem {
  kanji: string;
  hanviet: string;
  parts: Array<{
    radical: string;
    meaning: string;
  }>;
  story: string;
  hint?: string;
}

export const KANJI_MNEMONICS_DATA: Record<string, KanjiMnemonicItem> = {
  // === N5 THÔNG DỤNG ===
  '一': {
    kanji: '一',
    hanviet: 'NHẤT',
    parts: [{ radical: '一', meaning: 'Nhất - số một' }],
    story: 'Một nét gạch ngang duy nhất tượng trưng cho số 1.',
    hint: 'Chỉ có 1 gạch ngang'
  },
  '二': {
    kanji: '二',
    hanviet: 'NHỊ',
    parts: [{ radical: '二', meaning: 'Nhị - số hai' }],
    story: 'Hai nét gạch ngang song song tượng trưng cho số 2.',
    hint: '2 gạch ngang'
  },
  '三': {
    kanji: '三',
    hanviet: 'TAM',
    parts: [{ radical: '一', meaning: 'Gộp 3 nét nhất' }],
    story: 'Ba nét gạch ngang xếp chồng lên nhau thành số 3.',
    hint: '3 gạch ngang'
  },
  '四': {
    kanji: '四',
    hanviet: 'TỨ',
    parts: [{ radical: '囗', meaning: 'Vi - vây quanh' }, { radical: '儿', meaning: 'Nhân đi - 2 chân' }],
    story: 'Một căn phòng khép kín có cửa sổ chia làm 4 ô vuông góc.',
    hint: 'Cửa sổ 4 ô'
  },
  '五': {
    kanji: '五',
    hanviet: 'NGŨ',
    parts: [{ radical: '二', meaning: 'Trời và Đất' }, { radical: '乂', meaning: 'Giao thoa' }],
    story: 'Sự giao hòa giữa trời và đất tạo nên ngũ hành (5 yếu tố).',
    hint: 'Số 5 gập khúc'
  },
  '六': {
    kanji: '六',
    hanviet: 'LỤC',
    parts: [{ radical: '亠', meaning: 'Mũ/đầu' }, { radical: '八', meaning: 'Hai chân' }],
    story: 'Đội mũ trên đầu, bên dưới hai chân chạy lon ton số 6.',
    hint: 'Mũ trên hai chân'
  },
  '七': {
    kanji: '七',
    hanviet: 'THẤT',
    parts: [{ radical: '一', meaning: 'Gạch ngang' }, { radical: '乚', meaning: 'Nét móc' }],
    story: 'Số 7 lộn ngược như lưỡi kiếm chém dứt khoát một nhát.',
    hint: 'Số 7 lộn ngược'
  },
  '八': {
    kanji: '八',
    hanviet: 'BÁT',
    parts: [{ radical: '八', meaning: 'Bát - xòe ra' }],
    story: 'Hai nét xòe rộng ra như miệng núi lửa Phú Sĩ, tượng trưng cho sự phát đạt (số 8).',
    hint: 'Miệng núi xòe ra'
  },
  '九': {
    kanji: '九',
    hanviet: 'CỬU',
    parts: [{ radical: '丿', meaning: 'Phẩy' }, { radical: '乙', meaning: 'Nét gấp' }],
    story: 'Một người đang cúi mình gập cánh tay cơ bắp thể hiện sức mạnh số 9.',
    hint: 'Người gập cánh tay'
  },
  '十': {
    kanji: '十',
    hanviet: 'THẬP',
    parts: [{ radical: '十', meaning: 'Thập - đầy đủ' }],
    story: 'Hai nét ngang dọc cắt nhau tạo thành dấu thập hoàn hảo số 10 tròn trĩnh.',
    hint: 'Dấu thập'
  },
  '百': {
    kanji: '百',
    hanviet: 'BÁCH',
    parts: [{ radical: '一', meaning: 'Một' }, { radical: '白', meaning: 'Màu trắng (Bạch)' }],
    story: 'Thêm 1 vạch trên đầu chữ Bạch (trắng) là đủ 100 tuổi đầu bạc trắng như mây.',
    hint: 'Một + Trắng = 100'
  },
  '千': {
    kanji: '千',
    hanviet: 'THIÊN',
    parts: [{ radical: '丿', meaning: 'Phẩy một cái' }, { radical: '十', meaning: 'Số 10 (Thập)' }],
    story: 'Phẩy một nét lên trên đỉnh đầu số 10 (十) là nhân lên 100 lần thành 1000 (Thiên).',
    hint: 'Phẩy + Mười = Nghìn'
  },
  '万': {
    kanji: '万',
    hanviet: 'VẠN',
    parts: [{ radical: '一', meaning: 'Một' }, { radical: '勹', meaning: 'Bao bọc' }],
    story: 'Một vạch che chở trọn vẹn cả vạn (10.000) người.',
    hint: 'Một vạn người'
  },
  '日': {
    kanji: '日',
    hanviet: 'NHẬT',
    parts: [{ radical: '日', meaning: 'Mặt trời / ngày' }],
    story: 'Vòng tròn mặt trời chiếu tia sáng ở chính giữa qua từng ngày.',
    hint: 'Mặt trời chiếu sáng'
  },
  '月': {
    kanji: '月',
    hanviet: 'NGUYỆT',
    parts: [{ radical: '月', meaning: 'Mặt trăng / tháng' }],
    story: 'Vầng trăng khuyết lơ lửng giữa đêm hè có 2 dải mây vắt ngang qua.',
    hint: 'Vầng trăng khuyết'
  },
  '火': {
    kanji: '火',
    hanviet: 'HỎA',
    parts: [{ radical: '人', meaning: 'Người' }, { radical: '丷', meaning: 'Tàn lửa bốc lên' }],
    story: 'Người nhảy múa xung quanh đống lửa lớn đang bốc tàn tro sáng rực.',
    hint: 'Người và tàn lửa'
  },
  '水': {
    kanji: '水',
    hanviet: 'THỦY',
    parts: [{ radical: '亅', meaning: 'Dòng chảy giữa' }, { radical: '冫', meaning: 'Bọt nước hai bên' }],
    story: 'Dòng suối nguồn chảy xiết tung bọt nước mát lạnh sang hai bên.',
    hint: 'Dòng nước tung bọt'
  },
  '木': {
    kanji: '木',
    hanviet: 'MỘC',
    parts: [{ radical: '十', meaning: 'Thân cành' }, { radical: '八', meaning: 'Rễ cây đâm xuống' }],
    story: 'Cái cây có tán vươn thẳng lên trời và rễ bám sâu chắc vào lòng đất.',
    hint: 'Cây có tán và rễ'
  },
  '金': {
    kanji: '金',
    hanviet: 'KIM',
    parts: [{ radical: '亼', meaning: 'Mái che/tụ họp' }, { radical: '土', meaning: 'Đất' }, { radical: '丷', meaning: 'Hạt vàng lấp lánh' }],
    story: 'Dưới lòng đất sâu, những hạt vàng ròng quý giá (Kim) đang tỏa sáng lấp lánh.',
    hint: 'Vàng quý chôn trong đất'
  },
  '土': {
    kanji: '土',
    hanviet: 'THỔ',
    parts: [{ radical: '十', meaning: 'Mầm cây' }, { radical: '一', meaning: 'Mặt đất' }],
    story: 'Mầm cây nhú lên từ bề mặt đất màu mỡ (Thổ).',
    hint: 'Mầm vươn từ đất'
  },
  '山': {
    kanji: '山',
    hanviet: 'SƠN',
    parts: [{ radical: '山', meaning: 'Ngọn núi' }],
    story: 'Ba đỉnh núi trùng điệp sừng sững cạnh nhau, đỉnh ở giữa cao vút.',
    hint: '3 ngọn núi'
  },
  '川': {
    kanji: '川',
    hanviet: 'XUYÊN',
    parts: [{ radical: '川', meaning: 'Con sông' }],
    story: 'Ba dòng nước uốn lượn cùng đổ về một con sông lớn.',
    hint: '3 dòng nước sông'
  },
  '田': {
    kanji: '田',
    hanviet: 'ĐIỀN',
    parts: [{ radical: '囗', meaning: 'Khu đất' }, { radical: '十', meaning: 'Bờ ruộng chia lối' }],
    story: 'Thửa ruộng phì nhiêu được bờ ruộng chia đều thành 4 luống cấy lúa.',
    hint: 'Ruộng chia 4 ô'
  },
  '人': {
    kanji: '人',
    hanviet: 'NHÂN',
    parts: [{ radical: '人', meaning: 'Người' }],
    story: 'Con người biết đứng thẳng hiên ngang bằng hai chân vững chãi.',
    hint: 'Người đứng 2 chân'
  },
  '口': {
    kanji: '口',
    hanviet: 'KHẨU',
    parts: [{ radical: '口', meaning: 'Cái miệng' }],
    story: 'Hình vẽ chiếc miệng mở to tròn khi đang nói hoặc cười.',
    hint: 'Chiếc miệng mở'
  },
  '目': {
    kanji: '目',
    hanviet: 'MỤC',
    parts: [{ radical: '目', meaning: 'Đôi mắt' }],
    story: 'Đôi mắt xoay dọc với con ngươi tròn nằm ở chính giữa.',
    hint: 'Đôi mắt xoay dọc'
  },
  '手': {
    kanji: '手',
    hanviet: 'THỦ',
    parts: [{ radical: '手', meaning: 'Bàn tay' }],
    story: 'Bàn tay 5 ngón đang xòe ra sẵn sàng lao động và cầm nắm.',
    hint: 'Bàn tay xòe ngón'
  },
  '足': {
    kanji: '足',
    hanviet: 'TÚC',
    parts: [{ radical: '口', meaning: 'Đầu gối' }, { radical: '止', meaning: 'Bàn chân đứng lại' }],
    story: 'Có đầu gối và bàn chân bước đi, đầy đủ (Túc) cả chân lẫn tay.',
    hint: 'Đầu gối & bàn chân'
  },
  '耳': {
    kanji: '耳',
    hanviet: 'NHĨ',
    parts: [{ radical: '耳', meaning: 'Lỗ tai' }],
    story: 'Chiếc tai người với vành tai và rãnh nghe rõ mọi âm thanh.',
    hint: 'Vành tai lắng nghe'
  },
  '休': {
    kanji: '休',
    hanviet: 'HƯU',
    parts: [{ radical: '亻', meaning: 'Người' }, { radical: '木', meaning: 'Cây cối' }],
    story: 'Người (亻) tựa lưng vào gốc cây (木) mát rượi để nghỉ ngơi (Hưu trí).',
    hint: 'Người tựa gốc cây'
  },
  '体': {
    kanji: '体',
    hanviet: 'THỂ',
    parts: [{ radical: '亻', meaning: 'Người' }, { radical: '本', meaning: 'Gốc rễ / nguồn cội' }],
    story: 'Gốc rễ (本) của một con người (亻) chính là thân thể, sức khỏe (Thể).',
    hint: 'Người + Gốc = Thân thể'
  },
  '好': {
    kanji: '好',
    hanviet: 'HẢO',
    parts: [{ radical: '女', meaning: 'Người phụ nữ' }, { radical: '子', meaning: 'Đứa con nhỏ' }],
    story: 'Người mẹ (女) ôm ấp đứa con yêu (子) thì thật là tuyệt vời, đáng thích (Hảo).',
    hint: 'Mẹ ôm con = Thích/Tốt'
  },
  '安': {
    kanji: '安',
    hanviet: 'AN',
    parts: [{ radical: '宀', meaning: 'Mái nhà' }, { radical: '女', meaning: 'Người phụ nữ' }],
    story: 'Người phụ nữ (女) ở dưới mái nhà (宀) thì gia đình êm ấm, bình an và an tâm (An).',
    hint: 'Phụ nữ dưới mái nhà'
  },
  '男': {
    kanji: '男',
    hanviet: 'NAM',
    parts: [{ radical: '田', meaning: 'Đồng ruộng' }, { radical: '力', meaning: 'Sức lực' }],
    story: 'Người bỏ sức lực (力) cày bừa trên đồng ruộng (田) chính là đàn ông (Nam).',
    hint: 'Ruộng + Sức lực = Đàn ông'
  },
  '明': {
    kanji: '明',
    hanviet: 'MINH',
    parts: [{ radical: '日', meaning: 'Mặt trời' }, { radical: '月', meaning: 'Mặt trăng' }],
    story: 'Mặt trời (日) cùng với Mặt trăng (月) cùng soi sáng thì muôn nơi bừng sáng, thông minh (Minh).',
    hint: 'Mặt trời + Mặt trăng = Sáng'
  },
  '時': {
    kanji: '時',
    hanviet: 'THỜI',
    parts: [{ radical: '日', meaning: 'Mặt trời' }, { radical: '寺', meaning: 'Ngôi chùa' }],
    story: 'Mặt trời (日) chiếu qua mái chùa (寺) rung chuông báo hiệu giờ giấc, thời gian (Thời).',
    hint: 'Mặt trời + Chùa = Giờ'
  },
  '校': {
    kanji: '校',
    hanviet: 'HIỆU',
    parts: [{ radical: '木', meaning: 'Gỗ / cây' }, { radical: '交', meaning: 'Giao lưu / trao đổi' }],
    story: 'Dưới hàng cây (木) râm mát, học sinh giao lưu (交) kết bạn ở trường học (Hiệu).',
    hint: 'Cây + Giao lưu = Trường học'
  },
  '雨': {
    kanji: '雨',
    hanviet: 'VŨ',
    parts: [{ radical: '一', meaning: 'Bầu trời' }, { radical: '冂', meaning: 'Mây che' }, { radical: '丨', meaning: 'Mưa rơi' }, { radical: '冫', meaning: 'Hạt mưa' }],
    story: 'Bầu trời kéo mây đen kín mít, từng giọt nước mưa tí tách rơi rụng xuống đất (Vũ).',
    hint: 'Hạt mưa rơi từ mây'
  },
  '電': {
    kanji: '電',
    hanviet: 'ĐIỆN',
    parts: [{ radical: '雨', meaning: 'Cơn mưa' }, { radical: '申', meaning: 'Tia sét' }],
    story: 'Trong cơn mưa bão (雨), sấm sét lóe sáng rạch ngang trời phát ra dòng điện (Điện).',
    hint: 'Mưa + Sét = Điện'
  },
  '語': {
    kanji: '語',
    hanviet: 'NGỮ',
    parts: [{ radical: '言', meaning: 'Lời nói' }, { radical: '五', meaning: 'Số 5' }, { radical: '口', meaning: 'Miệng' }],
    story: 'Lời nói (言) phát ra từ 5 (五) cái miệng (口) tạo nên ngôn ngữ, tiếng nói (Ngữ).',
    hint: 'Lời nói + 5 + Miệng'
  },
  '話': {
    kanji: '話',
    hanviet: 'THOẠI',
    parts: [{ radical: '言', meaning: 'Lời nói' }, { radical: '舌', meaning: 'Cái lưỡi' }],
    story: 'Uốn lưỡi (舌) phát ra lời nói (言) để chuyện trò, đàm thoại (Thoại).',
    hint: 'Lời nói + Lưỡi = Nói chuyện'
  },
  '読': {
    kanji: '読',
    hanviet: 'ĐỘC',
    parts: [{ radical: '言', meaning: 'Lời nói' }, { radical: '売', meaning: 'Bán' }],
    story: 'Phát ra lời nói (言) khi đọc cuốn sách mới bán (売) ra trên sạp (Độc).',
    hint: 'Lời nói + Bán = Đọc sách'
  },
  '書': {
    kanji: '書',
    hanviet: 'THƯ',
    parts: [{ radical: '聿', meaning: 'Tay cầm bút' }, { radical: '日', meaning: 'Mặt trời' }],
    story: 'Tay cầm cây bút chăm chỉ viết thư suốt từ lúc mặt trời (日) mọc đến lặn (Thư).',
    hint: 'Cầm bút viết chữ'
  },
  '聞': {
    kanji: '聞',
    hanviet: 'VĂN',
    parts: [{ radical: '門', meaning: 'Cánh cổng' }, { radical: '耳', meaning: 'Cái tai' }],
    story: 'Ghé sát tai (耳) vào khe cổng (門) để lắng nghe ngóng tin tức bên ngoài (Văn).',
    hint: 'Tai đặt ở cổng = Nghe'
  },
  '見': {
    kanji: '見',
    hanviet: 'KIẾN',
    parts: [{ radical: '目', meaning: 'Mắt' }, { radical: '儿', meaning: 'Chân bước' }],
    story: 'Đôi mắt (目) to tròn mở lớn gắn trên đôi chân (儿) đi ngắm nhìn thế giới (Kiến).',
    hint: 'Mắt đi ngắm nhìn'
  },
  '行': {
    kanji: '行',
    hanviet: 'HÀNH',
    parts: [{ radical: '彳', meaning: 'Bước chân trái' }, { radical: '亍', meaning: 'Bước chân phải' }],
    story: 'Ngã tư đường lớn nơi dòng người qua lại, nhấc chân bước đi (Hành).',
    hint: 'Ngã tư bước đi'
  },
  '来': {
    kanji: '来',
    hanviet: 'LAI',
    parts: [{ radical: '木', meaning: 'Cây lúa' }, { radical: '米', meaning: 'Hạt gạo' }],
    story: 'Bông lúa nặng trĩu hạt báo hiệu mùa gặt sắp đến, tương lai tươi sáng tới (Lai).',
    hint: 'Mùa vụ sắp tới'
  },
  '帰': {
    kanji: '帰',
    hanviet: 'QUY',
    parts: [{ radical: '刂', meaning: 'Dao cắt' }, { radical: '彐', meaning: 'Tay cầm chổi' }, { radical: '巾', meaning: 'Khăn vải' }],
    story: 'Gác lại công việc, cầm chổi quét dọn nhà cửa chuẩn bị trở về quê nhà (Quy).',
    hint: 'Dọn dẹp trở về nhà'
  },
  '食': {
    kanji: '食',
    hanviet: 'THỰC',
    parts: [{ radical: '人', meaning: 'Người / mái nhà' }, { radical: '良', meaning: 'Tốt lành / đồ ngon' }],
    story: 'Dưới mái ấm, con người cùng nhau thưởng thức những món ăn ngon lành (Thực).',
    hint: 'Người ăn đồ ngon lành'
  },
  '飲': {
    kanji: '飲',
    hanviet: 'ẨM',
    parts: [{ radical: '食', meaning: 'Thức ăn' }, { radical: '欠', meaning: 'Há to miệng' }],
    story: 'Sau khi ăn (食), há to miệng (欠) ừng ực uống cạn ly nước mát (Ẩm).',
    hint: 'Ăn no rồi há miệng uống'
  }
};

// Hàm lấy Mnemonic cho bất kỳ Kanji nào (ưu tiên database, nếu chưa có thì phân tích theo bộ thủ)
export function getKanjiMnemonic(kanji: string, fallbackHanviet = '', radicalStr = ''): KanjiMnemonicItem {
  if (KANJI_MNEMONICS_DATA[kanji]) {
    return KANJI_MNEMONICS_DATA[kanji];
  }

  return {
    kanji,
    hanviet: fallbackHanviet || 'HÁN TỰ',
    parts: radicalStr ? [{ radical: radicalStr.split(' ')[0] || 'Bộ', meaning: radicalStr }] : [],
    story: `Chữ Hán mang ý nghĩa ${fallbackHanviet}. Hãy chú ý các nét cấu thành để ghi nhớ lâu hơn.`,
    hint: fallbackHanviet ? `Ghi nhớ âm ${fallbackHanviet}` : undefined
  };
}
