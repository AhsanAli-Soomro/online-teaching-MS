import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const subjects = await prisma.subject.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ subjects });
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return NextResponse.json(
      { error: "Failed to fetch subjects" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const name = body.name?.trim();

    if (!name || name.length < 2) {
      return NextResponse.json(
        { error: "Subject name must be at least 2 characters." },
        { status: 400 }
      );
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    // Find existing by slug or name
    let subject = await prisma.subject.findFirst({
      where: {
        OR: [
          { slug },
          { name: { equals: name, mode: "insensitive" } },
        ],
      },
    });

    if (!subject) {
      subject = await prisma.subject.create({
        data: {
          name,
          slug: `${slug}-${Math.random().toString(36).substring(2, 6)}`,
          category: body.category || "General",
          description: `Courses and tuition for ${name}`,
        },
      });
    }

    return NextResponse.json({ subject }, { status: 201 });
  } catch (error) {
    console.error("Error creating subject:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
