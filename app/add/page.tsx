// app/print/page.tsx
import React from 'react';

interface PrintfulProduct {
  id: number;
  name: string;
  thumbnail_url: string;
}

async function fetchProducts(): Promise<PrintfulProduct[]> {
  const token = process.env.PRINTFUL_API_TOKEN;
  const storeId = process.env.PRINTFUL_STORE_ID;
  const res = await fetch('https://api.printful.com/store/products', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-PF-Store-Id': storeId ?? '',
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error('Failed to fetch products: ' + JSON.stringify(json));
  }
  return json.result;
}

export default async function PrintfulProductsPage() {
  const products = await fetchProducts();

  return (
    <div style={{ padding: 20 }}>
      <h1>My Printful Store Products</h1>

      <h2>Add New Product</h2>
      <form
        method="POST"
        action="/api/printful/add-product"
        style={{ marginBottom: '2rem' }}
      >
        <div>
          <label>
            Product name: <input name="name" required />
          </label>
        </div>
        <div>
          <label>
            Variant ID (from Printful catalog): <input name="variant_id" required />
          </label>
        </div>
        <div>
          <label>
            Retail price (e.g. 19.99): <input name="price" required />
          </label>
        </div>
        <div>
          <label>
            File / image URL: <input name="image_url" required />
          </label>
        </div>
        <button type="submit">Create Product</button>
      </form>

      <h2>Existing Products</h2>
      {products.length === 0 && <p>No products found.</p>}
      <ul>
        {products.map((prod) => (
          <li key={prod.id} style={{ marginBottom: '1rem' }}>
            <img
              src={prod.thumbnail_url}
              alt={prod.name}
              style={{ width: 200, height: 'auto' }}
            /><br />
            <strong>{prod.name}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}
