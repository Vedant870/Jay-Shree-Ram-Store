/// <reference types="vite/client" />

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? 'http://localhost:3000/api' : '/api');

class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  private normalizeProduct(product: any) {
    if (!product) return product;
    return {
      ...product,
      id: product.id || product._id || product._id?.toString?.(),
      imageUrl: product.imageUrl || product.image || '',
      buyPrice: product.buyPrice ?? product.cost ?? 0,
      offerPrice: product.offerPrice ?? product.sellPrice ?? 0,
    };
  }

  private normalizeProductList(products: any) {
    return Array.isArray(products) ? products.map((product) => this.normalizeProduct(product)) : products;
  }

  private normalizeOrderItem(item: any) {
    if (!item) return item;
    return {
      ...item,
      productId: item.productId || item.id || item._id || '',
      quantity: Number(item.quantity ?? 0),
      price: Number(item.price ?? item.offerPrice ?? item.mrp ?? 0),
      offerPrice: Number(item.offerPrice ?? item.price ?? item.mrp ?? 0),
      buyPrice: Number(item.buyPrice ?? 0),
    };
  }

  private normalizeOrder(order: any) {
    if (!order) return order;

    const customerSource = order.customer || order.customerId || {};
    const id = order.id || order._id || order.orderNumber || '';
    const customerName = order.customerName || customerSource.name || 'Customer';
    const phone = order.phone || customerSource.phone || '';
    const email = customerSource.email || '';

    return {
      ...order,
      id,
      _id: order._id || id,
      orderNumber: order.orderNumber || (typeof id === 'string' ? id.slice(-6) : ''),
      customerName,
      phone,
      items: Array.isArray(order.items) ? order.items.map((item: any) => this.normalizeOrderItem(item)) : [],
      totalAmount: Number(order.totalAmount ?? 0),
      customer: {
        name: customerName,
        email,
        phone,
      },
    };
  }

  private normalizeOrderList(orders: any) {
    return Array.isArray(orders) ? orders.map((order) => this.normalizeOrder(order)) : orders;
  }

  private setSessionFromAuthResponse(response: any) {
    if (response.token) {
      this.setToken(response.token);
    }

    const authUser = response.admin || response.user;
    const isAdmin = authUser && (authUser.role === 'admin' || authUser.role === 'super_admin');

    if (isAdmin && response.token) {
      localStorage.setItem('adminToken', response.token);
      localStorage.setItem('adminData', JSON.stringify(authUser));
    } else {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
    }
  }

  getToken(): string | null {
    return this.token || localStorage.getItem('auth_token') || localStorage.getItem('adminToken');
  }

  removeToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const contentType = response.headers.get('content-type') || '';

      if (!response.ok) {
        const errorPayload = contentType.includes('application/json')
          ? await response.json().catch(() => null)
          : await response.text().catch(() => '');

        const errorMessage = typeof errorPayload === 'string'
          ? errorPayload.trim()
          : errorPayload?.error || errorPayload?.message;

        throw new Error(errorMessage || `API request failed (${response.status})`);
      }

      if (!contentType.includes('application/json')) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth methods
  async register(userData: { name: string; email: string; password: string; phone?: string; address?: string }) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    this.setSessionFromAuthResponse(response);
    return response;
  }

  async login(data: {
  email: string;
  password: string;
}) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    this.setSessionFromAuthResponse(response);
    return response;
  }

  logout() {
    this.removeToken();
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
  }

  // Product methods
  async getProducts() {
    const response = await this.request('/products');
    const products = response.products || response;
    return this.normalizeProductList(products);
  }

  async createProduct(product: any) {
    const response = await this.request('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
    return { product: this.normalizeProduct(response.product || response) };
  }

  async updateProduct(id: string, product: any) {
    const response = await this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
    return { product: this.normalizeProduct(response.product || response) };
  }

  async deleteProduct(id: string) {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Order methods
  async getOrders() {
    const response = await this.request('/orders');
    const orders = response.orders || response;
    return this.normalizeOrderList(orders);
  }

  async getOrder(orderNumber: string) {
    const response = await this.request(`/orders/${orderNumber}`);
    return this.normalizeOrder(response.order || response);
  }

  async createOrder(order: any) {
    const items = Array.isArray(order.items)
      ? order.items.map((item: any) => ({
          productId: item.productId || item.id || item._id || '',
          name: item.name,
          company: item.company || '',
          quantity: Number(item.quantity ?? 0),
          price: Number(item.price ?? item.offerPrice ?? item.mrp ?? 0),
          offerPrice: Number(item.offerPrice ?? item.price ?? item.mrp ?? 0),
          buyPrice: Number(item.buyPrice ?? 0),
        }))
      : [];

    const response = await this.request('/orders', {
      method: 'POST',
      body: JSON.stringify({
        ...order,
        items,
      }),
    });

    const normalizedOrder = this.normalizeOrder(response.order || response);

    return {
      ...response,
      order: normalizedOrder,
      orderNumber: response.orderNumber || normalizedOrder?.orderNumber,
    };
  }

  async updateOrderStatus(id: string, status: string) {
    const response = await this.request(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });

    return {
      ...response,
      order: this.normalizeOrder(response.order || response),
    };
  }

  // Analytics methods
  async getAnalyticsOverview() {
    return this.request('/analytics/overview');
  }

  async getProfitLossData() {
    return this.request('/analytics/overview');
  }

  async getInventoryAnalytics() {
    return this.request('/analytics/overview');
  }

  async getSalesTrends() {
    return this.request('/analytics/overview');
  }

  // User methods
  async getProfile() {
    return this.request('/auth/me');
  }

  async updateProfile(userData: any) {
    throw new Error('Profile update endpoint is not implemented in backend yet');
  }
}

export const apiClient = new ApiClient();
