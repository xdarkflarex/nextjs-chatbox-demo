"use client";
import { useEffect, useState } from "react";

export default function RagFAQ() {
  const [faq, setFaq] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/public/data/rag_all.json")
      .then((res) => res.json())
      .then((data) => {
        // Lọc các dòng là câu hỏi thường gặp từ Excel
        const faqs = data.filter(
          (item) => item.type === "row" && item.text && item.text.includes("Câu hỏi thường gặp")
        ).map((item) => {
          // Tách câu hỏi và câu trả lời mẫu
          const qMatch = item.text.match(/Câu hỏi thường gặp:([^\n]+)/);
          const aMatch = item.text.match(/Câu trả lời mẫu:([^\n]+)/);
          return {
            question: qMatch ? qMatch[1].trim() : "",
            answer: aMatch ? aMatch[1].trim() : "",
            audience: item.audience || "",
          };
        });
        setFaq(faqs);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-4">Đang tải dữ liệu…</div>;

  return (
    <div className="max-w-2xl mx-auto my-8 bg-white rounded-xl shadow-lg border-2 border-blue-200 p-6">
      <h2 className="text-xl font-bold text-blue-700 mb-4">Câu hỏi thường gặp (RAG)</h2>
      <div className="space-y-4">
        {faq.map((item, idx) => (
          <div key={idx} className="p-4 rounded-lg bg-blue-50 border border-blue-100">
            <div className="font-semibold text-blue-800 mb-2">{item.question}</div>
            <div className="text-blue-700">{item.answer}</div>
            {item.audience && <div className="text-xs text-gray-500 mt-2">Đối tượng: {item.audience}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
