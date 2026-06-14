"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/lib/toast";
import { RoleGuard } from "@/components/RoleGuard";
import { Package, RotateCcw, ShoppingBag, Loader2, Truck, AlertTriangle } from "lucide-react";

interface OrderItem {
  productId: string;
  title: string;
  variant: string;
  price: number;
  quantity: number;
}

interface Order {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: string;
  status: string;
  createdAt: string;
}

interface BuyerReturn {
  _id: string;
  aiGrade: string;
  aiSummary: string;
  refundAmount: number;
  status: string;
  createdAt: string;
  productId: {
    _id: string;
    title: string;
    category: string;
    originalPrice: number;
    images?: string[];
  };
}

type Tab = "orders" | "delivered" | "returns";

export default function BuyerOrdersPage() {
  const [tab, setTab] = useState<Tab>("delivered");
  const [orders, setOrders] = useState<Order[]>([]);
  const [returns, setReturns] = useState<BuyerReturn[]>([]);
  const [loading, setLoading] = useState(true);
  const [returningItem, setReturningItem] = useState<string | null>(null);
  const [returnReason, setReturnReason] = useState("");
  const [showReturnModal, setShowReturnModal] = useState<{ orderId: string; productId: string; title: string } | null>(null);
  const { showError, showSuccess } = useToast();

  function fetchData() {
    setLoading(true);
    // Fetch independently so one failure doesn't block the other
    api<Order[]>("/cart/orders")
      .then(setOrders)
      .catch((e) => { console.error("Failed to fetch orders:", e); setOrders([]); });
    api<BuyerReturn[]>("/returns/my-buyer-returns")
      .then(setReturns)
      .catch((e) => { console.error("Failed to fetch returns:", e); setReturns([]); })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function initiateReturn() {
    if (!showReturnModal) return;
    setReturningItem(showReturnModal.productId);
    try {
      await api("/returns/buyer-return", {
        method: "POST",
        body: JSON.stringify({
          orderId: showReturnModal.orderId,
          productId: showReturnModal.productId,
          reason: returnReason || "Buyer requested return",
        }),
      });
      setShowReturnModal(null);
      setReturnReason("");
      showSuccess("Return initiated successfully! Refund will be processed.");
      // Refresh both lists
      api<Order[]>("/cart/orders").then(setOrders).catch(() => {});
      api<BuyerReturn[]>("/returns/my-buyer-returns").then(setReturns).catch(() => {});
      setTab("returns");
    } catch (e: any) {
      showError(e.message || "Failed to initiate return");
    } finally {
      setReturningItem(null);
    }
  }

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

  // Split orders into categories
  const myOrders = orders.filter((o) => o.status === "PENDING" || o.status === "PAID" || o.status === "SHIPPED");
  const deliveredOrders = orders.filter((o) => o.status === "DELIVERED");
  const cancelledOrders = orders.filter((o) => o.status === "CANCELLED");

  return (
    <RoleGuard allowed={["buyer"]}>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-3xl font-bold text-slate-900">My Orders & Returns</h1>
        <p className="text-slate-600 mt-1">Track your purchases, deliveries, and returns.</p>

        {/* Tab Switcher */}
        <div className="mt-6 flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
          <TabBtn active={tab === "orders"} onClick={() => setTab("orders")}>
            <ShoppingBag className="size-4" />
            My Orders ({myOrders.length})
          </TabBtn>
          <TabBtn active={tab === "delivered"} onClick={() => setTab("delivered")}>
            <Truck className="size-4" />
            Delivered ({deliveredOrders.length})
          </TabBtn>
          <TabBtn active={tab === "returns"} onClick={() => setTab("returns")}>
            <RotateCcw className="size-4" />
            Returns ({returns.length + cancelledOrders.length})
          </TabBtn>
        </div>

        {loading ? (
          <div className="mt-10 text-center text-slate-500">Loading...</div>
        ) : (
          <>
            {/* ==================== MY ORDERS TAB ==================== */}
            {tab === "orders" && (
              <div className="mt-6 space-y-4">
                {myOrders.length === 0 ? (
                  <EmptyState icon={<ShoppingBag className="size-12 text-slate-300" />} title="No active orders" subtitle="Items you purchase will appear here." />
                ) : (
                  myOrders.map((order) => (
                    <OrderCard key={order._id} order={order} />
                  ))
                )}
              </div>
            )}

            {/* ==================== DELIVERED TAB ==================== */}
            {tab === "delivered" && (
              <div className="mt-6 space-y-4">
                {deliveredOrders.length === 0 ? (
                  <EmptyState icon={<Truck className="size-12 text-slate-300" />} title="No delivered orders" subtitle="Items that have been delivered will appear here with a return option." />
                ) : (
                  deliveredOrders.map((order) => (
                    <div key={order._id} className="card p-0 overflow-hidden">
                      <div className="px-5 py-3 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-4 text-xs text-slate-600">
                          <span className="font-medium text-emerald-700">✓ Delivered</span>
                          <span>Order #{order._id.slice(-8).toUpperCase()}</span>
                          <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                        <span className="text-xs font-medium text-slate-700">₹{order.totalAmount}</span>
                      </div>
                      <div className="divide-y divide-slate-100">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="px-5 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                                <Package className="size-5 text-slate-400" />
                              </div>
                              <div>
                                <p className="font-medium text-slate-800 text-sm">{item.title}</p>
                                <p className="text-xs text-slate-500">
                                  Qty: {item.quantity} • ₹{item.price}
                                  {item.variant && ` • ${item.variant}`}
                                </p>
                              </div>
                            </div>
                            {isWithin7Days(order.createdAt) ? (
                              <button
                                onClick={() => setShowReturnModal({ orderId: order._id, productId: String(item.productId), title: item.title })}
                                className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-medium rounded-lg border border-amber-200 transition cursor-pointer"
                              >
                                <RotateCcw className="size-3" />
                                Return ({daysRemaining(order.createdAt)}d left)
                              </button>
                            ) : (
                              <span className="text-xs text-slate-400 italic">Return window expired</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ==================== RETURNS TAB ==================== */}
            {tab === "returns" && (
              <div className="mt-6 space-y-4">
                {returns.length === 0 && cancelledOrders.length === 0 ? (
                  <EmptyState icon={<RotateCcw className="size-12 text-slate-300" />} title="No returns" subtitle="Items you return will be tracked here." />
                ) : (
                  <>
                    {/* Returns from buyer-return flow */}
                    {returns.map((ret) => (
                      <div key={ret._id} className="card p-5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                            {ret.productId?.images?.[0] ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={ret.productId.images[0]} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Package className="size-6 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">{ret.productId?.title ?? "Unknown Product"}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{ret.aiSummary}</p>
                            <p className="text-xs text-slate-400 mt-1">
                              Returned on {new Date(ret.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-medium text-emerald-700">₹{ret.refundAmount} refund</p>
                          <span className="pill text-[10px] mt-1 bg-emerald-100 text-emerald-700">Returned</span>
                        </div>
                      </div>
                    ))}

                    {/* Cancelled orders (already returned) */}
                    {cancelledOrders.map((order) => (
                      <div key={order._id} className="card p-5">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs text-slate-500">Order #{order._id.slice(-8).toUpperCase()}</span>
                          <span className="pill bg-rose-100 text-rose-700 text-[10px]">Returned</span>
                        </div>
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                              <Package className="size-4 text-slate-400" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-800 text-sm">{item.title}</p>
                              <p className="text-xs text-slate-500">₹{item.price} • Refund processed</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </>
        )}

        {/* Return Confirmation Modal */}
        {showReturnModal && (
          <>
            <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowReturnModal(null)} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="size-5 text-amber-600" />
                  <h3 className="text-lg font-bold text-slate-900">Return Item</h3>
                </div>
                <p className="text-sm text-slate-600">
                  You are returning: <span className="font-medium">{showReturnModal.title}</span>
                </p>
                <div className="mt-4">
                  <label className="text-sm font-medium text-slate-700">Reason for return (optional)</label>
                  <textarea
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    placeholder="e.g. Wrong size, not as expected, changed my mind..."
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-300 text-sm resize-none h-20"
                  />
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  Your refund will be processed after the return is confirmed. The item will be sent back to the seller for resale.
                </p>
                <div className="mt-5 flex gap-3">
                  <button
                    onClick={() => setShowReturnModal(null)}
                    className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-lg transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={initiateReturn}
                    disabled={returningItem !== null}
                    className="flex-1 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm rounded-lg transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
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
      </div>
    </RoleGuard>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer flex items-center gap-1.5 ${
        active ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-800"
      }`}
    >
      {children}
    </button>
  );
}

function EmptyState({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="text-center py-16">
      <div className="mx-auto w-fit">{icon}</div>
      <p className="mt-4 text-slate-500 text-lg">{title}</p>
      <p className="text-sm text-slate-400 mt-1">{subtitle}</p>
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const statusStyles: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-700",
    PAID: "bg-blue-100 text-blue-700",
    SHIPPED: "bg-purple-100 text-purple-700",
  };
  const statusLabels: Record<string, string> = {
    PENDING: "Pending Payment",
    PAID: "Confirmed",
    SHIPPED: "Shipped",
  };

  return (
    <div className="card p-0 overflow-hidden">
      <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span>Order #{order._id.slice(-8).toUpperCase()}</span>
          <span>{new Date(order.createdAt).toLocaleDateString()}</span>
          <span className="font-medium text-slate-700">₹{order.totalAmount}</span>
        </div>
        <span className={`pill ${statusStyles[order.status] ?? "bg-slate-100 text-slate-700"}`}>
          {statusLabels[order.status] ?? order.status}
        </span>
      </div>
      <div className="divide-y divide-slate-100">
        {order.items.map((item, idx) => (
          <div key={idx} className="px-5 py-4 flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
              <Package className="size-5 text-slate-400" />
            </div>
            <div>
              <p className="font-medium text-slate-800 text-sm">{item.title}</p>
              <p className="text-xs text-slate-500">
                Qty: {item.quantity} • ₹{item.price}
                {item.variant && ` • ${item.variant}`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
