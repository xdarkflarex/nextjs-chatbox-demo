import json

# Load the updated RAG file
with open('app/public/data/rag_all.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f"Total entries in rag_all.json: {len(data)}")

# Count entries by source
sources = {}
for entry in data:
    source = entry.get('source', 'unknown')
    sources[source] = sources.get(source, 0) + 1

print("\nEntries by source:")
for source, count in sources.items():
    print(f"  {source}: {count}")

# Show some sample entries from Excel files
excel_entries = [e for e in data if e.get('source') == 'excel']
print(f"\nTotal Excel entries: {len(excel_entries)}")

print("\n=== Sample Excel Entries ===")
for i, entry in enumerate(excel_entries[:3], 1):
    print(f"\n{i}. Title: {entry['title']}")
    if 'question' in entry.get('meta', {}):
        print(f"   Question: {entry['meta']['question'][:100]}...")
        print(f"   Answer: {entry['meta']['answer'][:100]}...")
    else:
        print(f"   Text: {entry.get('text', '')[:150]}...")

print("\n=== Last 3 Excel Entries ===")
for i, entry in enumerate(excel_entries[-3:], 1):
    print(f"\n{i}. Title: {entry['title']}")
    if 'question' in entry.get('meta', {}):
        print(f"   Question: {entry['meta']['question'][:100]}...")
        print(f"   Answer: {entry['meta']['answer'][:100]}...")
    else:
        print(f"   Text: {entry.get('text', '')[:150]}...")
