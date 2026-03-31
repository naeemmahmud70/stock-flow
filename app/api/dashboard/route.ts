import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import Order from "@/models/Order";
import Product from "@/models/Product";
import RestockQueue from "@/models/RestockQueue";

export async function GET(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [
    todayOrders,
    pendingOrders,
    completedOrders,
    revenueAgg,
    lowStockCount,
    productSummary,
    recentOrders,
    ordersByStatus,
    revenueByDay,
  ] = await Promise.all([
    Order.countDocuments({ createdAt: { $gte: startOfDay } }),
    Order.countDocuments({ status: "pending" }),
    Order.countDocuments({ status: { $in: ["delivered", "shipped"] } }),
    Order.aggregate([
      { $match: { createdAt: { $gte: startOfDay }, status: { $ne: "cancelled" } } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]),
    RestockQueue.countDocuments(),
    Product.find({}, "name stock minStockThreshold status")
      .sort({ stock: 1 })
      .limit(10),
    Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("items.product", "name"),
    Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          status: { $ne: "cancelled" },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalPrice" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      totalOrdersToday: todayOrders,
      pendingOrders,
      completedOrders,
      revenueToday: revenueAgg[0]?.total ?? 0,
      lowStockCount,
      productSummary,
      recentOrders,
      ordersByStatus,
      revenueByDay: revenueByDay.map((d) => ({ date: d._id, revenue: d.revenue, orders: d.orders })),
    },
  });
}
