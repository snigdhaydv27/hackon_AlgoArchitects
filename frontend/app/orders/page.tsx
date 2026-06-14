"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import Link from "next/link";
import { Package, RotateCcw, Clock, CheckCircle2, ChevronRight, Store } from "lucide-react";
import { RoleGuard } from "@/components/RoleGuard";

// Types
interface OrderItem { productId: string; title: string; price: number; quantity: number; variant: string }
interface Order { _id: string; items: OrderItem[]; totalAmount: number; status: string; createdAt: string; }
interface Listing { _id: string; title: string; priceFinal: number; status: string; createdAt: string; grade: string; }
interface Return { _id: string; status: string; route: string; createdAt: string; productId: { _id: string, title: string }; estimatedRecovery: number; }

export default function OrdersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"active" | "delivered" | "resell" | "returns">("active");
  const [orders, setOrders] = useState<Order[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [returns, setReturns] = useState<Return[]>([]);

  useEffect(() => {
    if (user) {
      api<Order[]>("/cart/orders").then(setOrders).catch(console.error);
      api<Listing[]>("/listings").then(setListings).catch(console.error);
      api<Return[]>("/returns").then(setReturns).catch(console.error);
    }
  }, [user]);

  if (loading) return <div className="p-8 text-center text-[#565959]">Loading your orders...</div>;
  if (!user) { router.replace("/login"); return null; }

  const activeOrders = orders.filter(o => o.status !== "DELIVERED" && o.status !== "CANCELLED");
  const deliveredOrders = orders.filter(o => o.status === "DELIVERED");

  return (
    <RoleGuard allowed={["buyer", "seller", "small_seller", "admin"]}>
      <div className="bg-white min-h-screen font-sans text-[#0F1111]">
        <div className="mx-auto max-w-[1000px] p-4 py-8">
          
          {/* Breadcrumb */}
          <div className="flex items-center text-sm mb-4 text-[#565959]">
            <Link href="/account" className="hover:underline hover:text-[#c45500]">Your Account</Link>
            <ChevronRight className="size-4 mx-1" />
            <span className="text-[#c45500]">Your Orders</span>
          </div>

          <h1 className="text-3xl font-normal mb-6">Your Orders</h1>

          {/* Tabs */}
          <div className="flex flex-wrap gap-4 border-b border-[#D5D9D9] mb-6 text-sm font-semibold text-[#0F1111]">
            <button 
              onClick={() => setActiveTab("active")}
              className={`pb-2 px-1 border-b-2 transition-colors ${activeTab === "active" ? "border-[#e77600] text-[#0F1111]" : "border-transparent text-[#007185] hover:text-[#c45500] hover:border-[#c45500]"}`}
            >
              Active Orders
            </button>
            <button 
              onClick={() => setActiveTab("delivered")}
              className={`pb-2 px-1 border-b-2 transition-colors ${activeTab === "delivered" ? "border-[#e77600] text-[#0F1111]" : "border-transparent text-[#007185] hover:text-[#c45500] hover:border-[#c45500]"}`}
            >
              Delivered
            </button>
            <button 
              onClick={() => setActiveTab("resell")}
              className={`pb-2 px-1 border-b-2 transition-colors ${activeTab === "resell" ? "border-[#e77600] text-[#0F1111]" : "border-transparent text-[#007185] hover:text-[#c45500] hover:border-[#c45500]"}`}
            >
              Resell Items
            </button>
            <button 
              onClick={() => setActiveTab("returns")}
              className={`pb-2 px-1 border-b-2 transition-colors ${activeTab === "returns" ? "border-[#e77600] text-[#0F1111]" : "border-transparent text-[#007185] hover:text-[#c45500] hover:border-[#c45500]"}`}
            >
              My Returns
            </button>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            
            {/* ACTIVE ORDERS */}
            {activeTab === "active" && (
              <>
                {activeOrders.length === 0 && <p className="text-[#565959] p-4 bg-[#F8F9FA] rounded">You have no active orders.</p>}
                {activeOrders.map(order => (
                  <div key={order._id} className="border border-[#D5D9D9] rounded-lg overflow-hidden">
                    <div className="bg-[#F0F2F2] p-4 text-sm flex flex-wrap justify-between text-[#565959] border-b border-[#D5D9D9]">
                      <div className="flex gap-8">
                        <div>
                          <p className="uppercase text-xs font-bold mb-1">Order Placed</p>
                          <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="uppercase text-xs font-bold mb-1">Total</p>
                          <p>₹{order.totalAmount}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="uppercase text-xs font-bold mb-1">Order #</p>
                        <p>{order._id}</p>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-4 text-[#008296] flex items-center gap-2">
                        <Clock className="size-5" /> Arriving Soon
                      </h3>
                      {order.items.map((item, i) => (
                        <div key={i} className="flex items-start gap-4 mb-4 pb-4 border-b border-gray-100 last:border-0 last:mb-0 last:pb-0">
                          <div className="w-16 h-16 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center">
                            <Package className="text-gray-400" />
                          </div>
                          <div>
                            <p className="font-bold text-[#007185] hover:underline cursor-pointer">{item.title}</p>
                            <p className="text-sm text-[#565959]">Qty: {item.quantity} {item.variant ? `| ${item.variant}` : ""}</p>
                            <p className="text-[#B12704] font-bold text-sm mt-1">₹{item.price}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* DELIVERED ORDERS */}
            {activeTab === "delivered" && (
              <>
                {deliveredOrders.length === 0 && <p className="text-[#565959] p-4 bg-[#F8F9FA] rounded">You have no delivered orders.</p>}
                {deliveredOrders.map(order => (
                  <div key={order._id} className="border border-[#D5D9D9] rounded-lg overflow-hidden">
                    <div className="bg-[#F0F2F2] p-4 text-sm flex flex-wrap justify-between text-[#565959] border-b border-[#D5D9D9]">
                      <div className="flex gap-8">
                        <div>
                          <p className="uppercase text-xs font-bold mb-1">Order Placed</p>
                          <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="uppercase text-xs font-bold mb-1">Total</p>
                          <p>₹{order.totalAmount}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="uppercase text-xs font-bold mb-1">Order #</p>
                        <p>{order._id}</p>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-4 text-green-700 flex items-center gap-2">
                        <CheckCircle2 className="size-5" /> Delivered
                      </h3>
                      {order.items.map((item, i) => (
                        <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-100 last:border-0 last:mb-0 last:pb-0">
                          <div className="flex items-start gap-4">
                            <div className="w-16 h-16 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center">
                              <Package className="text-gray-400" />
                            </div>
                            <div>
                              <p className="font-bold text-[#007185] hover:underline cursor-pointer">{item.title}</p>
                              <p className="text-sm text-[#565959]">Qty: {item.quantity} {item.variant ? `| ${item.variant}` : ""}</p>
                              <p className="text-[#B12704] font-bold text-sm mt-1">₹{item.price}</p>
                            </div>
                          </div>
                          <div>
                            <Link href={`/seller/return/new?productId=${item.productId}`} className="inline-flex items-center justify-center bg-white border border-[#D5D9D9] rounded shadow-sm px-4 py-2 text-sm font-semibold text-[#0F1111] hover:bg-slate-50 transition-colors w-full sm:w-auto">
                              Return Item
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* RESELL ITEMS */}
            {activeTab === "resell" && (
              <>
                {listings.length === 0 && <p className="text-[#565959] p-4 bg-[#F8F9FA] rounded">You have no resell items (used listings).</p>}
                {listings.map(listing => (
                  <div key={listing._id} className="border border-[#D5D9D9] rounded-lg overflow-hidden p-4 flex gap-4">
                    <div className="w-16 h-16 bg-emerald-50 rounded flex-shrink-0 flex items-center justify-center border border-emerald-100">
                      <Store className="text-emerald-500" />
                    </div>
                    <div className="flex-grow">
                      <p className="font-bold text-[#007185] hover:underline cursor-pointer">{listing.title}</p>
                      <p className="text-sm text-[#565959] mt-1">Status: <span className="font-bold text-[#0F1111] uppercase">{listing.status}</span></p>
                      <p className="text-[#B12704] font-bold text-sm mt-1">₹{listing.priceFinal}</p>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* RETURNS */}
            {activeTab === "returns" && (
              <>
                {returns.length === 0 && <p className="text-[#565959] p-4 bg-[#F8F9FA] rounded">You have not initiated any returns.</p>}
                {returns.map(ret => (
                  <div key={ret._id} className="border border-[#D5D9D9] rounded-lg overflow-hidden p-4 flex gap-4">
                    <div className="w-16 h-16 bg-blue-50 rounded flex-shrink-0 flex items-center justify-center border border-blue-100">
                      <RotateCcw className="text-blue-500" />
                    </div>
                    <div className="flex-grow">
                      <p className="font-bold text-[#0F1111]">{ret.productId?.title || "Unknown Product"}</p>
                      <p className="text-sm text-[#565959] mt-1">Status: <span className="font-bold text-[#0F1111]">{ret.status}</span></p>
                      <p className="text-sm text-[#565959] mt-1">Route: <span className="font-bold text-emerald-700">{ret.route}</span></p>
                      <p className="text-[#008296] font-bold text-sm mt-1">Estimated Recovery: ₹{ret.estimatedRecovery}</p>
                    </div>
                  </div>
                ))}
              </>
            )}

          </div>

        </div>
      </div>
    </RoleGuard>
  );
}
