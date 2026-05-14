import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = "mongodb+srv://vedantkasaudhan87_db_user:cXP4h660Br4avAhx@cluster0.fy2uzd6.mongodb.net/?appName=Cluster0";

await mongoose.connect(MONGODB_URI);

const AdminSchema = new mongoose.Schema(
  {},
  { strict: false }
);

const Admin = mongoose.model("admins", AdminSchema);

async function createAdmin() {

  const hashedPassword = await bcrypt.hash(
    "admin123",
    10
  );

  await Admin.create({
    name: "Vedant",
    email: "admin@jsr.com",
    password: hashedPassword,
    role: "super_admin",
    isActive: true,
  });

  console.log("Admin Created");

  process.exit();
}

createAdmin();