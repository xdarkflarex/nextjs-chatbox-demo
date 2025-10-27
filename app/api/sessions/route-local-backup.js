export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { promises as fs } from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "chat_sessions.json");

async function readSessions() {
  try {
    const data = await fs.readFile(DATA_PATH, "utf8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeSessions(sessions) {
  await fs.writeFile(DATA_PATH, JSON.stringify(sessions, null, 2), "utf8");
}

export async function POST(req) {
  const { sessionId, messages } = await req.json();
  let sessions = await readSessions();
  if (!sessionId) {
    const newSession = {
      id: uuidv4(),
      time: new Date().toISOString(),
      messages,
    };
    sessions.push(newSession);
    await writeSessions(sessions);
    return NextResponse.json({ ok: true, sessionId: newSession.id });
  } else {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      session.messages = messages;
      await writeSessions(sessions);
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ ok: false, error: "Session not found" }, { status: 404 });
  }
}

export async function GET() {
  const sessions = await readSessions();
  return NextResponse.json({ sessions });
}

export async function DELETE(req) {
  const { id } = await req.json();
  let sessions = await readSessions();
  const idx = sessions.findIndex(s => s.id === id);
  if (idx !== -1) {
    sessions.splice(idx, 1);
    await writeSessions(sessions);
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ ok: false, error: "Session not found" }, { status: 404 });
}
