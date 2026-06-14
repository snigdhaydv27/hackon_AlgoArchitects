"use client";

import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function ProfileSettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [tagline, setTagline] = useState("");
  
  const [editMode, setEditMode] = useState<"name" | "avatar" | "tagline" | null>(null);
  
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    } else if (user) {
      setName(user.name || "");
      setAvatar(user.avatar || "");
      setTagline((user as any).tagline || "");
    }
  }, [user, loading, router]);

  if (loading || !user) return <div className="p-8 text-center">Loading...</div>;

  async function handleSave(field: "name" | "avatar" | "tagline") {
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const payload = {
        name: field === "name" ? name : user?.name,
        avatar: field === "avatar" ? avatar : user?.avatar,
        tagline: field === "tagline" ? tagline : (user as any)?.tagline,
      };

      await api("/auth/me/profile", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      setSuccess(true);
      setEditMode(null);
      setTimeout(() => window.location.reload(), 1500);
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white min-h-screen font-sans text-[#0F1111]">
      <div className="mx-auto max-w-[600px] p-4 py-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center text-sm mb-4 text-[#565959]">
          <Link href="/account" className="hover:underline hover:text-[#007185]">Your Account</Link>
          <ChevronRight className="size-4 mx-1 text-[#565959]" />
          <span className="text-[#c45500]">Login & security</span>
        </div>

        <h1 className="text-3xl font-normal mb-8">Login & security</h1>

        {success && (
          <div className="mb-6 p-4 border-l-4 border-green-600 bg-green-50 text-green-800 rounded shadow-sm">
            <p className="font-bold">Success</p>
            <p className="text-sm">Your profile has been updated. Refreshing...</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 border-l-4 border-red-600 bg-red-50 text-red-800 rounded shadow-sm">
            <p className="font-bold">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="border border-[#D5D9D9] rounded-lg overflow-hidden">
          
          {/* NAME ROW */}
          {editMode === "name" ? (
            <div className="p-6 border-b border-[#D5D9D9] bg-white">
              <h3 className="font-bold text-sm mb-2">Change your name</h3>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-[#888C8C] rounded px-3 py-2 mb-4 focus:border-[#e77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)] outline-none transition-all"
                required
              />
              <button 
                onClick={() => handleSave("name")}
                disabled={saving}
                className="bg-[#F7CA00] hover:bg-[#F0B800] border border-[#A2A6AC] rounded-lg px-6 py-2 text-sm font-bold shadow-sm transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          ) : (
            <div className="p-4 border-b border-[#D5D9D9] flex justify-between items-center hover:bg-slate-50 transition-colors">
              <div>
                <p className="font-bold text-sm">Name</p>
                <p className="text-sm text-[#565959]">{user.name}</p>
              </div>
              <button onClick={() => setEditMode("name")} className="border border-[#D5D9D9] px-6 py-1.5 rounded-lg shadow-sm bg-white hover:bg-slate-50 text-sm font-semibold">
                Edit
              </button>
            </div>
          )}

          {/* AVATAR ROW */}
          {editMode === "avatar" ? (
            <div className="p-6 border-b border-[#D5D9D9] bg-white">
              <h3 className="font-bold text-sm mb-2">Change your avatar URL</h3>
              <input 
                type="url" 
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://example.com/avatar.png"
                className="w-full border border-[#888C8C] rounded px-3 py-2 focus:border-[#e77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)] outline-none transition-all"
              />
              <p className="text-xs text-[#565959] mt-2 mb-4">Paste a direct link to an image file.</p>
              <button 
                onClick={() => handleSave("avatar")}
                disabled={saving}
                className="bg-[#F7CA00] hover:bg-[#F0B800] border border-[#A2A6AC] rounded-lg px-6 py-2 text-sm font-bold shadow-sm transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          ) : (
            <div className="p-4 border-b border-[#D5D9D9] flex justify-between items-center hover:bg-slate-50 transition-colors">
              <div>
                <p className="font-bold text-sm">Avatar</p>
                <p className="text-sm text-[#565959] truncate max-w-[300px]">{user.avatar || "Not set"}</p>
              </div>
              <button onClick={() => setEditMode("avatar")} className="border border-[#D5D9D9] px-6 py-1.5 rounded-lg shadow-sm bg-white hover:bg-slate-50 text-sm font-semibold">
                Edit
              </button>
            </div>
          )}

          {/* TAGLINE ROW */}
          {editMode === "tagline" ? (
            <div className="p-6 bg-white">
              <h3 className="font-bold text-sm mb-2">Change your tagline</h3>
              <input 
                type="text" 
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. Eco-conscious Shopper"
                className="w-full border border-[#888C8C] rounded px-3 py-2 focus:border-[#e77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)] outline-none transition-all"
              />
              <p className="text-xs text-[#565959] mt-2 mb-4">A short description displayed on your public profile.</p>
              <button 
                onClick={() => handleSave("tagline")}
                disabled={saving}
                className="bg-[#F7CA00] hover:bg-[#F0B800] border border-[#A2A6AC] rounded-lg px-6 py-2 text-sm font-bold shadow-sm transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          ) : (
            <div className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
              <div>
                <p className="font-bold text-sm">Tagline</p>
                <p className="text-sm text-[#565959]">{(user as any).tagline || "Not set"}</p>
              </div>
              <button onClick={() => setEditMode("tagline")} className="border border-[#D5D9D9] px-6 py-1.5 rounded-lg shadow-sm bg-white hover:bg-slate-50 text-sm font-semibold">
                Edit
              </button>
            </div>
          )}

        </div>
        
        {/* Done button at bottom to return */}
        <div className="mt-6 flex justify-end">
          <Link href="/account" className="border border-[#D5D9D9] bg-slate-100 hover:bg-slate-200 rounded-lg px-6 py-2 text-sm font-bold shadow-sm transition-colors text-[#0F1111]">
            Done
          </Link>
        </div>

      </div>
    </div>
  );
}
