"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Bell } from "lucide-react";

interface Notification {
  _id: string;
  title: string;
  body: string;
  listingId?: string;
  read: boolean;
  createdAt: string;
}

export function BuyerInbox() {
  const [open, setOpen] = useState(false);
  const [list, setList] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  async function refresh() {
    try {
      const [items, count] = await Promise.all([
        api<Notification[]>("/notifications"),
        api<{ count: number }>("/notifications/unread-count"),
      ]);
      setList(items);
      setUnread(count.count);
    } catch {
      // user not logged in or backend down — silently ignore
    }
  }

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 15000); // poll every 15s
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function markAllRead() {
    await api("/notifications/read-all", { method: "POST" });
    setUnread(0);
    setList((l) => l.map((n) => ({ ...n, read: true })));
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => {
          setOpen((o) => !o);
          if (unread > 0) markAllRead();
        }}
        className="relative rounded-lg p-2 hover:bg-slate-100"
        aria-label="Notifications"
      >
        <Bell className="size-5 text-slate-700" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 size-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-auto card shadow-lg z-50">
          <div className="px-4 py-2 border-b border-slate-200 flex items-center justify-between">
            <span className="font-semibold text-sm">For You</span>
            <span className="text-xs text-slate-500">{list.length}</span>
          </div>
          {list.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-500">
              No notifications yet. New Neighbor First listings near you will appear here.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {list.map((n) => (
                <Link
                  key={n._id}
                  href={n.listingId ? `/buyer/reserve/${n.listingId}` : "#"}
                  className={
                    "block px-4 py-3 hover:bg-slate-50 " + (n.read ? "" : "bg-brand-50/40")
                  }
                  onClick={() => setOpen(false)}
                >
                  <div className="text-sm font-medium text-slate-900">{n.title}</div>
                  <div className="text-xs text-slate-600 mt-0.5">{n.body}</div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
