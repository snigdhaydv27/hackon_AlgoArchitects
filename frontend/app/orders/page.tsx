"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import Link from "next/link";
import { Package, RotateCcw, Clock, CheckCircle2, ChevronRight, Store, AlertTriangle, Loader2 } from "lucide-react";
import { RoleGuard } from "@/components/RoleGuard";

// Types
interface OrderItem { productId: string; title: string; price: number; quantity: number; variant: string }
interface Order { _id: string; items: OrderItem[]; totalAmount: number; status: string; createdAt: string; returnedProductIds?: string[]; }
interface Listing { _id: string; title: string; priceFinal: number; status: string; createdAt: string; grade: string; }
interface Return { _id: string; status: string; route: string; createdAt: string; productId: { _id: string, title: string }; estimatedRecovery: number; refundAmount: number; aiSummary: string; }

export default function OrdersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"active" | "delivered" | "resell" | "returns">("active");
  const [orders, setOrders] = useState<Order[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [returns, setReturns] = useState<Return[]>([]);
  const [showReturnModal, setShowReturnModal] = useState<{ orderId: string; productId: string; title: string } | null>(null);
  const [returnReason, setReturnReason] = useState("");
  const [returningItem, setReturningItem] = useState<string | null>(null);
  const [returnError, setReturnError] = useState<string | null>(null);
  const [returnSuccess, setReturnSuccess] = useState<string | null>(null);
  const [localReturnedItems, setLocalReturnedItems] = useState<Set<string>>(new Set());

  function fetchData() {
    if (!user) return;
    api<Order[]>("/cart/orders").then(setOrders).catch(console.error);
    api<Listing[]>("/listings").then(setListings).catch(console.error);
    api<Return[]>("/returns/my-buyer-returns").then(setReturns).catch(() => {
      // Fallback to seller returns if buyer-returns not available
      api<Return[]>("/returns").then(setReturns).catch(console.error);
    });
  }

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  if (loading) return <div className="p-8 text-center text-[#565959]">Loading your orders...</div>;
  if (!user) { router.replace("/login"); return null; }

  const activeOrders = orders.filter(o => o.status !== "CANCELLED");
  const deliveredOrders = orders.filter(o => o.status === "DELIVERED");

  function isWithin7Days(dateStr: string) {
    const orderDate = new Date(dateStr);
    const daysSince = (Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysSince <= 7;
  }

  function daysRemaining(dateStr: string) {
    const orderDate = new Date(dateStr);
    const daysSince = (Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24);
    return Math.max(0, Math.ceil(7 - daysSince));
  }

  async function initiateReturn() {
    if (!showReturnModal) return;
    setReturningItem(showReturnModal.productId);
    setReturnError(null);
    try {
      await api("/returns/buyer-return", {
        method: "POST",
        body: JSON.stringify({
          orderId: showReturnModal.orderId,
          productId: showReturnModal.productId,
          reason: returnReason || "Buyer requested return",
        }),
      });
      // Immediately track this item as returned locally to prevent re-clicks
      setLocalReturnedItems(prev => new Set(prev).add(`${showReturnModal.orderId}_${showReturnModal.productId}`));
      setShowReturnModal(null);
      setReturnReason("");
      setReturnSuccess("Return initiated successfully! Refund will be processed.");
      // Refresh data
      fetchData();
      setActiveTab("returns");
      setTimeout(() => setReturnSuccess(null), 5000);
    } catch (e: any) {
      setReturnError(e.message || "Failed to initiate return");
    } finally {
      setReturningItem(null);
    }
  }

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

          {/* Success message */}
          {returnSuccess && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
              {returnSuccess}
            </div>
          )}

          {/* Tabs */}
          <div className="flex flex-wrap gap-4 border-b border-[#D5D9D9] mb-6 text-sm font-semibold text-[#0F1111]">
            <button 
              onClick={() => setActiveTab("active")}
              className={`pb-2 px-1 border-b-2 transition-colors ${activeTab === "active" ? "border-[#e77600] text-[#0F1111]" : "border-transparent text-[#007185] hover:text-[#c45500] hover:border-[#c45500]"}`}
            >
              My Orders ({activeOrders.length})
            </button>
            <button 
              onClick={() => setActiveTab("delivered")}
              className={`pb-2 px-1 border-b-2 transition-colors ${activeTab === "delivered" ? "border-[#e77600] text-[#0F1111]" : "border-transparent text-[#007185] hover:text-[#c45500] hover:border-[#c45500]"}`}
            >
              Delivered ({deliveredOrders.length})
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
              My Returns ({returns.length})
            </button>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            
            {/* MY ORDERS */}
            {activeTab === "active" && (
              <>
                {activeOrders.length === 0 && <p className="text-[#565959] p-4 bg-[#F8F9FA] rounded">You have no orders yet.</p>}
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
                        <div>
                          <p className="uppercase text-xs font-bold mb-1">Status</p>
                          <p className={`font-bold ${order.status === "DELIVERED" ? "text-green-700" : "text-[#e77600]"}`}>
                            {order.status === "DELIVERED" ? "Delivered" : order.status === "PAID" ? "Confirmed" : order.status === "SHIPPED" ? "Shipped" : "Pending"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="uppercase text-xs font-bold mb-1">Order #</p>
                        <p className="text-xs">{order._id.slice(-8).toUpperCase()}</p>
                      </div>
                    </div>
                    <div className="p-4">
                      {order.status === "DELIVERED" ? (
                        <h3 className="font-bold text-lg mb-4 text-green-700 flex items-center gap-2">
                          <CheckCircle2 className="size-5" /> Delivered
                        </h3>
                      ) : (
                        <h3 className="font-bold text-lg mb-4 text-[#008296] flex items-center gap-2">
                          <Clock className="size-5" /> {order.status === "SHIPPED" ? "On the way" : "Processing"}
                        </h3>
                      )}
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
                        <p className="text-xs">{order._id.slice(-8).toUpperCase()}</p>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-4 text-green-700 flex items-center gap-2">
                        <CheckCircle2 className="size-5" /> Delivered
                      </h3>
                      {order.items
                        .filter(item => !order.returnedProductIds?.includes(String(item.productId)) && !localReturnedItems.has(`${order._id}_${item.productId}`))
                        .map((item, i) => (
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
                            {isWithin7Days(order.createdAt) ? (
                              <button
                                onClick={() => setShowReturnModal({ orderId: order._id, productId: String(item.productId), title: item.title })}
                                className="inline-flex items-center justify-center gap-1.5 bg-white border border-[#D5D9D9] rounded shadow-sm px-4 py-2 text-sm font-semibold text-[#0F1111] hover:bg-slate-50 transition-colors w-full sm:w-auto cursor-pointer"
                              >
                                <RotateCcw className="size-3.5" />
                                Return ({daysRemaining(order.createdAt)}d left)
                              </button>
                            ) : (
                              <span className="text-xs text-[#565959] italic">Return window expired</span>
                            )}
                          </div>
                        </div>
                      ))}
                      {/* Show returned items as greyed out */}
                      {order.items
                        .filter(item => order.returnedProductIds?.includes(String(item.productId)) || localReturnedItems.has(`${order._id}_${item.productId}`))
                        .map((item, i) => (
                        <div key={`returned-${i}`} className="flex items-start gap-4 mb-4 pb-4 border-b border-gray-100 last:border-0 last:mb-0 last:pb-0 opacity-50">
                          <div className="w-16 h-16 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center">
                            <Package className="text-gray-400" />
                          </div>
                          <div>
                            <p className="font-bold text-[#565959]">{item.title}</p>
                            <p className="text-sm text-[#565959]">Qty: {item.quantity}</p>
                            <p className="text-xs text-orange-600 mt-1 font-medium">✓ Returned</p>
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
                      {ret.route && <p className="text-sm text-[#565959] mt-1">Route: <span className="font-bold text-emerald-700">{ret.route}</span></p>}
                      <p className="text-[#008296] font-bold text-sm mt-1">Refund: ₹{ret.refundAmount || ret.estimatedRecovery}</p>
                      <p className="text-xs text-[#565959] mt-1">Returned on {new Date(ret.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </>
            )}

          </div>

        </div>
      </div>

      {/* Return Confirmation Modal */}
      {showReturnModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => { setShowReturnModal(null); setReturnError(null); }} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="size-5 text-amber-600" />
                <h3 className="text-lg font-bold text-[#0F1111]">Return Item</h3>
              </div>
              <p className="text-sm text-[#565959]">
                You are returning: <span className="font-medium text-[#0F1111]">{showReturnModal.title}</span>
              </p>
              <div className="mt-4">
                <label className="text-sm font-medium text-[#0F1111]">Reason for return (optional)</label>
                <textarea
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  placeholder="e.g. Wrong size, not as expected, changed my mind..."
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-[#D5D9D9] text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-[#e77600]"
                />
              </div>
              {returnError && (
                <p className="mt-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2">{returnError}</p>
              )}
              <p className="mt-3 text-xs text-[#565959]">
                Your refund will be processed after the return is confirmed. The item may be resold locally to reduce waste.
              </p>
              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => { setShowReturnModal(null); setReturnError(null); setReturnReason(""); }}
                  className="flex-1 px-4 py-2.5 bg-[#F0F2F2] hover:bg-[#D5D9D9] text-[#0F1111] font-medium text-sm rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={initiateReturn}
                  disabled={returningItem !== null}
                  className="flex-1 px-4 py-2.5 bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] font-bold text-sm rounded-lg transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {returningItem ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <RotateCcw className="size-4" />
                  )}
                  Confirm Return
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </RoleGuard>
  );
}
