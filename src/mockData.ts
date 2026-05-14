import { Product } from './types.ts';

export const MOCK_PRODUCTS: Product[] = [
  // MOHANI
  { id: 'm1', name: 'Mohini Chai 250g', company: 'Mohani', mrp: 180, offerPrice: 175, stock: 18, unit: 'Packet', category: 'Tea', minQty: 2, orderStep: 1, isFeatured: true },
  { id: 'm2', name: 'Mohini 10/-', company: 'Mohani', mrp: 120, offerPrice: 110, stock: 10, unit: 'Packet', category: 'Tea', minQty: 10, orderStep: 10 },
  
  // COLGATE
  { id: 'c1', name: 'Colgate Strong 200g 130/-', company: 'Colgate', mrp: 130, offerPrice: 113, stock: 45, unit: 'Tube', category: 'Oral Care', minQty: 6, orderStep: 6, isFeatured: true },
  { id: 'c2', name: 'Colgate Strong 20/-', company: 'Colgate', mrp: 205, offerPrice: 198, stock: 22, unit: 'Tube', category: 'Oral Care' },
  
  // BRITANNIA
  { id: 'b1', name: 'Britania Rusk 50/-', company: 'Britaniya', mrp: 50, offerPrice: 45, stock: 15, unit: 'Packet', category: 'Biscuits', isFeatured: true },
  { id: 'b2', name: 'Good Day 10/-', company: 'Britaniya', mrp: 10, offerPrice: 9, stock: 100, unit: 'Packet', category: 'Biscuits', minQty: 12, orderStep: 12 },
  
  // DABUR
  { id: 'd1', name: 'Anmol Nariyal Tel 62/-', company: 'Dabur', mrp: 62, offerPrice: 47, stock: 52, unit: 'Bottle', category: 'Hair Oil', isFeatured: true },
  
  // P.N.G
  { id: 'p1', name: 'Ariel 1kg Matic', company: 'P.N.G', mrp: 240, offerPrice: 215, stock: 15, unit: 'Packet', category: 'Laundry', isFeatured: true },
  { id: 'p2', name: 'Tide 500g', company: 'P.N.G', mrp: 60, offerPrice: 54, stock: 40, unit: 'Packet', category: 'Laundry' },

  // NANDAN BAKERY
  { id: 'nb1', name: 'Nandan Cream Cookies', company: 'Nandan Bakery', mrp: 40, offerPrice: 35, stock: 60, unit: 'Packet', category: 'Bakery' },
  
  // BOOMER
  { id: 'bm1', name: 'Boomer Strawberry 1/-', company: 'Boomer', mrp: 180, offerPrice: 160, stock: 20, unit: 'Box', category: 'Confectionery' },
  
  // PATANJALI
  { id: 'pn1', name: 'Dant Kanti 100g 55/-', company: 'Patanjali', mrp: 55, offerPrice: 50, stock: 100, unit: 'Tube', category: 'Patanjali' },
  { id: 'pf1', name: 'Patanjali Ghee 1L 650/-', company: 'Patanjali', mrp: 650, offerPrice: 620, stock: 15, unit: 'Bottle', category: 'Patanjali', isFeatured: true },

  // RHM (Spices)
  { id: 'r1', name: 'AK dhaniya 500g', company: 'R.H.M', mrp: 95, offerPrice: 85, stock: 8, unit: 'Packet', category: 'Spices', minQty: 1, orderStep: 0.5 },
  { id: 'r2', name: 'AK haldi 500g', company: 'R.H.M', mrp: 75, offerPrice: 67, stock: 20, unit: 'Packet', category: 'Spices', minQty: 1, orderStep: 0.5 }
];

export const MOCK_ORDERS = [
  {
    id: 'o1',
    orderNumber: '123456',
    totalAmount: 1245,
    status: 'delivered',
    route: 'Route 1 (City)',
    items: [
      { name: 'Mohini Chai 250g', quantity: 3 },
      { name: 'Colgate Strong 200g 130/-', quantity: 2 }
    ],
    createdAt: { toDate: () => new Date('2026-05-08T10:30:00Z') }
  },
  {
    id: 'o2',
    orderNumber: '654321',
    totalAmount: 2200,
    status: 'packed',
    route: 'Route 3 (South)',
    items: [
      { name: 'Ariel 1kg Matic', quantity: 5 },
      { name: 'Dant Kanti 100g 55/-', quantity: 10 }
    ],
    createdAt: { toDate: () => new Date('2026-05-09T14:45:00Z') }
  },
  {
    id: 'o3',
    orderNumber: '789012',
    totalAmount: 670,
    status: 'placed',
    route: 'Route 2 (North)',
    items: [
      { name: 'Mohini 10/-', quantity: 10 },
      { name: 'Good Day 10/-', quantity: 12 }
    ],
    createdAt: { toDate: () => new Date('2026-05-10T08:15:00Z') }
  }
];
