'use client';

import React, { useState, useEffect } from 'react';
import { CatalogCategory, CatalogProduct } from '@/lib/printful-types';

type ApiCatalogProductsResponse = { products?: unknown };

type CatalogVariant = {
  id: number;
  catalog_product_id: number;
  name: string;
  size: string;
  // other variant-specific fields
};

interface CostEstimate {
  subtotal: number;
  shipping: number;
  total: number;
  currency: string;
  additional_fee: number;
  digitization: number;
  discount: number;
  fulfillment_fee: number;
  retail_delivery_fee: number;
  tax: number;
  vat: number;
}

interface Props {
  categories: CatalogCategory[];
}

export default function CatalogBrowser({ categories }: Props) {
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // track variants per product ID
  const [variantsMap, setVariantsMap] = useState<Record<number, CatalogVariant[]>>({});
  const [loadingVariants, setLoadingVariants] = useState<Record<number, boolean>>({});

  // track cost estimates per variant ID
  const [costMap, setCostMap] = useState<Record<number, CostEstimate>>({});
  const [loadingCost, setLoadingCost] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (categoryId === '') {
      setProducts([]);
      return;
    }
    const controller = new AbortController();
    async function fetchProducts() {
      setLoading(true);
      setError(null);
      try {
        const resp = await fetch(
          `/api/printful/catalog-products?category_id=${categoryId}`,
          { signal: controller.signal }
        );
        if (!resp.ok) throw new Error(`HTTP error: ${resp.status}`);
        const body: ApiCatalogProductsResponse = await resp.json();
        const maybe = body.products;
        if (Array.isArray(maybe)) {
          setProducts(maybe as CatalogProduct[]);
        } else {
          throw new Error('Unexpected products format');
        }
      } catch (err: unknown) {
        console.error(err);
        setError('Failed to fetch products');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
    return () => controller.abort();
  }, [categoryId]);

  const fetchVariantsFor = async (productId: number) => {
    setLoadingVariants(prev => ({ ...prev, [productId]: true }));
    try {
      const resp = await fetch(`/api/printful/catalog-product-variants?product_id=${productId}`);
      if (!resp.ok) throw new Error(`Variant fetch error: ${resp.status}`);
      const body = await resp.json();
      const data = body.variants;
      if (Array.isArray(data)) {
        setVariantsMap(prev => ({ ...prev, [productId]: data as CatalogVariant[] }));
      } else {
        console.warn('Variants data not array', body);
      }
    } catch (err) {
      console.error('Error fetching variants', err);
    } finally {
      setLoadingVariants(prev => ({ ...prev, [productId]: false }));
    }
  };

  const fetchCostForVariant = async (variantId: number) => {
    setLoadingCost(prev => ({ ...prev, [variantId]: true }));
    try {
      const resp = await fetch('/api/printful/estimate-cost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variant_id: variantId,
          quantity: 1
        }),
      });
      const json = await resp.json();
      if (!resp.ok) {
        throw new Error(json.error || 'Cost estimate failed');
      }
      console.log(']]]')
      console.log(json)
      console.log(']]]')
      setCostMap(prev => ({ ...prev, [variantId]: json.costs as CostEstimate }));
    } catch (err: unknown) {
      console.error('Error fetching cost for variant', err);
    } finally {
      setLoadingCost(prev => ({ ...prev, [variantId]: false }));
    }
  };

  console.log('%%%')
  console.log(costMap)
  console.log('%%%')

  return (
    <div style={{ padding: 20 }}>
      <h1>Browse Printful Catalog</h1>

      <label>
        Select category:{' '}
        <select value={categoryId} onChange={e => {
          const val = e.target.value;
          setCategoryId(val === '' ? '' : Number(val));
        }}>
          <option value="">— choose a category —</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.title}</option>
          ))}
        </select>
      </label>

      {loading && <p>Loading products…</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && products.length === 0 && !error && (
        <p>No products in this category.</p>
      )}

      {!loading && products.length > 0 && (
        <ul style={{ marginTop: '1rem' }}>
          {products.map(prod => (
            <li key={prod.id} style={{ marginBottom: '1.5rem' }}>
              <strong>{prod.name ?? ''}</strong>{' '}
              <button onClick={() => fetchVariantsFor(prod.id)}>
                {variantsMap[prod.id] ? 'Refresh variants' : 'Load variants'}
              </button>

              {loadingVariants[prod.id] && <p>Loading variants...</p>}

              {variantsMap[prod.id] && (
                <ul style={{ marginTop: '0.5rem' }}>
                  {variantsMap[prod.id]!.map(v => (
                    <li key={v.id} style={{ marginBottom: '0.5rem' }}>
                      {v.name} — size: {v.size} — variant_id: {v.id}{' '}
                      <button
                        onClick={() => fetchCostForVariant(v.id)}
                        disabled={loadingCost[v.id]}
                      >
                        {loadingCost[v.id] ? 'Loading cost…' : 'Get cost estimate'}
                      </button>

                      {costMap[v.id] && (
                        <div style={{ marginTop: 4 }}>
                          Estimated cost: {costMap[v.id].currency} {costMap[v.id].total.toFixed(2)}{' '}
                          (item: {costMap[v.id].subtotal.toFixed(2)} + shipping: {costMap[v.id].shipping.toFixed(2)})
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
