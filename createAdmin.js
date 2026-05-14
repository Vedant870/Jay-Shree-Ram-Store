import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is required. Add it in .env.local or environment variables.");
}

await mongoose.connect(MONGODB_URI);

const AdminSchema = new mongoose.Schema(
  {},
  { strict: false }
);

const Admin = mongoose.model("admins", AdminSchema);

async function createAdmin() {

  const adminName = process.env.ADMIN_NAME || "Vedant";
  const adminEmail = process.env.ADMIN_EMAIL || "admin@jsr.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  const hashedPassword = await bcrypt.hash(
    adminPassword,
    10
  );

  await Admin.create({
    name: adminName,
    email: adminEmail,
    password: hashedPassword,
    role: "super_admin",
    isActive: true,
  });

  console.log("Admin Created");

  process.exit();
}

createAdmin();
