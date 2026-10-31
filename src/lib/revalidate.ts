import { revalidatePath } from 'next/cache';

/**
 * Revalida de forma instantánea la caché en Next.js para el catálogo público
 * y los paneles de administración tras cualquier mutación de productos,
 * precios, stock, imágenes, categorías o configuración.
 */
export function revalidateCatalog(): void {
  try {
    revalidatePath('/', 'page');
    revalidatePath('/admin', 'page');
    revalidatePath('/admin/products', 'page');
    revalidatePath('/admin/categories', 'page');
    revalidatePath('/admin/currency', 'page');
    revalidatePath('/admin/settings', 'page');
  } catch (error) {
    // No-op si se invoca fuera del ciclo de request de Next.js (ej. scripts o tests)
    console.warn('[Cache Revalidation Info]:', error instanceof Error ? error.message : error);
  }
}

