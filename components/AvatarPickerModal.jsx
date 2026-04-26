"use client";

import { useRef, useState } from "react";
import { X, Upload, Check } from "lucide-react";
import { AVATAR_STYLES } from "../lib/avatars";
import { supabase } from "../lib/supabase";
import Avatar from "./Avatar";

export default function AvatarPickerModal({
  myUser,
  displayName,
  rank,
  currentAvatarId,
  currentAvatarUrl,
  onClose,
  onSaved,
}) {
  const [selected, setSelected] = useState(currentAvatarId || "auto");
  const [previewUrl, setPreviewUrl] = useState(currentAvatarUrl || null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const fileRef = useRef(null);

  function pickStyle(id) {
    setSelected(id);
    setPreviewUrl(null);
    setError(null);
  }

  async function handleFile(event) {
    const file = event.target.files?.[0];
    if (!file || !myUser) return;
    if (file.size > 2 * 1024 * 1024) {
      setError("Image too large. Max 2MB.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file.");
      return;
    }
    setUploading(true);
    setError(null);

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${myUser.id}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, cacheControl: "3600" });
    if (upErr) {
      setError("Upload failed. Make sure the 'avatars' bucket exists.");
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    setPreviewUrl(data.publicUrl);
    setSelected("custom");
    setUploading(false);
  }

  async function save() {
    if (saving || !myUser) return;
    setSaving(true);
    setError(null);
    const update =
      selected === "custom"
        ? { avatar_id: "custom", avatar_url: previewUrl }
        : { avatar_id: selected, avatar_url: null };
    const { error: updateError } = await supabase
      .from("users")
      .update(update)
      .eq("id", myUser.id);
    setSaving(false);
    if (updateError) {
      setError("Couldn't save");
      return;
    }
    onSaved({ avatarId: update.avatar_id, avatarUrl: update.avatar_url || null });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="future-panel-elevated w-full max-w-sm p-5"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-[17px] font-bold text-white">Choose your avatar</h3>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-400 hover:bg-white/[0.05] hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-4 flex justify-center">
          <Avatar
            displayName={displayName}
            avatarId={selected}
            avatarUrl={selected === "custom" ? previewUrl : null}
            rank={rank}
            size={88}
            glow
          />
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-3 py-2.5 text-[13px] font-medium text-zinc-300 transition hover:border-[var(--accent)]/40 hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] disabled:opacity-50"
        >
          <Upload size={14} strokeWidth={2.2} />
          {uploading ? "Uploading..." : "Upload your own image"}
        </button>

        <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
          Or pick a style
        </p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {AVATAR_STYLES.map((s) => {
            const isSelected = selected === s.id && previewUrl === null;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => pickStyle(s.id)}
                className={`relative flex flex-col items-center gap-1 rounded-xl border p-2 transition ${
                  isSelected
                    ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                    : "border-white/[0.08] bg-white/[0.02] hover:border-white/15"
                }`}
              >
                <Avatar
                  displayName={displayName}
                  avatarId={s.id}
                  rank={rank}
                  size={48}
                />
                <p className="text-[10px] font-semibold text-white">{s.label}</p>
                {isSelected && (
                  <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--accent)] ring-2 ring-[var(--surface-elevated)]">
                    <Check size={9} className="text-white" strokeWidth={3} />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {error && <p className="mt-3 text-[12px] text-red-400">{error}</p>}

        <div className="mt-4 flex gap-2">
          <button
            onClick={onClose}
            className="future-button-ghost flex-1 py-2.5 text-[14px]"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="future-button flex-1 py-2.5 text-[14px] disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
