import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import prisma from "@/lib/prisma";
import { z } from "zod";

const settingSchema = z.object({
  key: z.string().min(1),
  value: z.string().min(1),
});

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const settings = await prisma.platformSetting.findMany();
    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const result = settingSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { key, value } = result.data;

    // Validate percentage if commission
    if (key === "COMMISSION_PERCENTAGE") {
      const num = Number(value);
      if (isNaN(num) || num < 0 || num > 50) {
        return NextResponse.json(
          { error: "Commission percentage must be between 0 and 50" },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.platformSetting.upsert({
      where: { key },
      update: { value },
      create: {
        key,
        value,
        description: "Configured via admin control panel",
      },
    });

    return NextResponse.json({
      message: `Setting ${key} updated successfully to ${value}.`,
      setting: updated,
    });
  } catch (error) {
    console.error("Error updating setting:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
