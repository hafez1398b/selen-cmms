import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";

export async function GET(req: NextRequest) {
  try {
    const filePath = path.join(process.cwd(), "public", "downloads", "selen-cmms-v2.2.zip");
    const stats = await stat(filePath);
    const buffer = await readFile(filePath);

    return new NextResponse(buffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="selen-cmms-v2.2.zip"',
        "Content-Length": stats.size.toString(),
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
