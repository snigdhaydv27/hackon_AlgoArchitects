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
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    } else if (user) {
      setName(user.name || "");
      setAvatar(user.avatar || "");
      // Hack to get tagline since it's not strictly typed in AuthUser but we added it to backend
      setTagline((user as any).tagline || "");
    }
  }, [user, loading, router]);

  if (loading || !user) return <div className="p-8 text-center text-slate-500">Redirecting to login...</div>;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      await api("/auth/me/profile", {
        method: "PUT",
        body: JSON.stringify({ name, avatar, tagline }),
      });
      setSuccess(true);
      // Reload the page to reflect updated global state
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
          <Link href="/account" className="hover:underline hover:text-[#c45500]">Your Account</Link>
          <ChevronRight className="size-4 mx-1" />
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

        <div className="border border-[#D5D9D9] rounded-lg">
          <form onSubmit={handleSave} className="divide-y divide-[#D5D9D9]">
            
            <div className="p-6">
              <label className="block font-bold text-sm mb-2">Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-[#888C8C] rounded px-3 py-2 focus:border-[#e77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)] outline-none transition-all"
                required
              />
            </div>

            <div className="p-6">
              <label className="block font-bold text-sm mb-2">Avatar URL</label>
              <input 
                type="url" 
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://example.com/avatar.png"
                className="w-full border border-[#888C8C] rounded px-3 py-2 focus:border-[#e77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)] outline-none transition-all"
              />
              <p className="text-xs text-[#565959] mt-2">Paste a direct link to an image file.</p>
            </div>

            <div className="p-6">
              <label className="block font-bold text-sm mb-2">Tagline</label>
              <input 
                type="text" 
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. Eco-conscious Shopper"
                className="w-full border border-[#888C8C] rounded px-3 py-2 focus:border-[#e77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)] outline-none transition-all"
              />
              <p className="text-xs text-[#565959] mt-2">A short description displayed on your public profile.</p>
            </div>

            <div className="p-6 bg-[#F3F3F3] rounded-b-lg flex justify-end">
              <button 
                type="submit"
                disabled={saving}
                className="bg-[#F7CA00] hover:bg-[#F0B800] border border-[#A2A6AC] rounded-lg px-6 py-2 text-sm font-bold shadow-sm transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
