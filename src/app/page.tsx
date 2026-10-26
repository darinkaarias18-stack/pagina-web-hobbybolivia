import { getSiteConfig, getCategories, getOccasions, getCatalogItems, getBanners, getPolicies } from '@/lib/db';
import { CatalogView } from '@/components/catalog/CatalogView';

export default async function HomePage() {
  const [config, categories, occasions, items, banners, policies] = await Promise.all([
    getSiteConfig(),
    getCategories(),
    getOccasions(),
    getCatalogItems(),
    getBanners(),
    getPolicies()
  ]);

  return (
    <CatalogView
      initialConfig={config}
      initialCategories={categories}
      initialOccasions={occasions}
      initialItems={items}
      initialBanners={banners}
      initialPolicies={policies}
    />
  );
}
