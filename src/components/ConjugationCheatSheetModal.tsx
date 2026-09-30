import React, { useState } from 'react';
import { X, BookOpen, Sparkles, CheckCircle2, ChevronRight, Layers } from 'lucide-react';

interface ConjugationCheatSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConjugationCheatSheetModal: React.FC<ConjugationCheatSheetModalProps> = ({ isOpen, onClose }) => {
  const [selectedTab, setSelectedTab] = useState<'te' | 'nai' | 'ta' | 'potential' | 'passive' | 'causative' | 'ba' | 'volitional'>('te');

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl bg-white dark:bg-[#111c30] rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Bảng Quy Tắc Chia Thể Động Từ & Tính Từ
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cẩm nang tra cứu nhanh các quy tắc biến đổi ngữ pháp từ N5 đến N3
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Selector Tabs */}
        <div className="px-4 sm:px-6 pt-3 flex items-center space-x-1.5 overflow-x-auto border-b border-slate-100 dark:border-slate-800 pb-2 scrollbar-none">
          {[
            { id: 'te', label: 'Thể て (Nối/Yêu cầu)' },
            { id: 'nai', label: 'Thể ない (Phủ định)' },
            { id: 'ta', label: 'Thể た (Quá khứ)' },
            { id: 'potential', label: 'Thể Khả năng (える)' },
            { id: 'passive', label: 'Thể Bị động (られる)' },
            { id: 'causative', label: 'Thể Sai khiến (させる)' },
            { id: 'ba', label: 'Thể Điều kiện (ば)' },
            { id: 'volitional', label: 'Thể Ý chí (よう)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedTab === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {/* 1. THỂ TE */}
          {selectedTab === 'te' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/40">
                <h4 className="font-bold text-blue-900 dark:text-blue-300 flex items-center space-x-1.5 text-sm mb-1">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>Ý nghĩa Thể て (Te-form)</span>
                </h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Dùng để liên kết các hành động theo trình tự, kết hợp với các mẫu câu: <strong>〜てください</strong> (hãy làm gì), <strong>〜ています</strong> (đang làm gì), <strong>〜てもいいです</strong> (được phép làm gì), <strong>〜てはいけません</strong> (không được làm gì).
                </p>
              </div>

              {/* Nhóm 1 */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-2.5">
                <span className="font-extrabold text-blue-600 dark:text-sky-400 text-xs uppercase tracking-wider block">
                  1. Động từ Nhóm 1 (Godan - Ngũ đoạn)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                    <strong className="text-slate-900 dark:text-white block font-bold">Đuôi [う, つ, る] ➔ って</strong>
                    <span className="text-slate-500 dark:text-slate-400 mt-1 block">
                      買う ➔ <strong>買って</strong>, 待つ ➔ <strong>待って</strong>, 帰る ➔ <strong>帰って</strong>
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                    <strong className="text-slate-900 dark:text-white block font-bold">Đuôi [む, ぶ, ぬ] ➔ んで</strong>
                    <span className="text-slate-500 dark:text-slate-400 mt-1 block">
                      飲む ➔ <strong>飲んで</strong>, 遊ぶ ➔ <strong>遊んで</strong>, 死ぬ ➔ <strong>死んで</strong>
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                    <strong className="text-slate-900 dark:text-white block font-bold">Đuôi [く] ➔ いて (Ngoại lệ: 行く ➔ 行って)</strong>
                    <span className="text-slate-500 dark:text-slate-400 mt-1 block">
                      書く ➔ <strong>書いて</strong>, 聞く ➔ <strong>聞いて</strong>
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                    <strong className="text-slate-900 dark:text-white block font-bold">Đuôi [ぐ] ➔ いで & Đuôi [す] ➔ して</strong>
                    <span className="text-slate-500 dark:text-slate-400 mt-1 block">
                      泳ぐ ➔ <strong>泳いで</strong>, 話す ➔ <strong>話して</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Nhóm 2 & Nhóm 3 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-1.5">
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-xs uppercase tracking-wider block">
                    2. Động từ Nhóm 2 (Ichidan)
                  </span>
                  <p className="text-slate-700 dark:text-slate-300">
                    Bỏ đuôi <strong>[る]</strong> thêm <strong>[て]</strong>:
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 font-semibold">
                    食べる ➔ <strong>食べて</strong>, 見る ➔ <strong>見て</strong>, 起きる ➔ <strong>起きて</strong>
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-1.5">
                  <span className="font-extrabold text-purple-600 dark:text-purple-400 text-xs uppercase tracking-wider block">
                    3. Động từ Nhóm 3 (Bất quy tắc)
                  </span>
                  <p className="text-slate-700 dark:text-slate-300">
                    Bất quy tắc (học thuộc lòng):
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 font-semibold">
                    する ➔ <strong>して</strong>, 来る (くる) ➔ <strong>来て (きて)</strong>
                  </p>
                </div>
              </div>

              {/* Tính từ */}
              <div className="rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 p-4 space-y-1.5">
                <span className="font-bold text-amber-800 dark:text-amber-300 text-xs uppercase tracking-wider block">
                  🌟 Mở rộng: Tính từ thể Nối câu
                </span>
                <p className="text-slate-700 dark:text-slate-300">
                  • <strong>Tính từ đuôi い:</strong> Bỏ [い] + <strong>くて</strong> (高い ➔ <strong>高くて</strong>; Ngoại lệ: いい ➔ <strong>よくて</strong>)<br />
                  • <strong>Tính từ đuôi な:</strong> Thêm <strong>で</strong> (静か ➔ <strong>静かで</strong>, 元気 ➔ <strong>元気で</strong>)
                </p>
              </div>
            </div>
          )}

          {/* 2. THỂ NAI */}
          {selectedTab === 'nai' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/40">
                <h4 className="font-bold text-rose-900 dark:text-rose-300 flex items-center space-x-1.5 text-sm mb-1">
                  <Sparkles className="w-4 h-4 text-rose-600" />
                  <span>Ý nghĩa Thể ない (Nai-form / Phủ định)</span>
                </h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Thể ngắn của <strong>〜ません</strong> (không làm gì), dùng trong các cấu trúc: <strong>〜ないでください</strong> (xin đừng làm gì), <strong>〜なければなりません</strong> (phải làm gì), <strong>〜なくてもいいです</strong> (không cần làm gì cũng được).
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-2">
                <span className="font-bold text-blue-600 text-xs uppercase">1. Nhóm 1: Đổi âm cột [u] ➔ cột [a] + ない</span>
                <p className="text-slate-600 dark:text-slate-400">
                  • <strong>う ➔ わ:</strong> 買う ➔ <strong>買わない</strong>, 会う ➔ <strong>会わない</strong><br />
                  • <strong>く ➔ か:</strong> 書く ➔ <strong>書かない</strong>, 行く ➔ <strong>行かない</strong><br />
                  • <strong>ぐ ➔ が:</strong> 泳ぐ ➔ <strong>泳がない</strong><br />
                  • <strong>す ➔ さ:</strong> 話す ➔ <strong>話さない</strong><br />
                  • <strong>つ ➔ た:</strong> 待つ ➔ <strong>待たない</strong><br />
                  • <strong>む ➔ ま:</strong> 飲む ➔ <strong>飲まない</strong><br />
                  • <strong>る ➔ ら:</strong> 帰る ➔ <strong>帰らない</strong>, 取る ➔ <strong>取らない</strong>
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-1">
                  <span className="font-bold text-emerald-600 text-xs uppercase">2. Nhóm 2: Bỏ [る] + ない</span>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    食べる ➔ <strong>食べない</strong><br />
                    見る ➔ <strong>見ない</strong><br />
                    起きる ➔ <strong>起きない</strong>
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-1">
                  <span className="font-bold text-purple-600 text-xs uppercase">3. Nhóm 3: Bất quy tắc</span>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    する ➔ <strong>しない</strong><br />
                    来る (くる) ➔ <strong>来ない (こない)</strong>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 3. THỂ TA */}
          {selectedTab === 'ta' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40">
                <h4 className="font-bold text-amber-900 dark:text-amber-300 text-sm mb-1">
                  💡 Quy tắc vàng Thể た (Quá khứ / Kinh nghiệm)
                </h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  <strong>Cách chia Thể た giống hệt Thể て!</strong> Chỉ cần thay đuôi:
                  <br />• <strong>[て] ➔ [た]</strong>
                  <br />• <strong>[で] ➔ [だ]</strong>
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-2">
                <span className="font-bold text-slate-900 dark:text-white block">Ví dụ đối chiếu:</span>
                <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
                  <div>行って ➔ <strong>行った (Đã đi)</strong></div>
                  <div>飲んで ➔ <strong>飲んだ (Đã uống)</strong></div>
                  <div>買って ➔ <strong>買った (Đã mua)</strong></div>
                  <div>遊んで ➔ <strong>遊んだ (Đã chơi)</strong></div>
                  <div>食べて ➔ <strong>食べた (Đã ăn)</strong></div>
                  <div>して ➔ <strong>した (Đã làm)</strong></div>
                  <div>見て ➔ <strong>見た (Đã xem)</strong></div>
                  <div>来て ➔ <strong>来た [きた] (Đã đến)</strong></div>
                </div>
              </div>
            </div>
          )}

          {/* 4. KHẢ NĂNG */}
          {selectedTab === 'potential' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/40">
                <h4 className="font-bold text-emerald-900 dark:text-emerald-300 text-sm mb-1">
                  Thể Khả năng (Potential Form - Có thể làm gì)
                </h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Thay thế cho cấu trúc <strong>〜ことができます</strong>. Trợ từ <strong>[を]</strong> thường được đổi thành <strong>[が]</strong> (Ví dụ: 日本語が話せる).
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <strong className="text-blue-600 block">Nhóm 1: Đổi âm cột [u] ➔ cột [e] + る</strong>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    書く ➔ <strong>書ける</strong>, 飲む ➔ <strong>飲める</strong>, 話す ➔ <strong>話せる</strong>, 行く ➔ <strong>行ける</strong>, 買う ➔ <strong>買える</strong>
                  </p>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <strong className="text-emerald-600 block">Nhóm 2: Bỏ [る] + られる</strong>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    食べる ➔ <strong>食べられる</strong>, 見る ➔ <strong>見られる</strong>, 起きる ➔ <strong>起きられる</strong>
                  </p>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <strong className="text-purple-600 block">Nhóm 3: Bất quy tắc</strong>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    する ➔ <strong>できる</strong>, 来る (くる) ➔ <strong>来られる (こられる)</strong>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 5. BỊ ĐỘNG */}
          {selectedTab === 'passive' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/40">
                <h4 className="font-bold text-indigo-900 dark:text-indigo-300 text-sm mb-1">
                  Thể Bị động (Passive Form - Bị / Được làm)
                </h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Biểu thị hành động bị hoặc được người khác tác động vào (Người tác động đi với trợ từ に).
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <strong className="text-blue-600 block">Nhóm 1: Đổi âm cột [u] ➔ cột [a] + れる</strong>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    叱る (mắng) ➔ <strong>叱られる (bị mắng)</strong>, 褒める ➔ <strong>褒められる</strong>, 踏む ➔ <strong>踏まれる</strong>
                  </p>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <strong className="text-emerald-600 block">Nhóm 2: Bỏ [る] + られる</strong>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    食べる ➔ <strong>食べられる</strong>, 捨てる ➔ <strong>捨てられる</strong>
                  </p>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <strong className="text-purple-600 block">Nhóm 3: Bất quy tắc</strong>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    する ➔ <strong>される</strong>, 来る (くる) ➔ <strong>来られる (こられる)</strong>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 6. SAI KHIẾN */}
          {selectedTab === 'causative' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-purple-50/80 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-900/40">
                <h4 className="font-bold text-purple-900 dark:text-purple-300 text-sm mb-1">
                  Thể Sai khiến (Causative Form - Bắt / Cho phép làm)
                </h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Dùng khi người trên bảo người dưới làm việc gì, hoặc xin phép cho mình làm gì (〜させてください).
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <strong className="text-blue-600 block">Nhóm 1: Đổi âm cột [u] ➔ cột [a] + せる</strong>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    行く ➔ <strong>行かせる</strong>, 飲む ➔ <strong>飲ませる</strong>, 待つ ➔ <strong>待たせる</strong>
                  </p>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <strong className="text-emerald-600 block">Nhóm 2: Bỏ [る] + させる</strong>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    食べる ➔ <strong>食べさせる</strong>, 見る ➔ <strong>見させる</strong>
                  </p>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <strong className="text-purple-600 block">Nhóm 3: Bất quy tắc</strong>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    する ➔ <strong>させる</strong>, 来る (くる) ➔ <strong>来させる (こさせる)</strong>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 7. ĐIỀU KIỆN BA */}
          {selectedTab === 'ba' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-teal-50/80 dark:bg-teal-950/30 border border-teal-200/80 dark:border-teal-900/40">
                <h4 className="font-bold text-teal-900 dark:text-teal-300 text-sm mb-1">
                  Thể Điều kiện ば (Ba-form - Nếu... thì...)
                </h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Dùng để giả định một điều kiện tất yếu hoặc lời khuyên: <strong>どうすればいいですか</strong> (Tôi nên làm thế nào thì tốt?).
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <strong className="text-blue-600 block">Động từ Nhóm 1: Đổi cột [u] ➔ [e] + ば</strong>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    書く ➔ <strong>書けば</strong>, 飲む ➔ <strong>飲めば</strong>, 待つ ➔ <strong>待てば</strong>, 行く ➔ <strong>行けば</strong>
                  </p>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <strong className="text-emerald-600 block">Động từ Nhóm 2: Bỏ [る] + れば</strong>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    食べる ➔ <strong>食べれば</strong>, 見る ➔ <strong>見れば</strong>
                  </p>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <strong className="text-purple-600 block">Động từ Nhóm 3:</strong>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    する ➔ <strong>すれば</strong>, 来る (くる) ➔ <strong>来れば (くれば)</strong>
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
                  <strong className="text-amber-800 dark:text-amber-300 block">Tính từ:</strong>
                  <p className="text-slate-600 dark:text-slate-300 mt-1">
                    • Tính từ い: Bỏ [い] + <strong>ければ</strong> (安ければ, よければ)<br />
                    • Tính từ な: + <strong>なら</strong> (静かなら)
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 8. Ý CHÍ */}
          {selectedTab === 'volitional' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-orange-50/80 dark:bg-orange-950/30 border border-orange-200/80 dark:border-orange-900/40">
                <h4 className="font-bold text-orange-900 dark:text-orange-300 text-sm mb-1">
                  Thể Ý chí (Volitional Form - Cùng làm nhé / Dự định làm)
                </h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Thể thông thường của <strong>〜ましょう</strong>. Dùng khi rủ rê bạn bè thân mật hoặc cấu trúc <strong>〜ようと思います</strong> (dự định làm gì).
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <strong className="text-blue-600 block">Nhóm 1: Đổi âm cột [u] ➔ cột [o] + う</strong>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    行く ➔ <strong>行こう</strong>, 飲む ➔ <strong>飲もう</strong>, 話す ➔ <strong>話そう</strong>, 買う ➔ <strong>買おう</strong>
                  </p>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <strong className="text-emerald-600 block">Nhóm 2: Bỏ [る] + よう</strong>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    食べる ➔ <strong>食べよう</strong>, 見る ➔ <strong>見よう</strong>, 寝る ➔ <strong>寝よう</strong>
                  </p>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <strong className="text-purple-600 block">Nhóm 3: Bất quy tắc</strong>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    する ➔ <strong>しよう</strong>, 来る (くる) ➔ <strong>来よう (こよう)</strong>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">Ngữ pháp Minna no Nihongo chuẩn N5 - N3</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-500 transition"
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  );
};
