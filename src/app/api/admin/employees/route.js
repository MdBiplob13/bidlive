import { z } from "zod";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { ok, fail, handler } from "@/lib/apiResponse";
import User from "@/models/User";
import { bdPhone } from "@/lib/validations";

const createEmployeeSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(60),
  phone: bdPhone,
  password: z.string().min(6, "Password must be at least 6 characters"),
  permissions: z.array(z.string()),
});

// GET /api/admin/employees — List all employees (Admin only)
export const GET = handler(async (req) => {
  await requireAdmin();
  await connectDB();

  const employees = await User.find({ role: "employee" })
    .select("-password")
    .sort({ createdAt: -1 })
    .lean();

  return ok({
    employees: employees.map((e) => ({
      ...e,
      _id: String(e._id),
    })),
  });
});

// POST /api/admin/employees — Create an employee (Admin only)
export const POST = handler(async (req) => {
  await requireAdmin();
  const body = await req.json();
  const { name, phone, password, permissions } = createEmployeeSchema.parse(body);

  await connectDB();

  // Check if phone number is already registered
  const existing = await User.findOne({ phone });
  if (existing) {
    return fail("Phone number is already registered.", 400);
  }

  try {
    const employee = await User.create({
      name,
      phone,
      password,
      role: "employee",
      permissions,
      isVerified: true,
    });

    return ok({
      message: "Employee account successfully created.",
      employee: {
        _id: String(employee._id),
        name: employee.name,
        phone: employee.phone,
        role: employee.role,
        permissions: employee.permissions,
      },
    });
  } catch (error) {
    return fail(error.message, 400);
  }
});
