export const runtime = "nodejs";

import { NextResponse } from "next/server";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB
const MAX_TEXT_LENGTH = 12000;

export async function POST(request: Request) {
  try {
    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "NVIDIA_API_KEY is not configured on the server." },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("pdf");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'No PDF file provided. Send a file with field name "pdf".' },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are accepted." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File exceeds the 15 MB size limit." },
        { status: 400 }
      );
    }

    // Extract text from PDF
    const arrayBuffer = await file.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);

    let extractedText: string;
    try {
      const doc = await pdfjsLib.getDocument({
        data: uint8,
        useWorkerFetch: false,
        isEvalSupported: false,
        useSystemFonts: false,
        disableFontFace: true,
      }).promise;

      const textParts: string[] = [];
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items
          .map((item) => ("str" in item ? (item as { str: string }).str : ""))
          .join(" ");
        textParts.push(pageText);
      }
      extractedText = textParts.join("\n").trim();
    } catch (pdfErr: unknown) {
      console.error("PDF parse error:", pdfErr);
      return NextResponse.json(
        { error: "Failed to parse the PDF file." },
        { status: 422 }
      );
    }

    if (!extractedText) {
      return NextResponse.json(
        { error: "The PDF contains no extractable text." },
        { status: 422 }
      );
    }

    const truncatedText =
      extractedText.length > MAX_TEXT_LENGTH
        ? extractedText.slice(0, MAX_TEXT_LENGTH)
        : extractedText;

    // Call NVIDIA API with a 20s timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20_000);

    let nvidiaResponse: Response;
    try {
      nvidiaResponse = await fetch(
        "https://integrate.api.nvidia.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "meta/llama-3.3-70b-instruct",
            messages: [
              {
                role: "system",
                content:
                  'You extract structured learning roadmaps from text. Respond with ONLY a JSON array, no prose, no markdown fences, no explanation.',
              },
              {
                role: "user",
                content: `This text is from a learning roadmap PDF. Extract it into an ordered list of skills/topics a learner should progress through, in the order they should be learned. Each element: {"skill_name": string, "level": "beginner"|"intermediate"|"advanced"}.\n\nText:\n${truncatedText}`,
              },
            ],
            max_tokens: 2048,
            temperature: 0.2,
          }),
          signal: controller.signal,
        }
      );
    } catch (fetchErr: unknown) {
      if (fetchErr instanceof DOMException && fetchErr.name === "AbortError") {
        return NextResponse.json(
          { error: "The AI service took too long to respond. Please try again." },
          { status: 504 }
        );
      }
      throw fetchErr;
    } finally {
      clearTimeout(timeoutId);
    }

    if (!nvidiaResponse.ok) {
      const errBody = await nvidiaResponse.text();
      console.error("NVIDIA API error:", nvidiaResponse.status, errBody);
      return NextResponse.json(
        { error: `NVIDIA API request failed (${nvidiaResponse.status}).` },
        { status: 502 }
      );
    }

    const completion = await nvidiaResponse.json();
    const rawContent: string =
      completion?.choices?.[0]?.message?.content ?? "";

    // Strip markdown fences if present
    let jsonStr = rawContent.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr
        .replace(/^```(?:json)?\s*\n?/, "")
        .replace(/\n?```\s*$/, "");
    }

    let skills: { skill_name: string; level: string }[];
    try {
      skills = JSON.parse(jsonStr);
    } catch {
      console.error("Failed to parse LLM response as JSON:", rawContent);
      return NextResponse.json(
        { error: "The AI response could not be parsed as JSON." },
        { status: 502 }
      );
    }

    if (!Array.isArray(skills) || skills.length === 0) {
      return NextResponse.json(
        { error: "The AI returned an empty or invalid skills list." },
        { status: 502 }
      );
    }

    return NextResponse.json({ skills });
  } catch (err: unknown) {
    console.error("generate-from-pdf error:", err);
    return NextResponse.json(
      { error: (err as Error).message || "Internal server error." },
      { status: 500 }
    );
  }
}
