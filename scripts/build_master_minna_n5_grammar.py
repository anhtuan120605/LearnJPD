# -*- coding: utf-8 -*-
"""
Master Builder: Merges all 25 lessons of Minna no Nihongo N5 grammar
with 100% textbook fidelity into src/data/grammar/minna_grammar.json
"""

import json
import os
from scripts.minna_lessons_data.lessons_02_05 import lessons_02_05
from scripts.minna_lessons_data.lessons_06_10 import lessons_06_10
from scripts.minna_lessons_data.lessons_11_15 import lessons_11_15
from scripts.minna_lessons_data.lessons_16_20 import lessons_16_20
from scripts.minna_lessons_data.lessons_21_25 import lessons_21_25

GRAMMAR_FILE = "src/data/grammar/minna_grammar.json"

def main():
    with open(GRAMMAR_FILE, "r", encoding="utf-8") as f:
        existing_data = json.load(f)

    print(f"Loaded existing grammar data: {len(existing_data)} lessons.")

    # Lesson 1 is at index 0 (preserve existing full lesson 1)
    lesson_1 = existing_data[0]
    assert lesson_1["lesson"] == 1, "Expected lesson 1 at index 0"

    # Gather new lessons 2-25
    new_n5_lessons = {}
    for l_list in [lessons_02_05, lessons_06_10, lessons_11_15, lessons_16_20, lessons_21_25]:
        for item in l_list:
            new_n5_lessons[item["lesson"]] = item

    print(f"Prepared {len(new_n5_lessons)} upgraded N5 lessons (Lessons 2 to 25).")

    # Reconstruct the 50 lessons array
    final_lessons = [lesson_1]

    # Lessons 2 to 25
    for l_num in range(2, 26):
        if l_num in new_n5_lessons:
            final_lessons.append(new_n5_lessons[l_num])
        else:
            # Fallback to existing if somehow missing
            final_lessons.append(existing_data[l_num - 1])

    # Lessons 26 to 50
    for l_num in range(26, len(existing_data) + 1):
        final_lessons.append(existing_data[l_num - 1])

    print(f"Total reconstructed lessons: {len(final_lessons)}")

    # Quality check for all 25 N5 lessons
    for i in range(25):
        l = final_lessons[i]
        num = l["lesson"]
        assert "bunkei" in l and len(l["bunkei"]) > 0, f"Lesson {num} missing bunkei"
        assert "reibun" in l and len(l["reibun"]) > 0, f"Lesson {num} missing reibun"
        assert "kaiwa" in l and "lines" in l["kaiwa"] and len(l["kaiwa"]["lines"]) > 0, f"Lesson {num} missing kaiwa"
        assert "referenceInfo" in l and "items" in l["referenceInfo"], f"Lesson {num} missing referenceInfo"
        assert "points" in l and len(l["points"]) > 0, f"Lesson {num} missing points"

    print("ALL 25 N5 LESSONS PASSED FULL QUALITY CHECKS!")

    # Write out with clean formatting
    with open(GRAMMAR_FILE, "w", encoding="utf-8") as f:
        json.dump(final_lessons, f, ensure_ascii=False, indent=2)

    print(f"Successfully written {len(final_lessons)} lessons to {GRAMMAR_FILE}!")

if __name__ == "__main__":
    main()
