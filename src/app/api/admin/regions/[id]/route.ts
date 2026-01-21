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
    const existing = await prisma.region.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: "Region not found" }, { status: 404 });
    }

    // Check for duplicate slug
    if (data.slug !== existing.slug) {
      const slugExists = await prisma.region.findFirst({
        where: { slug: data.slug, id: { not: id } },
      });

      if (slugExists) {
        return NextResponse.json(
          { error: "A region with this slug already exists" },
          { status: 400 }
        );
      }
    }

    // Prevent circular parent reference
    if (data.parentId === id) {
      return NextResponse.json(
        { error: "A region cannot be its own parent" },
        { status: 400 }
      );
    }

    const region = await prisma.region.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        image: data.image || null,
        parentId: data.parentId || null,
      },
    });

    return NextResponse.json(region);
  } catch (error) {
    console.error("Error updating region:", error);
    return NextResponse.json(
      { error: "Failed to update region" },
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

    // Check if exists and has associated camps or children
    const existing = await prisma.region.findUnique({
      where: { id },
      include: {
        _count: { select: { camps: true, children: true } },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Region not found" }, { status: 404 });
    }

    if (existing._count.camps > 0) {
      return NextResponse.json(
        { error: "Cannot delete region with associated camps" },
        { status: 400 }
      );
    }

    if (existing._count.children > 0) {
      return NextResponse.json(
        { error: "Cannot delete region with child regions. Delete children first." },
        { status: 400 }
      );
    }

    await prisma.region.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting region:", error);
    return NextResponse.json(
      { error: "Failed to delete region" },
      { status: 500 }
    );
  }
}
