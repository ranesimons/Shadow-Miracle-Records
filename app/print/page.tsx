// app/print/page.tsx  — Server Component
import React from 'react';
import { CatalogCategory } from '@/lib/printful-types';
import CatalogBrowser from '@/app/print/CatalogBrowser';

async function fetchCategories(): Promise<CatalogCategory[]> {
  const token = process.env.PRINTFUL_API_TOKEN;
  const res = await fetch('https://api.printful.com/v2/catalog-categories', {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch categories');
  const body = await res.json();
  const allCats = body.data as CatalogCategory[];
  const mensCats = allCats.filter(cat => /men/i.test(cat.title) || /shirts/i.test(cat.title) || /hoodies/i.test(cat.title) || /wall/i.test(cat.title));
  return mensCats
}

export default async function PrintfulCatalogPage() {
  const categories = await fetchCategories();
  return <CatalogBrowser categories={categories} />;
}
