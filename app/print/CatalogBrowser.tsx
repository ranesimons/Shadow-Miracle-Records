'use client';

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { CatalogCategory, CatalogProduct } from '@/lib/printful-types';
import { upload } from '@vercel/blob/client';

interface PutBlobResult {
  pathname: string;
  contentType: string;
  contentDisposition: string;
  url: string;
  downloadUrl: string;
}

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
  const [file, setFile] = useState<File | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

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

  // const onChange = (e: ChangeEvent<HTMLInputElement>) => {
  //   const f = e.target.files?.[0] ?? null;
  //   if (f && f.type.startsWith('image/')) {
  //     setFile(f);
  //     setError(null);
  //   } else {
  //     setFile(null);
  //     setError('Please select a valid image file.');
  //   }
  // };

  // const onUpload = async () => {
  //   if (!file) {
  //     setError('No file selected');
  //     return;
  //   }

  //   setLoading(true);
  //   setError(null);

  //   try {
  //     const resp = await fetch(
  //       `/api/upload-image?filename=${encodeURIComponent(file.name)}`,
  //       {
  //         method: 'POST',
  //         body: file,  // send raw file
  //       }
  //     );

  //     if (!resp.ok) {
  //       const text = await resp.text();
  //       throw new Error(`Upload failed: ${resp.status} – ${text}`);
  //     }

  //     const data = (await resp.json()) as PutBlobResult;
  //     setBlobUrl(data.url);
  //   } catch (err: any) {
  //     console.error('Upload error:', err);
  //     setError(err.message || 'Upload failed');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fileInput = form.elements.namedItem('file') as HTMLInputElement;
    if (!fileInput.files?.length) {
      setError('No file selected');
      return;
    }
    const file = fileInput.files[0];
    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const resp = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });
      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(`Upload failed: ${resp.status} — ${txt}`);
      }
      const data = await resp.json();
      setBlobUrl(data.url);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  console.log('%%%')
  console.log(costMap)
  console.log('%%%')

  return (
    <div style={{ padding: 20 }}>
      <form onSubmit={handleSubmit}>
      <input name="file" type="file" accept="image/*" required />
      <button type="submit" disabled={uploading}>
        {uploading ? 'Uploading…' : 'Upload'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {blobUrl && (
        <div>
          <p>Uploaded image URL:</p>
          <a href={blobUrl} target="_blank" rel="noreferrer">{blobUrl}</a>
          <br />
          <img src={blobUrl} alt="Uploaded" style={{ maxWidth: 200 }} />
        </div>
      )}
      </form>

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
