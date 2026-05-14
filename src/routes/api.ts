import mongoose from 'mongoose';
import express from 'express';
import { User, Product, Order, Admin, dbConnected } from '../lib/database.js';
import { authenticate, requireAdmin, hashPassword, verifyPassword, generateToken, verifyToken } from '../lib/auth.js';
import { Product as ProductType, Order as OrderType, UserProfile } from '../types.js';
import { MOCK_PRODUCTS as SHARED_MOCK_PRODUCTS } from '../mockData.js';

const router = express.Router();
const buildOrderNumber = () => Date.now().toString().slice(-6);
const canUseMockFallback = () => {
  const envOverride = process.env.ALLOW_MOCK_FALLBACK;
  if (typeof envOverride === 'string') {
    return envOverride.toLowerCase() === 'true';
  }

  return process.env.NODE_ENV !== 'production';
};

const respondDatabaseUnavailable = (res: express.Response) => {
  return res.status(503).json({ error: 'Database temporarily unavailable. Please retry in a moment.' });
};

router.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    dbConnected,
    mockFallback: canUseMockFallback(),
    env: process.env.NODE_ENV || 'development',
  });
});

const aggregateItemQuantities = (items: any[]) => {
  const quantitiesByProductId: Record<string, number> = {};

  items.forEach((item: any) => {
    const productId = item.productId?.toString?.() || item.productId || '';
    if (!productId) {
      return;
    }

    quantitiesByProductId[productId] = (quantitiesByProductId[productId] || 0) + Number(item.quantity || 0);
  });

  return quantitiesByProductId;
};

const findMockProduct = (item: any) => {
  return MOCK_PRODUCTS.find((product: any) => {
    const matchesId = product.id === item.productId || String((product as any)._id || '') === item.productId;
    const matchesName = product.name === item.name;
    const matchesCompany = !item.company || product.company === item.company;

    return matchesId || (matchesName && matchesCompany);
  });
};

