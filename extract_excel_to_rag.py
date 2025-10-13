import pandas as pd
import json
import hashlib

def generate_id(prefix, text):
    """Generate a unique ID based on text content"""
    hash_obj = hashlib.md5(text.encode())
    return f"{prefix}-{hash_obj.hexdigest()[:10]}"

def extract_excel_data(file_path, source_name, audience_type="student", intent_type="general"):
    """Extract questions and answers from Excel file"""
    try:
        # Read Excel file
        df = pd.read_excel(file_path)
        
        # Print column names to understand structure
        print(f"\n=== Processing: {file_path} ===")
        print(f"Columns: {df.columns.tolist()}")
        print(f"Number of rows: {len(df)}")
        print(f"Audience: {audience_type}, Intent: {intent_type}")
        
        entries = []
        
        # Process each row
        for idx, row in df.iterrows():
            # Skip header rows or empty rows
            if pd.isna(row.iloc[0]) or str(row.iloc[0]).strip() == '':
                continue
            
            # Try to identify question and answer columns
            # Common patterns: "Câu hỏi", "Question", "Tình huống", etc.
            question = None
            answer = None
            situation_type = None
            target_audience = None
            
            # Check each column for question/answer patterns
            for col in df.columns:
                col_lower = str(col).lower()
                value = str(row[col]).strip() if pd.notna(row[col]) else ""
                
                if not value or value == 'nan':
                    continue
                
                # Identify question column
                if any(keyword in col_lower for keyword in ['câu hỏi', 'question', 'tình huống', 'situation']):
                    question = value
                
                # Identify answer column
                elif any(keyword in col_lower for keyword in ['trả lời', 'answer', 'hướng dẫn', 'guide', 'giải pháp', 'solution']):
                    answer = value
                
                # Identify type/category
                elif any(keyword in col_lower for keyword in ['loại', 'type', 'phân loại', 'category']):
                    situation_type = value
                
                # Identify target audience from Excel
                elif any(keyword in col_lower for keyword in ['người dùng', 'mục tiêu', 'target', 'audience']):
                    target_audience = value
            
            # If we found both question and answer, create entry
            if question and answer:
                entry_id = generate_id(f"xls-{source_name}", question)
                
                # Auto-generate tags based on content
                tags = []
                question_lower = question.lower()
                if any(word in question_lower for word in ['học', 'thi', 'điểm', 'bài']):
                    tags.append('học_tập')
                if any(word in question_lower for word in ['bạn', 'bè', 'lớp']):
                    tags.append('quan_hệ_bạn_bè')
                if any(word in question_lower for word in ['bố', 'mẹ', 'cha', 'con', 'gia đình']):
                    tags.append('gia_đình')
                if any(word in question_lower for word in ['lo', 'sợ', 'căng thẳng', 'áp lực', 'buồn']):
                    tags.append('cảm_xúc')
                if any(word in question_lower for word in ['game', 'điện thoại', 'mạng']):
                    tags.append('công_nghệ')
                
                entry = {
                    "id": entry_id,
                    "title": f"{source_name} - Row {idx + 2}",
                    "type": "scenario",
                    "level": "green",  # Default level
                    "intent": intent_type,
                    "audience": audience_type,
                    "tags": tags,
                    "source": "excel",
                    "text": f"Câu hỏi: {question}\n\nHướng dẫn trả lời: {answer}",
                    "meta": {
                        "question": question,
                        "answer": answer,
                        "source_file": source_name
                    }
                }
                
                if situation_type:
                    entry["meta"]["situation_type"] = situation_type
                
                if target_audience:
                    entry["meta"]["target_audience"] = target_audience
                
                entries.append(entry)
                print(f"  ✓ Extracted row {idx + 2}: {question[:50]}...")
        
        return entries
    
    except Exception as e:
        print(f"Error processing {file_path}: {str(e)}")
        return []

def main():
    # File paths
    file1 = r"d:\Minh_Tin_hoc\nextjs-chatbox-demo\Chatbot_TuVan_TamLy_PH_THCS_40cau.xlsx"
    file2 = r"d:\Minh_Tin_hoc\nextjs-chatbox-demo\Chatbot_TamLy_THCS_32 cau lan 2.xlsx"
    rag_file = r"d:\Minh_Tin_hoc\nextjs-chatbox-demo\app\public\data\rag_all.json"
    
    # Extract data from both Excel files with proper audience and intent
    # File 1: Parent guidance (Phụ huynh)
    entries1 = extract_excel_data(
        file1, 
        "TuVan_TamLy_40cau",
        audience_type="parent",
        intent_type="parenting"
    )
    
    # File 2: Student support (Học sinh)
    entries2 = extract_excel_data(
        file2, 
        "TamLy_32cau",
        audience_type="student",
        intent_type="student_support"
    )
    
    # Combine all entries
    all_new_entries = entries1 + entries2
    
    print(f"\n=== Summary ===")
    print(f"Extracted {len(entries1)} entries from file 1")
    print(f"Extracted {len(entries2)} entries from file 2")
    print(f"Total new entries: {len(all_new_entries)}")
    
    # Load existing RAG data
    try:
        with open(rag_file, 'r', encoding='utf-8') as f:
            existing_data = json.load(f)
        print(f"Loaded {len(existing_data)} existing entries from rag_all.json")
    except Exception as e:
        print(f"Error loading existing RAG file: {e}")
        existing_data = []
    
    # Remove old Excel entries from the same sources to avoid duplicates
    filtered_data = [
        entry for entry in existing_data 
        if not (entry.get('source') == 'excel' and 
                entry.get('meta', {}).get('source_file') in ['TuVan_TamLy_40cau', 'TamLy_32cau'])
    ]
    
    print(f"Removed {len(existing_data) - len(filtered_data)} old entries from these sources")
    
    # Combine with new entries
    updated_data = filtered_data + all_new_entries
    
    # Save updated RAG data
    try:
        with open(rag_file, 'w', encoding='utf-8') as f:
            json.dump(updated_data, f, ensure_ascii=False, indent=2)
        print(f"\n✓ Successfully updated rag_all.json with {len(updated_data)} total entries")
    except Exception as e:
        print(f"Error saving RAG file: {e}")
    
    # Save a backup with just the new entries for review
    backup_file = r"d:\Minh_Tin_hoc\nextjs-chatbox-demo\extracted_entries_backup.json"
    with open(backup_file, 'w', encoding='utf-8') as f:
        json.dump(all_new_entries, f, ensure_ascii=False, indent=2)
    print(f"✓ Saved backup of new entries to extracted_entries_backup.json")

if __name__ == "__main__":
    main()
