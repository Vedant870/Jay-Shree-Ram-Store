import React, { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/api';

interface Product {
  _id?: string;
  id?: string;
  name: string;
  company: string;
  offerPrice: number;
  buyPrice?: number;
  stock: number;
  mrp?: number;
  category?: string;
  unit?: string;
  minQty?: number;
  orderStep?: number;
  imageUrl?: string;
}

const getProductId = (product: Product) => product._id || product.id || '';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editableStock, setEditableStock] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingProductId, setSavingProductId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    company: '',
    category: '',
    unit: '',
    mrp: '',
    buyPrice: '',
    offerPrice: '',
    stock: '',
    minQty: '1',
    orderStep: '1',
    imageUrl: '',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const response = await apiClient.getProducts();
      const productList = response.products || response;
      const normalizedProducts = Array.isArray(productList) ? productList : [];
      setProducts(normalizedProducts);
      setEditableStock(
        Object.fromEntries(
          normalizedProducts.map((product: Product) => [getProductId(product), String(product.stock ?? 0)])
        )
      );
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setErrorMessage('Unable to load products. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleStockChange = (productId: string, value: string) => {
    setEditableStock((prev) => ({ ...prev, [productId]: value }));
  };

  const handleSaveStock = async (productId: string) => {
    const newStockString = editableStock[productId];
    const newStock = Number(newStockString);

    if (Number.isNaN(newStock) || newStock < 0) {
      setErrorMessage('Stock must be a valid non-negative number.');
      return;
    }

    setSavingProductId(productId);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const response = await apiClient.updateProduct(productId, { stock: newStock });
      const updatedProduct = response.product || response;

      setProducts((prev) =>
        prev.map((product) =>
          getProductId(product) === productId ? { ...product, stock: newStock, ...updatedProduct } : product
        )
      );

      setStatusMessage('Stock updated successfully.');
    } catch (error) {
      console.error('Failed to update stock:', error);
      setErrorMessage('Failed to update stock. Please refresh and try again.');
    } finally {
      setSavingProductId(null);
    }
  };

  const handleNewProductChange = (key: keyof typeof newProduct, value: string) => {
    setNewProduct((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageUpload = async (file: File | null) => {
    if (!file) {
      setNewProduct((prev) => ({ ...prev, imageUrl: '' }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setNewProduct((prev) => ({ ...prev, imageUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleCreateProduct = async () => {
    const { name, company, category, unit, mrp, offerPrice, buyPrice, stock, minQty, orderStep, imageUrl } = newProduct;
    if (!name || !company || !category || !unit || !mrp || !offerPrice || !buyPrice || !stock) {
      setErrorMessage('Please fill all required fields for the new product.');
      return;
    }

    const newItem = {
      name,
      company,
      category,
      unit,
      mrp: Number(mrp),
      offerPrice: Number(offerPrice),
      buyPrice: Number(buyPrice),
      stock: Number(stock),
      minQty: Number(minQty),
      orderStep: Number(orderStep),
      isFeatured: false,
      imageUrl,
    };

    setErrorMessage(null);
    setStatusMessage(null);
    setSavingProductId('new');

    try {
      const response = await apiClient.createProduct(newItem);
      const createdProduct = response.product || response;
      setProducts((prev) => [createdProduct, ...prev]);
      setNewProduct({
        name: '',
        company: '',
        category: '',
        unit: '',
        mrp: '',
        buyPrice: '',
        offerPrice: '',
        stock: '',
        minQty: '1',
        orderStep: '1',
        imageUrl: '',
      });
      setStatusMessage('New product added successfully.');
    } catch (error) {
      console.error('Failed to create product:', error);
      setErrorMessage('Unable to create product. Please try again.');
    } finally {
      setSavingProductId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Product Management</h1>
          <p className="text-zinc-400 max-w-2xl">
            Manage inventory levels and keep product stock in sync with your orders.
          </p>
        </div>

        <button
          onClick={fetchProducts}
          className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          Refresh inventory
        </button>
      </div>

      {errorMessage && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-200">
          {errorMessage}
        </div>
      )}

      {statusMessage && (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-200">
          {statusMessage}
        </div>
      )}

      <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 overflow-hidden">
        <div className="bg-zinc-900 p-6 border-b border-zinc-800">
          <h2 className="text-xl font-semibold text-white mb-4">Add New Product</h2>
          <div className="grid gap-4 lg:grid-cols-3">
            <input
              value={newProduct.name}
              onChange={(e) => handleNewProductChange('name', e.target.value)}
              placeholder="Product name"
              className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white focus:border-saffron focus:ring-2 focus:ring-saffron/20"
            />
            <input
              value={newProduct.company}
              onChange={(e) => handleNewProductChange('company', e.target.value)}
              placeholder="Company"
              className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white focus:border-saffron focus:ring-2 focus:ring-saffron/20"
            />
            <input
              value={newProduct.category}
              onChange={(e) => handleNewProductChange('category', e.target.value)}
              placeholder="Category"
              className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white focus:border-saffron focus:ring-2 focus:ring-saffron/20"
            />
            <input
              value={newProduct.unit}
              onChange={(e) => handleNewProductChange('unit', e.target.value)}
              placeholder="Unit (e.g. Packet)"
              className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white focus:border-saffron focus:ring-2 focus:ring-saffron/20"
            />
            <input
              type="number"
              value={newProduct.buyPrice}
              onChange={(e) => handleNewProductChange('buyPrice', e.target.value)}
              placeholder="Buy Price"
              className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white focus:border-saffron focus:ring-2 focus:ring-saffron/20"
            />
            <input
              type="number"
              value={newProduct.offerPrice}
              onChange={(e) => handleNewProductChange('offerPrice', e.target.value)}
              placeholder="Sell Price"
              className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white focus:border-saffron focus:ring-2 focus:ring-saffron/20"
            />
            <input
              type="number"
              value={newProduct.mrp}
              onChange={(e) => handleNewProductChange('mrp', e.target.value)}
              placeholder="MRP"
              className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white focus:border-saffron focus:ring-2 focus:ring-saffron/20"
            />
            <input
              type="number"
              value={newProduct.stock}
              onChange={(e) => handleNewProductChange('stock', e.target.value)}
              placeholder="Stock"
              className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white focus:border-saffron focus:ring-2 focus:ring-saffron/20"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                value={newProduct.minQty}
                onChange={(e) => handleNewProductChange('minQty', e.target.value)}
                placeholder="Min Qty"
                className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white focus:border-saffron focus:ring-2 focus:ring-saffron/20"
              />
              <input
                type="number"
                value={newProduct.orderStep}
                onChange={(e) => handleNewProductChange('orderStep', e.target.value)}
                placeholder="Step"
                className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white focus:border-saffron focus:ring-2 focus:ring-saffron/20"
              />
            </div>
            <label className="col-span-full flex flex-col gap-2 rounded-2xl border border-dashed border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-300 cursor-pointer hover:border-saffron">
              <span className="font-semibold text-white">Product image</span>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => handleImageUpload(event.target.files?.[0] || null)}
                className="hidden"
              />
              <span>{newProduct.imageUrl ? 'Image selected' : 'Choose an image (optional)'}</span>
            </label>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-zinc-400 text-sm">New items are saved live to the database and synced across the admin dashboard.</div>
            <button
              onClick={handleCreateProduct}
              disabled={savingProductId === 'new'}
              className="inline-flex items-center justify-center rounded-full bg-saffron px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-saffron/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {savingProductId === 'new' ? 'Adding…' : 'Add Product'}
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950/70">
        <div className="grid grid-cols-7 gap-4 border-b border-zinc-800 bg-zinc-900 p-6 text-xs uppercase tracking-[0.12em] text-zinc-500">
          <div className="col-span-2">Product</div>
          <div>Company</div>
          <div>Sell</div>
          <div>Buy</div>
          <div>Profit</div>
          <div>Stock</div>
          <div className="text-right">Actions</div>
        </div>

        <div className="divide-y divide-zinc-900">
          {loading ? (
            <div className="p-8 text-zinc-500">Loading products…</div>
          ) : products.length === 0 ? (
            <div className="p-8 text-zinc-400">No products found.</div>
          ) : (
            products.map((product) => {
              const profit = product.offerPrice != null && product.buyPrice != null ? product.offerPrice - product.buyPrice : undefined;

              return (
                <div key={getProductId(product)} className="grid grid-cols-7 gap-4 items-center p-6 text-sm text-white">
                  <div className="col-span-2 space-y-1">
                    <div className="font-semibold">{product.name}</div>
                    {product.category && <div className="text-zinc-500 text-xs">{product.category}</div>}
                  </div>

                  <div className="text-zinc-400">{product.company}</div>
                  <div className="text-zinc-300">₹{product.offerPrice}</div>
                  <div className="text-zinc-300">₹{product.buyPrice ?? '—'}</div>
                  <div className="text-zinc-300">{profit != null ? `₹${profit}` : '—'}</div>

                  <div className="flex flex-col gap-2">
                    <input
                      type="number"
                      min="0"
                      value={editableStock[getProductId(product)] ?? String(product.stock ?? 0)}
                      onChange={(event) => handleStockChange(getProductId(product), event.target.value)}
                      className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white outline-none transition focus:border-saffron focus:ring-2 focus:ring-saffron/20"
                    />
                    <div className="text-xs text-zinc-500">Current: {product.stock}</div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleSaveStock(getProductId(product))}
                      disabled={savingProductId === getProductId(product)}
                      className="inline-flex items-center rounded-full bg-saffron px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-saffron/90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {savingProductId === getProductId(product) ? 'Saving…' : 'Save'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
