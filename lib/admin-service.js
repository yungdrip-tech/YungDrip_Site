import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";

export async function getAdminStats() {
  await connectToDatabase();

  const [totalOrders, ordersByStatus, revenueResult, totalProducts, totalUsers] = await Promise.all([
    Order.countDocuments(),
    Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Order.aggregate([
      { $match: { "payment.status": "paid" } },
      { $group: { _id: null, total: { $sum: "$pricing.total" } } }
    ]),
    Product.countDocuments(),
    User.countDocuments()
  ]);

  const statusCounts = {};

  for (const item of ordersByStatus) {
    statusCounts[item._id] = item.count;
  }

  return {
    totalOrders,
    statusCounts,
    totalRevenue: revenueResult[0]?.total || 0,
    totalProducts,
    totalUsers
  };
}
