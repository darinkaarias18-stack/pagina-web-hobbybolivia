import { connection } from 'next/server';
import { getSiteConfig, getCategories, getOccasions, getCatalogItems, getBanners, getPolicies } from '@/lib/db';
import { getExchangeRateConfig } from '@/lib/exchange-rate';
import { CatalogView } from '@/components/catalog/CatalogView';

export const instant = false;

export default async function HomePage() {
  await connection();
  const [config, categories, occasions, items, banners, policies, rateConfig] = await Promise.all([
    getSiteConfig(),
    getCategories(),
    getOccasions(),
    getCatalogItems(),
    getBanners(),
    getPolicies(),
    getExchangeRateConfig().catch(() => ({ exchangeRate: 6.96 }))
  ]);

  return (
    <CatalogView
      initialConfig={config}
      initialCategories={categories}
      initialOccasions={occasions}
      initialItems={items}
      initialBanners={banners}
      initialPolicies={policies}
      initialExchangeRate={rateConfig?.exchangeRate || 6.96}
    />
  );
}
