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
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  
  const [editMode, setEditMode] = useState<"name" | "age" | "gender" | "mobile" | "password" | null>(null);
  
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    } else if (user) {
      setName(user.name || "");
      setAge((user as any).age || "");
      setGender((user as any).gender || "");
      setMobile((user as any).mobile || "");
      setPassword("********");
    }
  }, [user, loading, router]);

  if (loading || !user) return <div className="p-8 text-center">Loading...</div>;

  async function handleSave(field: "name" | "age" | "gender" | "mobile" | "password") {
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      if (field === "name") {
        await api("/auth/me/profile", {
          method: "PUT",
          body: JSON.stringify({ name }),
        });
        setTimeout(() => window.location.reload(), 1500);
      }
      setSuccess(true);
      setEditMode(null);
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
            <p className="text-sm">Your profile has been updated.</p>
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

          {/* MOBILE ROW */}
          {editMode === "mobile" ? (
            <div className="p-6 border-b border-[#D5D9D9] bg-white">
              <h3 className="font-bold text-sm mb-2">Change Primary mobile no.</h3>
              <input 
                type="tel" 
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full border border-[#888C8C] rounded px-3 py-2 mb-4 focus:border-[#e77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)] outline-none transition-all"
              />
              <button 
                onClick={() => handleSave("mobile")}
                disabled={saving}
                className="bg-[#F7CA00] hover:bg-[#F0B800] border border-[#A2A6AC] rounded-lg px-6 py-2 text-sm font-bold shadow-sm transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          ) : (
            <div className="p-4 border-b border-[#D5D9D9] flex justify-between items-center hover:bg-slate-50 transition-colors">
              <div>
                <p className="font-bold text-sm">Primary mobile no.</p>
                <p className="text-sm text-[#565959]">{(user as any).mobile || "Not set"}</p>
              </div>
              <button onClick={() => setEditMode("mobile")} className="border border-[#D5D9D9] px-6 py-1.5 rounded-lg shadow-sm bg-white hover:bg-slate-50 text-sm font-semibold">
                Edit
              </button>
            </div>
          )}

          {/* AGE ROW */}
          {editMode === "age" ? (
            <div className="p-6 border-b border-[#D5D9D9] bg-white">
              <h3 className="font-bold text-sm mb-2">Change Age</h3>
              <input 
                type="number" 
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full border border-[#888C8C] rounded px-3 py-2 mb-4 focus:border-[#e77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)] outline-none transition-all"
              />
              <button 
                onClick={() => handleSave("age")}
                disabled={saving}
                className="bg-[#F7CA00] hover:bg-[#F0B800] border border-[#A2A6AC] rounded-lg px-6 py-2 text-sm font-bold shadow-sm transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          ) : (
            <div className="p-4 border-b border-[#D5D9D9] flex justify-between items-center hover:bg-slate-50 transition-colors">
              <div>
                <p className="font-bold text-sm">Age</p>
                <p className="text-sm text-[#565959]">{(user as any).age || "Not set"}</p>
              </div>
              <button onClick={() => setEditMode("age")} className="border border-[#D5D9D9] px-6 py-1.5 rounded-lg shadow-sm bg-white hover:bg-slate-50 text-sm font-semibold">
                Edit
              </button>
            </div>
          )}

          {/* GENDER ROW */}
          {editMode === "gender" ? (
            <div className="p-6 border-b border-[#D5D9D9] bg-white">
              <h3 className="font-bold text-sm mb-2">Change Gender</h3>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full border border-[#888C8C] rounded px-3 py-2 mb-4 focus:border-[#e77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)] outline-none transition-all bg-white"
              >
                <option value="">Not set</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
              <button 
                onClick={() => handleSave("gender")}
                disabled={saving}
                className="bg-[#F7CA00] hover:bg-[#F0B800] border border-[#A2A6AC] rounded-lg px-6 py-2 text-sm font-bold shadow-sm transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          ) : (
            <div className="p-4 border-b border-[#D5D9D9] flex justify-between items-center hover:bg-slate-50 transition-colors">
              <div>
                <p className="font-bold text-sm">Gender</p>
                <p className="text-sm text-[#565959]">{(user as any).gender || "Not set"}</p>
              </div>
              <button onClick={() => setEditMode("gender")} className="border border-[#D5D9D9] px-6 py-1.5 rounded-lg shadow-sm bg-white hover:bg-slate-50 text-sm font-semibold">
                Edit
              </button>
            </div>
          )}

          {/* PASSWORD ROW */}
          {editMode === "password" ? (
            <div className="p-6 bg-white">
              <h3 className="font-bold text-sm mb-2">Change Password</h3>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-[#888C8C] rounded px-3 py-2 mb-4 focus:border-[#e77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)] outline-none transition-all"
              />
              <button 
                onClick={() => handleSave("password")}
                disabled={saving}
                className="bg-[#F7CA00] hover:bg-[#F0B800] border border-[#A2A6AC] rounded-lg px-6 py-2 text-sm font-bold shadow-sm transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          ) : (
            <div className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
              <div>
                <p className="font-bold text-sm">Password</p>
                <p className="text-sm text-[#565959]">********</p>
              </div>
              <button onClick={() => setEditMode("password")} className="border border-[#D5D9D9] px-6 py-1.5 rounded-lg shadow-sm bg-white hover:bg-slate-50 text-sm font-semibold">
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
