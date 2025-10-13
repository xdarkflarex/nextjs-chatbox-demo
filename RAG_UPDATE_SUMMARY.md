# RAG Database Update Summary

## Date: 2025-10-13 (Updated with proper categorization)

## Overview
Successfully extracted and integrated question-answer data from two Excel files into the RAG database (`rag_all.json`) with proper audience and intent categorization.

## Source Files Processed

### 1. Chatbot_TuVan_TamLy_PH_THCS_40cau.xlsx
- **Target Audience**: Phụ huynh (Parents)
- **Entries Extracted**: 40 questions and answers
- **Topics**: Parenting advice, child psychology, family relationships

### 2. Chatbot_TamLy_THCS_32 cau lan 2.xlsx
- **Target Audience**: Học sinh THCS (Middle School Students)
- **Entries Extracted**: 32 questions and answers
- **Topics**: Student concerns, academic stress, peer relationships, emotional well-being

## Results

### Database Statistics
- **Total Entries**: 140 (previously 68)
- **New Entries Added**: 72
- **Entries by Source**:
  - Text (txt): 22 entries
  - Excel: 118 entries (46 old + 72 new)

### Entry Structure
Each extracted entry includes:
- **id**: Unique identifier (e.g., `xls-TuVan_TamLy_40cau-98bbc22a1b`)
- **title**: Descriptive title with source and row number
- **type**: "scenario"
- **level**: "green" (default)
- **intent**: 
  - `"parenting"` for parent guidance (40 entries)
  - `"student_support"` for student questions (32 entries)
- **audience**: 
  - `"parent"` for parent-targeted content (40 entries)
  - `"student"` for student-targeted content (32 entries)
- **tags**: Auto-generated based on content keywords:
  - `học_tập`: Study/academic related
  - `quan_hệ_bạn_bè`: Peer relationships
  - `gia_đình`: Family matters
  - `cảm_xúc`: Emotional/psychological
  - `công_nghệ`: Technology/digital issues
- **source**: "excel"
- **text**: Combined question and answer in Vietnamese
- **meta**: Additional metadata including:
  - `question`: Original question text
  - `answer`: Original answer text
  - `source_file`: Source Excel file identifier
  - `target_audience`: Original audience from Excel (if available)

## Sample Entries

### From Parent Guidance (40 questions):
**Question**: "Con tôi chơi điện thoại suốt ngày, không chịu học, tôi phải làm sao?"

**Answer**: "Cha mẹ nên đặt quy tắc rõ ràng về thời gian sử dụng điện thoại cùng con, đồng thời tạo hoạt động thay thế như thể thao hoặc cùng học nhóm để giảm lệ thuộc."

### From Student Support (32 questions):
**Question**: "Em muốn trở thành người lạc quan hơn, phải làm sao?"

**Answer**: "Hãy tập thói quen ghi lại điều tốt đẹp mỗi ngày và tìm niềm vui trong việc nhỏ."

## Files Created/Modified

1. **Modified**: `app/public/data/rag_all.json`
   - Updated with 72 new entries
   - Total: 140 entries

2. **Created**: `extract_excel_to_rag.py`
   - Python script for extracting Excel data
   - Handles multiple Excel formats
   - Generates unique IDs for each entry

3. **Created**: `extracted_entries_backup.json`
   - Backup of the 72 newly extracted entries
   - For review and verification purposes

4. **Created**: `verify_rag.py`
   - Verification script to check database integrity
   - Shows statistics and sample entries

## Technical Details

### Dependencies Used
- pandas: For reading Excel files
- openpyxl: Excel file format support
- json: For JSON file operations
- hashlib: For generating unique IDs

### ID Generation
- Format: `xls-{source_name}-{hash}`
- Hash: MD5 hash of question text (first 10 characters)
- Ensures uniqueness and consistency

## Categorization Details

### By Audience
- **parent**: 40 entries (parenting guidance)
- **student**: 32 entries (student support)
- **null**: 68 entries (existing general content)

### By Intent
- **parenting**: 40 entries (parent-specific advice)
- **student_support**: 32 entries (student-specific guidance)
- **study**: 58 entries (general study tips)
- **sleep**: 2 entries
- **conflict**: 1 entry
- **bullying**: 1 entry
- **general**: 6 entries

### Tag Distribution
- **gia_đình**: 43 entries (family-related)
- **học_tập**: 23 entries (academic)
- **quan_hệ_bạn_bè**: 23 entries (peer relationships)
- **cảm_xúc**: 15 entries (emotional/psychological)
- **công_nghệ**: 6 entries (technology/digital)

## Benefits of Categorization

✅ **Efficient Filtering**: Can filter by audience before sending to API
- Example: `const parentEntries = rag.filter(e => e.audience === 'parent')`

✅ **Cost Optimization**: Reduce token usage by sending only relevant context

✅ **Improved Accuracy**: API receives pre-filtered, relevant data

✅ **Better UX**: Can ask "Bạn là học sinh hay phụ huynh?" and provide targeted responses

## Next Steps

1. ✅ Data extraction completed
2. ✅ Database updated with proper categorization
3. ✅ Backup created
4. ✅ Auto-tagging implemented
5. 🔄 Update chatbot to use audience filtering
6. 🔄 Test chatbot with categorized data
7. 🔄 Verify response quality
8. 🔄 Consider adjusting "level" (green/yellow/red) based on content severity

## Implementation Suggestion

In your chatbot API (`app/api/chat/route.js`), you can now filter by audience:

```javascript
// Detect or ask user type
const userType = detectUserType(userMessage); // 'student' or 'parent'

// Filter RAG data by audience
const relevantData = ragData.filter(entry => 
  entry.audience === userType || entry.audience === null
);

// Use filtered data for context
const context = buildContext(relevantData, userMessage);
```

## Notes

- All entries are currently set to "green" level (self-help)
- Some entries may benefit from categorization into "yellow" or "red" levels based on content severity
- Tags are auto-generated based on keyword matching - can be refined manually if needed
- Old Excel entries (Sheet1) remain in database with original structure for backward compatibility
