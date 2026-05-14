import mongoose from 'mongoose';

// ================= INTERFACES =================

interface IUser {
  name: string;
  email: string;
  password: string;
  role: 'customer' | 'admin' | 'super_admin';
  phone?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface IProduct {
  name: string;
  company: string;
  mrp: number;
  buyPrice: number;
  offerPrice: number;
  stock: number;
  unit: string;
  category: string;
  minQty: number;
  orderStep: number;
  isFeatured: boolean;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  company: string;
  quantity: number;
  price: number;
  buyPrice?: number;
  offerPrice: number;
}

interface IOrder {
  orderNumber: string;
  customerId?: mongoose.Types.ObjectId;
  customerName: string;
  phone: string;
  address: string;
  route: string;
  items: IOrderItem[];
  totalAmount: number;
  status: 'placed' | 'packed' | 'out-for-delivery' | 'delivered' | 'cancelled';
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface IAdmin {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'super_admin';
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export let dbConnected = false;

mongoose.connection.on('disconnected', () => {
  dbConnected = false;
  console.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
  connectDB().catch(() => {
    console.warn('⚠️ MongoDB reconnection attempt failed.');
  });
});

mongoose.connection.on('reconnected', () => {
  dbConnected = true;
  console.log('✅ MongoDB reconnected successfully');
});

export const connectDB = async () => {

  try {

    if (dbConnected) return;

    const mongoURI =
      process.env.MONGODB_URI;

    if (!mongoURI) {

      console.warn(
        '⚠️ MONGODB_URI not set. Running in mock mode.'
      );

      return;
    }

    await mongoose.connect(mongoURI);

    dbConnected = true;

    console.log(
      '✅ MongoDB connected successfully'
    );

  } catch (error) {

    console.warn(
      '⚠️ MongoDB connection failed:',
      error
    );

    dbConnected = false;
  }
};



// ================= USER SCHEMA =================

const userSchema = new mongoose.Schema<IUser>({

  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  role: {
    type: String,

    enum: [
      'customer',
      'admin',
      'super_admin'
    ],

    default: 'customer',
  },

  phone: {
    type: String,
  },

  address: {
    type: String,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },

});

userSchema.pre<IUser>(
  'save',
  function () {

    this.updatedAt = new Date();
  }
);

export const User =
  mongoose.models.User ||
  mongoose.model<IUser>(
    'User',
    userSchema
  );



// ================= PRODUCT SCHEMA =================

const productSchema = new mongoose.Schema<IProduct>({

  name: {
    type: String,
    required: true,
  },

  company: {
    type: String,
    required: true,
  },

  mrp: {
    type: Number,
    required: true,
  },

  buyPrice: {
    type: Number,
    required: true,
    default: 0,
  },

  offerPrice: {
    type: Number,
    required: true,
  },

  stock: {
    type: Number,
    required: true,
    default: 0,
  },

  unit: {
    type: String,
    required: true,
  },

  category: {
    type: String,
    required: true,
  },

  minQty: {
    type: Number,
    default: 1,
  },

  orderStep: {
    type: Number,
    default: 1,
  },

  isFeatured: {
    type: Boolean,
    default: false,
  },

  imageUrl: {
    type: String,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },

});

productSchema.pre<IProduct>(
  'save',
  function () {

    this.updatedAt = new Date();
  }
);

export const Product =
  mongoose.models.Product ||
  mongoose.model<IProduct>(
    'Product',
    productSchema
  );



// ================= ORDER ITEM SCHEMA =================

const orderItemSchema =
  new mongoose.Schema<IOrderItem>({

    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    company: {
      type: String,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    offerPrice: {
      type: Number,
      required: true,
    },

  });



// ================= ORDER SCHEMA =================

const orderSchema = new mongoose.Schema<IOrder>({

  orderNumber: {
    type: String,
    required: true,
    unique: true,
  },

  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  customerName: {
    type: String,
    required: true,
  },

  phone: {
    type: String,
    required: true,
  },

  address: {
    type: String,
    required: true,
  },

  route: {
    type: String,
    default: 'Route 1 (City)',
  },

  items: [orderItemSchema],

  totalAmount: {
    type: Number,
    required: true,
  },

  status: {

    type: String,

    enum: [
      'placed',
      'packed',
      'out-for-delivery',
      'delivered',
      'cancelled'
    ],

    default: 'placed',
  },

  note: {
    type: String,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },

});

orderSchema.pre<IOrder>(
  'save',
  function () {

    this.updatedAt = new Date();
  }
);

export const Order =
  mongoose.models.Order ||
  mongoose.model<IOrder>(
    'Order',
    orderSchema
  );



// ================= ADMIN SCHEMA =================

const adminSchema = new mongoose.Schema<IAdmin>({

  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    enum: [
      'admin',
      'super_admin'
    ],
    default: 'admin',
  },

  phone: {
    type: String,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },

});

adminSchema.pre<IAdmin>(
  'save',
  function () {

    this.updatedAt = new Date();
  }
);

export const Admin =
  mongoose.models.Admin ||
  mongoose.model<IAdmin>(
    'Admin',
    adminSchema
  );
