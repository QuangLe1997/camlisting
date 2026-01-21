import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    // Check for duplicate slug
    const existing = await prisma.campType.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A camp type with this slug already exists" },
        { status: 400 }
      );
    }

    const campType = await prisma.campType.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        icon: data.icon || null,
      },
    });

    return NextResponse.json(campType);
  } catch (error) {
    console.error("Error creating camp type:", error);
    return NextResponse.json(
      { error: "Failed to create camp type" },
      { status: 500 }
    );
  }
}
