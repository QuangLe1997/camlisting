import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const data = await request.json();

    // Check if exists
    const existing = await prisma.campType.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json(
        { error: "Camp type not found" },
        { status: 404 }
      );
    }

    // Check for duplicate slug
    if (data.slug !== existing.slug) {
      const slugExists = await prisma.campType.findFirst({
        where: { slug: data.slug, id: { not: id } },
      });

      if (slugExists) {
        return NextResponse.json(
          { error: "A camp type with this slug already exists" },
          { status: 400 }
        );
      }
    }

    const campType = await prisma.campType.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        icon: data.icon || null,
      },
    });

    return NextResponse.json(campType);
  } catch (error) {
    console.error("Error updating camp type:", error);
    return NextResponse.json(
      { error: "Failed to update camp type" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if exists and has associated camps
    const existing = await prisma.campType.findUnique({
      where: { id },
      include: { _count: { select: { camps: true } } },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Camp type not found" },
        { status: 404 }
      );
    }

    if (existing._count.camps > 0) {
      return NextResponse.json(
        { error: "Cannot delete camp type with associated camps" },
        { status: 400 }
      );
    }

    await prisma.campType.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting camp type:", error);
    return NextResponse.json(
      { error: "Failed to delete camp type" },
      { status: 500 }
    );
  }
}
