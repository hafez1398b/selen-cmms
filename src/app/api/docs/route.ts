import { NextRequest, NextResponse } from "next/server";
import { readFile, readdir } from "fs/promises";
import path from "path";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const file = url.searchParams.get("file");

  const docsPath = path.join(process.cwd(), "docs");

  try {
    if (file) {
      const filePath = path.join(docsPath, file);
      if (!filePath.startsWith(docsPath)) {
        return NextResponse.json({ ok: false, error: "Invalid path" }, { status: 400 });
      }
      const content = await readFile(filePath, "utf-8");
      return NextResponse.json({ ok: true, content });
    }

    const files = await readdir(docsPath);
    const mdFiles = files.filter(f => f.endsWith(".md")).sort();
    return NextResponse.json({ ok: true, files: mdFiles });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