const MOCK_ORDERS = [
  {
    _id: '1023',
    orderNumber: '102301',
    customerName: 'Vedant',
    phone: '9999999999',
    address: 'City Market, Main Road',
    items: [{ productId: 'm1', name: 'Mohini Chai 250g', company: 'Mohani', quantity: 2, price: 175, offerPrice: 175, buyPrice: 0 }],
    totalAmount: 350,
    status: 'placed',
    route: 'Route 1 (City)',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '1022',
    orderNumber: '102201',
    customerName: 'Rahul',
    phone: '9999999998',
    address: 'North Bazaar, Shop 12',
    items: [{ productId: 'c1', name: 'Colgate Strong 200g 130/-', company: 'Colgate', quantity: 3, price: 113, offerPrice: 113, buyPrice: 0 }],
    totalAmount: 339,
    status: 'delivered',
    route: 'Route 2 (Suburbs)',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const MOCK_PRODUCTS = SHARED_MOCK_PRODUCTS.map((product) => ({ ...product }));

const ANALYTICS_COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6'];

const getMockProductById = (productId: string) =>
  MOCK_PRODUCTS.find((product: any) => product.id === productId || String(product._id || '') === productId);

const buildMockAnalyticsOverview = () => {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startOfYear = new Date(today.getFullYear(), 0, 1);
  const startOfPreviousMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

  const allOrders = MOCK_ORDERS;
  const monthlyOrders = allOrders.filter((order: any) => new Date(order.createdAt) >= startOfMonth);
  const yearlyOrders = allOrders.filter((order: any) => new Date(order.createdAt) >= startOfYear);
  const previousMonthOrders = allOrders.filter(
    (order: any) => new Date(order.createdAt) >= startOfPreviousMonth && new Date(order.createdAt) < startOfMonth
  );

  const totalRevenue = allOrders.reduce((sum: number, order: any) => sum + Number(order.totalAmount || 0), 0);
  const monthlyRevenue = monthlyOrders.reduce((sum: number, order: any) => sum + Number(order.totalAmount || 0), 0);
  const yearlyRevenue = yearlyOrders.reduce((sum: number, order: any) => sum + Number(order.totalAmount || 0), 0);
  const previousMonthRevenue = previousMonthOrders.reduce((sum: number, order: any) => sum + Number(order.totalAmount || 0), 0);

  const orderStats = {
    total: allOrders.length,
    placed: allOrders.filter((order: any) => order.status === 'placed').length,
    packed: allOrders.filter((order: any) => order.status === 'packed').length,
    'out-for-delivery': allOrders.filter((order: any) => order.status === 'out-for-delivery').length,
    delivered: allOrders.filter((order: any) => order.status === 'delivered').length,
    cancelled: allOrders.filter((order: any) => order.status === 'cancelled').length,
  };

  const productSales: Record<string, { quantity: number; revenue: number }> = {};
  const categoryRevenue: Record<string, number> = {};
  const routeRevenue: Record<string, number> = {};

  allOrders.forEach((order: any) => {
    routeRevenue[order.route] = (routeRevenue[order.route] || 0) + Number(order.totalAmount || 0);

    order.items.forEach((item: any) => {
      if (!productSales[item.name]) {
        productSales[item.name] = { quantity: 0, revenue: 0 };
      }

      productSales[item.name].quantity += Number(item.quantity || 0);
      productSales[item.name].revenue += Number(item.price || 0) * Number(item.quantity || 0);

      const product = getMockProductById(item.productId);
      const category = product?.category || 'Uncategorized';
      categoryRevenue[category] = (categoryRevenue[category] || 0) + Number(item.price || 0) * Number(item.quantity || 0);
    });
  });

  const topProducts = Object.entries(productSales)
    .map(([name, data]) => ({ name, sales: data.quantity, quantity: data.quantity, revenue: data.revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  const revenueByCategory = Object.entries(categoryRevenue).map(([name, value], index) => ({
    name,
    value,
    color: ANALYTICS_COLORS[index % ANALYTICS_COLORS.length],
  }));

  const salesTrend = [...Array(6)].map((_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth() - (5 - index), 1);
    const monthLabel = date.toLocaleString('default', { month: 'short' });
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    const periodOrders = allOrders.filter(
      (order: any) => new Date(order.createdAt) >= monthStart && new Date(order.createdAt) < monthEnd
    );

    return {
      month: monthLabel,
      sales: periodOrders.reduce(
        (sum: number, order: any) =>
          sum + order.items.reduce((itemSum: number, item: any) => itemSum + Number(item.quantity || 0), 0),
        0
      ),
      revenue: periodOrders.reduce((sum: number, order: any) => sum + Number(order.totalAmount || 0), 0),
    };
  });

  const activeCustomers = new Set(
    allOrders.map((order: any) => order.customerId?.toString?.() || order.customerName)
  ).size;
  const orderSuccessRate = allOrders.length > 0 ? Math.round((orderStats.delivered / allOrders.length) * 100) : 0;
  const monthlyGrowth = previousMonthRevenue > 0
    ? Math.round(((monthlyRevenue - previousMonthRevenue) / previousMonthRevenue) * 100)
    : monthlyRevenue > 0
      ? 100
      : 0;

  return {
    revenue: { total: totalRevenue, monthly: monthlyRevenue, yearly: yearlyRevenue },
    orders: orderStats,
    topProducts,
    routeRevenue,
    salesTrend,
    revenueByCategory,
    totalProducts: MOCK_PRODUCTS.length,
    activeCustomers,
    orderSuccessRate,
    monthlyGrowth,
  };
};

// ================= AUTH ROUTES =================

// Login
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (!dbConnected) {
      if (!canUseMockFallback()) {
        return respondDatabaseUnavailable(res);
      }

      if (email === 'admin@jsr.com' && password === 'admin123') {
        const token = generateToken({
          id: 'mock-admin',
          name: 'Admin',
          email,
          role: 'super_admin'
        });

        return res.json({
          token,
          user: {
            id: 'mock-admin',
            name: 'Admin',
            email,
            role: 'super_admin'
          }
        });
      }

      return res.status(503).json({ error: 'Login is unavailable until the database reconnects' });
    }

    // Check if admin first
    let user = await (Admin as any).findOne({ email }).lean();
    let isAdmin = true;

    if (!user) {
      user = await (User as any).findOne({ email }).lean();
      isAdmin = false;
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: isAdmin ? user.role : 'customer'
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: isAdmin ? user.role : 'customer'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Admin login
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('[admin/login] Received:', { email, password });

    if (!email || !password) {
      console.log('[admin/login] Missing email or password');
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    console.log('[admin/login] dbConnected:', dbConnected);

    if (!dbConnected) {
      if (!canUseMockFallback()) {
        return res.status(503).json({ success: false, message: 'Database temporarily unavailable. Please retry in a moment.' });
      }

      console.log('[admin/login] Mock mode check');
      if (email === 'admin@jsr.com' && password === 'admin123') {
        console.log('[admin/login] Mock credentials match, generating token');
        const token = generateToken({
          id: 'mock-admin',
          name: 'Admin',
          email,
          role: 'super_admin'
        });

        console.log('[admin/login] Token generated:', token.substring(0, 20) + '...');
        return res.json({
          success: true,
          token,
          admin: {
            id: 'mock-admin',
            name: 'Admin',
            email,
            role: 'super_admin'
          }
        });
      }

      console.log('[admin/login] Mock credentials do not match');
      return res.status(401).json({ success: false, message: 'Invalid admin credentials (mock mode)' });
    }

    console.log('[admin/login] Database connected, checking admin');
    const admin = await (Admin as any).findOne({ email }).lean();

    if (!admin) {
      console.log('[admin/login] Admin not found');
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    const isValidPassword = await verifyPassword(password, admin.password);
    if (!isValidPassword) {
      console.log('[admin/login] Invalid password');
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }

    const token = generateToken({
      id: admin._id.toString(),
      name: admin.name,
      email: admin.email,
      role: admin.role
    });

    res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('[admin/login] ERROR:', error);
    res.status(500).json({ success: false, message: 'Admin login failed' });
  }
});

// Register
router.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Check if user already exists
    const existingUser = await (User as any).findOne({ email }).lean();
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await hashPassword(password);

    const user = new (User as any)({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      role: 'customer'
    });

    await user.save();

    const token = generateToken({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: 'customer'
    });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: 'customer'
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Get current user
router.get('/auth/me', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const role = (req as any).user.role;

    let user;
    if (role === 'admin' || role === 'super_admin') {
      user = await (Admin as any).findById(userId).select('-password').lean();
    } else {
      user = await (User as any).findById(userId).select('-password').lean();
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// ================= PRODUCT ROUTES =================

// Get all products
router.get('/products', async (req, res) => {
  try {
    if (!dbConnected) {
      if (!canUseMockFallback()) {
        return respondDatabaseUnavailable(res);
      }

      console.log('Get products: MongoDB unavailable, returning mock products');
      return res.json({ products: MOCK_PRODUCTS });
    }

    const products = await (Product as any).find({}).lean();
    res.json({ products });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Create product (admin only)
router.post('/products', authenticate, requireAdmin, async (req, res) => {
  try {
    const productData = req.body;

    if (!dbConnected) {
      if (!canUseMockFallback()) {
        return respondDatabaseUnavailable(res);
      }

      const newProduct = {
        ...productData,
        id: `mock-${Date.now()}`,
        _id: `mock-${Date.now()}`,
      };
      MOCK_PRODUCTS.unshift(newProduct);
      return res.status(201).json({ product: newProduct });
    }

    const product = new (Product as any)(productData);
    await product.save();
    res.status(201).json({ product });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product (admin only)
router.put('/products/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!dbConnected) {
      if (!canUseMockFallback()) {
        return respondDatabaseUnavailable(res);
      }

      const index = MOCK_PRODUCTS.findIndex((product) => product.id === id || (product as any)._id === id);
      if (index === -1) {
        return res.status(404).json({ error: 'Product not found' });
      }
      MOCK_PRODUCTS[index] = { ...MOCK_PRODUCTS[index], ...updateData };
      return res.json({ product: MOCK_PRODUCTS[index] });
    }

    const product = await (Product as any).findByIdAndUpdate(id, updateData, { new: true }).lean();
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ product });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product (admin only)
router.delete('/products/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (!dbConnected) {
      if (!canUseMockFallback()) {
        return respondDatabaseUnavailable(res);
      }

      const index = MOCK_PRODUCTS.findIndex((product) => product.id === id || (product as any)._id === id);
      if (index === -1) {
        return res.status(404).json({ error: 'Product not found' });
      }
      MOCK_PRODUCTS.splice(index, 1);
      return res.json({ message: 'Product deleted successfully' });
    }

    const product = await (Product as any).findByIdAndDelete(id).lean();
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// ================= ORDER ROUTES =================

// Get orders
router.get('/orders', authenticate, async (req, res) => {
  try {
    if (!dbConnected) {
      if (!canUseMockFallback()) {
        return respondDatabaseUnavailable(res);
      }

      return res.json({ orders: MOCK_ORDERS });
    }

    const userRole = (req as any).user.role;
    let orders;

    if (userRole === 'admin' || userRole === 'super_admin') {
      orders = await (Order as any).find({}).populate('customerId').lean();
    } else {
      orders = await (Order as any).find({ customerId: (req as any).user.id }).lean();
    }

    res.json({ orders });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

router.get('/orders/:orderNumber', async (req, res) => {
  try {
    const { orderNumber } = req.params;

    if (!dbConnected) {
      if (!canUseMockFallback()) {
        return respondDatabaseUnavailable(res);
      }

      const order = MOCK_ORDERS.find(
        (item: any) => item.orderNumber === orderNumber || item._id === orderNumber
      );

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      return res.json({ order });
    }

    const filters = [{ orderNumber }] as any[];
    if (mongoose.Types.ObjectId.isValid(orderNumber)) {
      filters.push({ _id: orderNumber });
    }

    const order = await (Order as any)
      .findOne({ $or: filters })
      .populate('customerId')
      .lean();

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Create order (authentication optional: supports guest checkout)
router.post('/orders', async (req, res) => {
  try {
    const { customerName, phone, address, route, items, note } = req.body;
    const normalizedCustomerName = typeof customerName === 'string' ? customerName.trim() : '';
    const normalizedPhone = typeof phone === 'string' ? phone.replace(/\D/g, '').slice(0, 10) : '';
    const normalizedAddress = typeof address === 'string' ? address.trim() : '';
    const normalizedNote = typeof note === 'string' ? note.trim() : undefined;

    // Try to decode token if provided (optional auth)
    const authHeader = req.headers.authorization as string | undefined;
    let customerId: string | undefined = undefined;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      if (decoded) customerId = decoded.id;
    }

    const normalizedItems = Array.isArray(items)
      ? items
          .map((item: any) => ({
            productId: item.productId || item.id || item._id || '',
            name: item.name,
            company: item.company || '',
            quantity: Number(item.quantity ?? 0),
            price: Number(item.price ?? item.offerPrice ?? 0),
            offerPrice: Number(item.offerPrice ?? item.price ?? 0),
            buyPrice: Number(item.buyPrice ?? 0),
          }))
          .filter((item: any) => item.productId && item.quantity > 0)
      : [];

    if (!normalizedCustomerName || !normalizedPhone || !normalizedAddress || normalizedItems.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (normalizedPhone.length !== 10) {
      return res.status(400).json({ error: 'Phone number must be exactly 10 digits' });
    }

    if (!dbConnected) {
      if (!canUseMockFallback()) {
        return respondDatabaseUnavailable(res);
      }

      const normalizedMockItems = normalizedItems.map((item: any) => {
        const matchedProduct = findMockProduct(item);

        if (!matchedProduct) {
          return null;
        }

        return {
          ...item,
          productId: matchedProduct.id || (matchedProduct as any)._id || item.productId,
          name: matchedProduct.name,
          company: matchedProduct.company,
          price: Number(item.price || matchedProduct.offerPrice || 0),
          offerPrice: Number(item.offerPrice || matchedProduct.offerPrice || 0),
          buyPrice: Number(item.buyPrice || matchedProduct.buyPrice || 0),
        };
      });

      if (normalizedMockItems.some((item) => !item)) {
        return res.status(400).json({ error: 'Some products are unavailable right now. Please refresh your cart.' });
      }

      const quantitiesByProductId: Record<string, number> = {};
      for (const item of normalizedMockItems as any[]) {
        quantitiesByProductId[item.productId] = (quantitiesByProductId[item.productId] || 0) + item.quantity;
      }

      for (const [productId, quantity] of Object.entries(quantitiesByProductId)) {
        const product = MOCK_PRODUCTS.find((mockProduct: any) => mockProduct.id === productId || String(mockProduct._id || '') === productId);

        if (!product) {
          return res.status(400).json({ error: 'Some products are unavailable right now. Please refresh your cart.' });
        }

        if (Number(product.stock || 0) < quantity) {
          return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
        }
      }

      for (const [productId, quantity] of Object.entries(quantitiesByProductId)) {
        const productIndex = MOCK_PRODUCTS.findIndex((mockProduct: any) => mockProduct.id === productId || String(mockProduct._id || '') === productId);
        if (productIndex !== -1) {
          MOCK_PRODUCTS[productIndex] = {
            ...MOCK_PRODUCTS[productIndex],
            stock: Number(MOCK_PRODUCTS[productIndex].stock || 0) - quantity,
          } as any;
        }
      }

      const orderNumber = buildOrderNumber();
      const totalAmount = (normalizedMockItems as any[]).reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
      const order = {
        _id: `mock-order-${Date.now()}`,
        orderNumber,
        customerId: customerId || undefined,
        customerName: normalizedCustomerName,
        phone: normalizedPhone,
        address: normalizedAddress,
        route: route || 'Route 1 (City)',
        items: normalizedMockItems,
        totalAmount,
        status: 'placed',
        note: normalizedNote,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      MOCK_ORDERS.unshift(order as any);
      return res.status(201).json({ order, orderNumber });
    }

    // Aggregate item quantities per product
    const quantitiesByProductId: Record<string, number> = {};
    for (const item of normalizedItems) {
      quantitiesByProductId[item.productId] = (quantitiesByProductId[item.productId] || 0) + item.quantity;
    }

    // Check stock availability
    for (const [productId, quantity] of Object.entries(quantitiesByProductId)) {
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ error: `Invalid product ID: ${productId}` });
      }

      const product = await (Product as any).findById(productId).lean();
      if (!product) {
        return res.status(400).json({ error: `Invalid product ID: ${productId}` });
      }
      if (product.stock < quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
      }
    }

    // Decrement stock for each product
    for (const [productId, quantity] of Object.entries(quantitiesByProductId)) {
      await (Product as any).findByIdAndUpdate(productId, { $inc: { stock: -quantity } });
    }

    // Generate order number
    const orderNumber = buildOrderNumber();

    // Calculate total amount
    const totalAmount = normalizedItems.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);

    const order = new (Order as any)({
      orderNumber,
      customerId: customerId,
      customerName: normalizedCustomerName,
      phone: normalizedPhone,
      address: normalizedAddress,
      route: route || 'Route 1 (City)',
      items: normalizedItems,
      totalAmount,
      status: 'placed',
      note: normalizedNote
    });

    await order.save();
    res.status(201).json({ order, orderNumber });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Update order status (admin only)
router.put('/orders/:id/status', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['placed', 'packed', 'out-for-delivery', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    if (!dbConnected) {
      if (!canUseMockFallback()) {
        return respondDatabaseUnavailable(res);
      }

      const mockOrderIndex = MOCK_ORDERS.findIndex((order: any) => order._id === id);
      if (mockOrderIndex === -1) {
        return res.status(404).json({ error: 'Order not found' });
      }

      const existingOrder = MOCK_ORDERS[mockOrderIndex] as any;

      if (existingOrder.status !== 'cancelled' && status === 'cancelled') {
        const quantitiesByProductId = aggregateItemQuantities(existingOrder.items || []);

        Object.entries(quantitiesByProductId).forEach(([productId, quantity]) => {
          const productIndex = MOCK_PRODUCTS.findIndex(
            (mockProduct: any) => mockProduct.id === productId || String(mockProduct._id || '') === productId
          );

          if (productIndex !== -1) {
            MOCK_PRODUCTS[productIndex] = {
              ...MOCK_PRODUCTS[productIndex],
              stock: Number(MOCK_PRODUCTS[productIndex].stock || 0) + quantity,
            } as any;
          }
        });
      }

      if (existingOrder.status === 'cancelled' && status !== 'cancelled') {
        const quantitiesByProductId = aggregateItemQuantities(existingOrder.items || []);

        for (const [productId, quantity] of Object.entries(quantitiesByProductId)) {
          const product = MOCK_PRODUCTS.find(
            (mockProduct: any) => mockProduct.id === productId || String(mockProduct._id || '') === productId
          );

          if (!product) {
            return res.status(400).json({ error: 'Some products are unavailable right now. Please refresh orders.' });
          }

          if (Number(product.stock || 0) < quantity) {
            return res.status(400).json({ error: `Insufficient stock to restore ${existingOrder.orderNumber}` });
          }
        }

        Object.entries(quantitiesByProductId).forEach(([productId, quantity]) => {
          const productIndex = MOCK_PRODUCTS.findIndex(
            (mockProduct: any) => mockProduct.id === productId || String(mockProduct._id || '') === productId
          );

          if (productIndex !== -1) {
            MOCK_PRODUCTS[productIndex] = {
              ...MOCK_PRODUCTS[productIndex],
              stock: Number(MOCK_PRODUCTS[productIndex].stock || 0) - quantity,
            } as any;
          }
        });
      }

      MOCK_ORDERS[mockOrderIndex] = {
        ...MOCK_ORDERS[mockOrderIndex],
        status,
        updatedAt: new Date().toISOString(),
      } as any;

      return res.json({ order: MOCK_ORDERS[mockOrderIndex] });
    }

    const existingOrder = await (Order as any).findById(id).lean();
    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (existingOrder.status !== 'cancelled' && status === 'cancelled') {
      const quantitiesByProductId = aggregateItemQuantities(existingOrder.items || []);

      for (const [productId, quantity] of Object.entries(quantitiesByProductId)) {
        await (Product as any).findByIdAndUpdate(productId, { $inc: { stock: quantity } });
      }
    }

    if (existingOrder.status === 'cancelled' && status !== 'cancelled') {
      const quantitiesByProductId = aggregateItemQuantities(existingOrder.items || []);

      for (const [productId, quantity] of Object.entries(quantitiesByProductId)) {
        const product = await (Product as any).findById(productId).lean();

        if (!product) {
          return res.status(400).json({ error: 'Some products are unavailable right now. Please refresh orders.' });
        }

        if (Number(product.stock || 0) < quantity) {
          return res.status(400).json({ error: `Insufficient stock to restore ${existingOrder.orderNumber}` });
        }
      }

      for (const [productId, quantity] of Object.entries(quantitiesByProductId)) {
        await (Product as any).findByIdAndUpdate(productId, { $inc: { stock: -quantity } });
      }
    }

    const order = await (Order as any).findByIdAndUpdate(id, { status }, { new: true }).lean();

    res.json({ order });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// ================= USER ROUTES =================

// Get all users (admin only)
router.get('/users', authenticate, requireAdmin, async (req, res) => {
  try {
    const users = await (User as any).find({}).select('-password').lean();
    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// ================= ANALYTICS ROUTES =================

// Analytics overview (admin only)
router.get('/analytics', authenticate, requireAdmin, async (req, res) => {
  try {
    if (!dbConnected) {
      if (!canUseMockFallback()) {
        return respondDatabaseUnavailable(res);
      }

      return res.json(buildMockAnalyticsOverview());
    }

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    const allOrders = await (Order as any).find({}).lean();
    const monthlyOrders = await (Order as any).find({ createdAt: { $gte: startOfMonth } }).lean();
    const yearlyOrders = await (Order as any).find({ createdAt: { $gte: startOfYear } }).lean();

    // Revenue calculations
    const totalRevenue = allOrders.reduce((sum: number, order: any) => sum + order.totalAmount, 0);
    const monthlyRevenue = monthlyOrders.reduce((sum: number, order: any) => sum + order.totalAmount, 0);
    const yearlyRevenue = yearlyOrders.reduce((sum: number, order: any) => sum + order.totalAmount, 0);

    // Order stats
    const orderStats = {
      total: allOrders.length,
      placed: allOrders.filter((o: any) => o.status === 'placed').length,
      packed: allOrders.filter((o: any) => o.status === 'packed').length,
      'out-for-delivery': allOrders.filter((o: any) => o.status === 'out-for-delivery').length,
      delivered: allOrders.filter((o: any) => o.status === 'delivered').length,
      cancelled: allOrders.filter((o: any) => o.status === 'cancelled').length,
    };

    // Product sales
    const productSales: Record<string, any> = {};
    allOrders.forEach((order: any) => {
      order.items.forEach((item: any) => {
        if (!productSales[item.name]) {
          productSales[item.name] = { quantity: 0, revenue: 0 };
        }
        productSales[item.name].quantity += item.quantity;
        productSales[item.name].revenue += item.price * item.quantity;
      });
    });

    const topProducts = Object.entries(productSales)
      .map(([name, data]: [string, any]) => ({ name, sales: data.quantity, revenue: data.revenue }))
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 10);

    // Route revenue
    const routeRevenue: Record<string, number> = {};
    allOrders.forEach((order: any) => {
      if (!routeRevenue[order.route]) {
        routeRevenue[order.route] = 0;
      }
      routeRevenue[order.route] += order.totalAmount;
    });

    const payload = {
      revenue: { total: totalRevenue, monthly: monthlyRevenue, yearly: yearlyRevenue },
      orders: orderStats,
      topProducts,
      routeRevenue,
    };

    res.json(payload);
  } catch (error) {
    console.error('Analytics overview error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

router.get('/analytics/overview', authenticate, requireAdmin, async (req, res) => {
  try {
    if (!dbConnected) {
      if (!canUseMockFallback()) {
        return respondDatabaseUnavailable(res);
      }

      return res.json(buildMockAnalyticsOverview());
    }

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const startOfPreviousMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

    const allOrders = await (Order as any).find({}).lean();
    const monthlyOrders = await (Order as any).find({ createdAt: { $gte: startOfMonth } }).lean();
    const yearlyOrders = await (Order as any).find({ createdAt: { $gte: startOfYear } }).lean();
    const previousMonthOrders = await (Order as any)
      .find({ createdAt: { $gte: startOfPreviousMonth, $lt: startOfMonth } })
      .lean();

    const totalRevenue = allOrders.reduce((sum: number, order: any) => sum + order.totalAmount, 0);
    const monthlyRevenue = monthlyOrders.reduce((sum: number, order: any) => sum + order.totalAmount, 0);
    const yearlyRevenue = yearlyOrders.reduce((sum: number, order: any) => sum + order.totalAmount, 0);
    const previousMonthRevenue = previousMonthOrders.reduce((sum: number, order: any) => sum + order.totalAmount, 0);

    const orderStats = {
      total: allOrders.length,
      placed: allOrders.filter((o: any) => o.status === 'placed').length,
      packed: allOrders.filter((o: any) => o.status === 'packed').length,
      'out-for-delivery': allOrders.filter((o: any) => o.status === 'out-for-delivery').length,
      delivered: allOrders.filter((o: any) => o.status === 'delivered').length,
      cancelled: allOrders.filter((o: any) => o.status === 'cancelled').length,
    };

    const productIds = Array.from(
      new Set(
        allOrders.flatMap((order: any) => order.items.map((item: any) => item.productId?.toString?.()))
      )
    ).filter(Boolean);

    const products = productIds.length > 0
      ? await (Product as any).find({ _id: { $in: productIds } }).lean()
      : [];

    const productMap = new Map(products.map((product: any) => [product._id.toString(), product]));

    const productSales: Record<string, any> = {};
    const categoryRevenue: Record<string, number> = {};

    allOrders.forEach((order: any) => {
      order.items.forEach((item: any) => {
        if (!productSales[item.name]) {
          productSales[item.name] = { quantity: 0, revenue: 0 };
        }
        productSales[item.name].quantity += item.quantity;
        productSales[item.name].revenue += item.price * item.quantity;

        const product = productMap.get(item.productId?.toString?.()) as any;
        const category = product?.category || 'Uncategorized';
        categoryRevenue[category] = (categoryRevenue[category] || 0) + item.price * item.quantity;
      });
    });

    const topProducts = Object.entries(productSales)
      .map(([name, data]: [string, any]) => ({ name, sales: data.quantity, revenue: data.revenue }))
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 10);

    const revenueByCategory = Object.entries(categoryRevenue).map(([name, value]) => ({ name, value, color: '#8884d8' }));

    const routeRevenue: Record<string, number> = {};
    allOrders.forEach((order: any) => {
      if (!routeRevenue[order.route]) {
        routeRevenue[order.route] = 0;
      }
      routeRevenue[order.route] += order.totalAmount;
    });

    const salesTrend = [...Array(6)].map((_, index) => {
      const date = new Date(today.getFullYear(), today.getMonth() - (5 - index), 1);
      const monthLabel = date.toLocaleString('default', { month: 'short' });
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 1);
      const periodOrders = allOrders.filter((order: any) => new Date(order.createdAt) >= monthStart && new Date(order.createdAt) < monthEnd);
      return {
        month: monthLabel,
        sales: periodOrders.reduce((sum: number, order: any) => sum + order.items.reduce((itemSum: number, item: any) => itemSum + item.quantity, 0), 0),
        revenue: periodOrders.reduce((sum: number, order: any) => sum + order.totalAmount, 0),
      };
    });

    const totalProducts = await (Product as any).countDocuments();
    const activeCustomers = new Set(allOrders.map((order: any) => order.customerId?.toString() || order.customerName)).size;
    const orderSuccessRate = allOrders.length > 0 ? Math.round((orderStats.delivered / allOrders.length) * 100) : 0;
    const monthlyGrowth = previousMonthRevenue > 0 ? Math.round(((monthlyRevenue - previousMonthRevenue) / previousMonthRevenue) * 100) : 0;

    res.json({
      revenue: { total: totalRevenue, monthly: monthlyRevenue, yearly: yearlyRevenue },
      orders: orderStats,
      topProducts,
      routeRevenue,
      salesTrend,
      revenueByCategory,
      totalProducts,
      activeCustomers,
      orderSuccessRate,
      monthlyGrowth,
    });
  } catch (error) {
    console.error('Analytics overview alias error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics overview' });
  }
});

export default router;
