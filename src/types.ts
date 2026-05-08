export interface Product {
  id: string;
  name: string;
  company: string;
  mrp: number;
  offerPrice: number;
  stock: number;
  unit: string;
  minQty?: number;
  orderStep?: number;
  category: string;
  isFeatured?: boolean;
  imageUrl?: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'out-for-delivery' | 'delivered' | 'cancelled';
  createdAt: any;
  route?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  address?: string;
  phone?: string;
  route?: string;
}
