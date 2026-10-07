import json
import sys
import glob

sys.stdout.reconfigure(encoding='utf-8')

# Check kanji files
print("=== CHECK KANJI FILES ===")
for fp in sorted(glob.glob('src/data/kanji/*.json')):
    with open(fp, 'r', encoding='utf-8') as f:
        data = json.load(f)
    for item in data:
        k = item.get('kanji')
        hv = item.get('hanviet', '')
        if k in ['城', '阪', '込', '匂', '栃', '畑', '枠', '峠', '咲']:
            print(f"{fp}: {k} -> HV: '{hv}', Meanings: {item.get('meanings_vi')}")

print("\n=== CHECK VOCAB FILES FOR HANVIET ===")
for fp in sorted(glob.glob('src/data/vocab/*.json')):
    with open(fp, 'r', encoding='utf-8') as f:
        data = json.load(f)
    count = 0
    with_hv = 0
    for l in data:
        for w in l.get('words', []):
            count += 1
            if w.get('hanviet'):
                with_hv += 1
    print(f"{fp}: {count} words, {with_hv} have hanviet.")
