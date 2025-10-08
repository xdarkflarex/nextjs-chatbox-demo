import { NextResponse } from "next/server";

// Lưu tạm vào bộ nhớ server (chỉ demo, production nên dùng DB)
let chatLogs = [];

export async function POST(req) {
  const { messages } = await req.json();
  // Lưu lại lịch sử chat, chỉ lưu 1 đoạn hội thoại cuối
  chatLogs.push({
    time: new Date().toISOString(),
    messages,
  });
  // Giới hạn số lượng log để tránh tràn bộ nhớ
  if (chatLogs.length > 200) chatLogs.shift();
  return NextResponse.json({ ok: true });
}

export async function GET() {
  // Trả về toàn bộ log (chỉ cho admin)
  return NextResponse.json({ logs: chatLogs });
}

export async function DELETE(req) {
  const { idx } = await req.json();
  if (typeof idx === "number" && idx >= 0 && idx < chatLogs.length) {
    chatLogs.splice(idx, 1);
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ ok: false, error: "Không tìm thấy đoạn chat" }, { status: 400 });
}
