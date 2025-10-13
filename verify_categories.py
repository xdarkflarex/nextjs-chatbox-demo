import json

# Load the updated RAG file
with open('app/public/data/rag_all.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f"Total entries: {len(data)}\n")

# Count by audience
audiences = {}
for entry in data:
    aud = entry.get('audience', 'null')
    audiences[aud] = audiences.get(aud, 0) + 1

print("=== Entries by Audience ===")
for aud, count in sorted(audiences.items(), key=lambda x: (x[0] is None, x[0])):
    print(f"  {aud}: {count}")

# Count by intent
intents = {}
for entry in data:
    intent = entry.get('intent', 'null')
    intents[intent] = intents.get(intent, 0) + 1

print("\n=== Entries by Intent ===")
for intent, count in sorted(intents.items(), key=lambda x: (x[0] is None, x[0])):
    print(f"  {intent}: {count}")

# Show sample parent entries
parent_entries = [e for e in data if e.get('audience') == 'parent']
print(f"\n=== Sample Parent Entries (Total: {len(parent_entries)}) ===")
for i, entry in enumerate(parent_entries[:3], 1):
    print(f"\n{i}. Title: {entry['title']}")
    print(f"   Audience: {entry['audience']}")
    print(f"   Intent: {entry['intent']}")
    print(f"   Tags: {entry.get('tags', [])}")
    if 'question' in entry.get('meta', {}):
        print(f"   Question: {entry['meta']['question'][:80]}...")

# Show sample student entries
student_entries = [e for e in data if e.get('audience') == 'student']
print(f"\n=== Sample Student Entries (Total: {len(student_entries)}) ===")
for i, entry in enumerate(student_entries[:3], 1):
    print(f"\n{i}. Title: {entry['title']}")
    print(f"   Audience: {entry['audience']}")
    print(f"   Intent: {entry['intent']}")
    print(f"   Tags: {entry.get('tags', [])}")
    if 'question' in entry.get('meta', {}):
        print(f"   Question: {entry['meta']['question'][:80]}...")

# Count tags
all_tags = {}
for entry in data:
    for tag in entry.get('tags', []):
        all_tags[tag] = all_tags.get(tag, 0) + 1

print(f"\n=== Tags Distribution ===")
for tag, count in sorted(all_tags.items(), key=lambda x: x[1], reverse=True):
    print(f"  {tag}: {count}")
