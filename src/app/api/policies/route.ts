import { NextRequest, NextResponse } from 'next/server';
import { getPolicies, getPolicyBySlug, updatePolicy } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { revalidateCatalog } from '@/lib/revalidate';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (slug) {
      const policy = await getPolicyBySlug(slug);
      if (!policy) {
        return NextResponse.json({ success: false, error: "Política no encontrada" }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: policy });
    }

    const policies = await getPolicies();
    return NextResponse.json({ success: true, data: policies });
  } catch (error) {
    console.error("Error in GET /api/policies:", error);
    return NextResponse.json({ success: false, error: "Error al obtener políticas" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authCheck = await requireAdmin(request);
    if (authCheck instanceof NextResponse) return authCheck;

    const body = await request.json();
    const slug = body.slug;

    if (!slug) {
      return NextResponse.json({ success: false, error: "El slug de la política es requerido" }, { status: 400 });
    }

    const updated = await updatePolicy(slug, {
      title: body.title,
      content: body.content
    });

    revalidateCatalog();

    return NextResponse.json({
      success: true,
      message: "Política actualizada exitosamente",
      data: updated
    });
  } catch (error) {
    console.error("Error in PUT /api/policies:", error);
    return NextResponse.json({ success: false, error: "Error al actualizar la política" }, { status: 500 });
  }
}
