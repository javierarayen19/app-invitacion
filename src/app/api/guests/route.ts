import { NextRequest } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import type { Guest } from "@/types/guest";

const DATA_FILE = path.join(process.cwd(), "data", "guests.json");

async function ensureDataFile() {
  const dir = path.dirname(DATA_FILE);
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, "[]", "utf-8");
  }
}

async function readGuests(): Promise<Guest[]> {
  await ensureDataFile();
  const data = await fs.readFile(DATA_FILE, "utf-8");
  return JSON.parse(data);
}

async function writeGuests(guests: Guest[]) {
  await ensureDataFile();
  await fs.writeFile(DATA_FILE, JSON.stringify(guests, null, 2), "utf-8");
}

export async function GET() {
  const guests = await readGuests();
  return Response.json(guests);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, companions, confirmed } = body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return Response.json(
      { error: "El nombre es obligatorio" },
      { status: 400 }
    );
  }

  const guests = await readGuests();

  const newGuest: Guest = {
    id: crypto.randomUUID(),
    name: name.trim(),
    companions: Math.max(0, Number(companions) || 0),
    confirmed: Boolean(confirmed),
    createdAt: new Date().toISOString(),
  };

  guests.push(newGuest);
  await writeGuests(guests);

  return Response.json(newGuest, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const id = searchParams.get("id");

  if (!id) {
    return Response.json({ error: "Se requiere el ID" }, { status: 400 });
  }

  const guests = await readGuests();
  const filtered = guests.filter((g) => g.id !== id);

  if (filtered.length === guests.length) {
    return Response.json(
      { error: "Invitado no encontrado" },
      { status: 404 }
    );
  }

  await writeGuests(filtered);
  return Response.json({ success: true });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { id, confirmed } = body;

  if (!id) {
    return Response.json({ error: "Se requiere el ID" }, { status: 400 });
  }

  const guests = await readGuests();
  const guest = guests.find((g) => g.id === id);

  if (!guest) {
    return Response.json(
      { error: "Invitado no encontrado" },
      { status: 404 }
    );
  }

  guest.confirmed = Boolean(confirmed);
  await writeGuests(guests);

  return Response.json(guest);
}
