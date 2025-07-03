"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/components/auth-provider";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVerticalIcon, CopyIcon, CheckIcon } from "lucide-react";
import type { SyntheticEvent } from "react";
import type { UniqueIdentifier } from "@dnd-kit/core";

interface SortableQuestionProps {
  id: UniqueIdentifier;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDelete: () => void;
}

function SortableQuestion({ id, value, onChange, onDelete }: SortableQuestionProps) {
  const { listeners, attributes, isDragging, setNodeRef } = useSortable({ id });
  return (
    <div ref={setNodeRef} style={{ opacity: isDragging ? 0.5 : 1 }} className="flex gap-2 items-center cursor-grab bg-background border rounded px-2 py-1">
      <Button variant="ghost" size="icon" className="cursor-grab" {...listeners} {...attributes}>
        <GripVerticalIcon className="size-4 text-muted-foreground" />
        <span className="sr-only">Drag to reorder</span>
      </Button>
      <Input
        value={value}
        onChange={onChange}
        className="flex-1"
      />
      <Button
        variant="destructive"
        size="icon"
        onClick={onDelete}
      >
        -
      </Button>
    </div>
  );
}

export default function ProjectSettingsPage() {
  const { user } = useAuth();
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [businessName, setBusinessName] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [analyzedQuestions, setAnalyzedQuestions] = useState<string[]>([]);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor));

  // Fetch businessId for current user
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase
        .from("businesses")
        .select("id")
        .eq("user_id", user.id)
        .single();
      if (data) setBusinessId(data.id);
    })();
  }, [user]);

  // Fetch latest analyzed questions for business
  useEffect(() => {
    if (!businessId) return;
    (async () => {
      const { data, error } = await supabase
        .from("analyzed_results")
        .select("questions, created_at")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      if (data && data.questions) {
        // If questions is an object, use its values; if array, use as is
        const qs = Array.isArray(data.questions)
          ? data.questions
          : Object.values(data.questions);
        setAnalyzedQuestions(qs.map(q => String(q)));
      }
    })();
  }, [businessId]);

  // Preview cover image
  useEffect(() => {
    if (coverImage) {
      const url = URL.createObjectURL(coverImage);
      setCoverImageUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setCoverImageUrl(null);
    }
  }, [coverImage]);

  // Drag-and-drop handlers for analyzed questions
  function handleDragEnd(event: import("@dnd-kit/core").DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setAnalyzedQuestions((questions) => {
        const oldIndex = questions.findIndex((_, i) => i === Number(active.id));
        const newIndex = questions.findIndex((_, i) => i === Number(over.id));
        return arrayMove(questions, oldIndex, newIndex);
      });
    }
  }

  // Save business profile handler
  const handleSaveProfile = async () => {
    if (!businessId) return;
    setProfileSaving(true);
    setProfileSaved(false);
    try {
      const { error } = await supabase
        .from("businesses")
        .update({ name: businessName, description: businessDescription })
        .eq("id", businessId);
      if (error) throw error;
      setProfileSaved(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setProfileSaving(false);
    }
  };

  // Copy public profile link
  const handleCopyProfileLink = () => {
    if (!businessId) return;
    const url = `${window.location.origin}/profile/${businessId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 1500);
    });
  };

  return (
    <div className="w-full min-h-screen bg-background">
      {/* Banner section: full width, edge-to-edge */}
      <div className="w-full px-0 mb-8">
        <div className="relative w-full" style={{ minHeight: 220, height: 220 }}>
          <div className="absolute inset-0 rounded-none overflow-hidden group border-b border-muted-foreground/20" style={{ width: '100%', height: '100%' }}>
            <img
              src={coverImageUrl || "/icons/scanenlogonew.svg"}
              alt="Cover"
              className="w-full h-full object-cover"
              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            />
            <label
              className="absolute top-4 right-4 z-10 bg-black/70 text-white px-4 py-2 rounded cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ cursor: 'pointer' }}
            >
              Change cover
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => setCoverImage(e.target.files?.[0] || null)}
              />
            </label>
            {/* Copy public profile link button */}
            <Button
              variant="secondary"
              size="sm"
              className="absolute bottom-4 right-4 z-20 flex items-center gap-2 shadow"
              onClick={handleCopyProfileLink}
            >
              {copySuccess ? <CheckIcon className="size-4 text-green-600" /> : <CopyIcon className="size-4" />}
              {copySuccess ? "Copied!" : "Copy public profile link"}
            </Button>
          </div>
        </div>
      </div>
      {/* 2x1 grid below banner */}
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Business profile form */}
        <Card>
          <CardHeader>
            <CardTitle>Business Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Profile picture, name, description, etc. */}
            <div>
              <Label>Profile Picture</Label>
              <Input type="file" accept="image/*" onChange={e => setProfileImage(e.target.files?.[0] || null)} />
              {profileImage && <div className="mt-2 text-xs">Selected: {profileImage.name}</div>}
            </div>
            <div>
              <Label>Business Name</Label>
              <Input value={businessName} onChange={e => setBusinessName(e.target.value)} />
            </div>
            <div>
              <Label>Description</Label>
              <textarea
                className="w-full px-3 py-2 rounded border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
                value={businessDescription}
                onChange={e => setBusinessDescription(e.target.value)}
              />
            </div>
            <Button variant="default" onClick={handleSaveProfile} disabled={profileSaving}>
              {profileSaving ? "Saving..." : "Save Profile"}
            </Button>
            {profileSaved && <div className="text-green-600 text-sm mt-2">Profile saved!</div>}
          </CardContent>
        </Card>
        {/* Right: Analyzed Questions with drag-and-drop */}
        <Card>
          <CardHeader>
            <CardTitle>Analyzed Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd} sensors={sensors}>
              <SortableContext items={analyzedQuestions.map((_, i) => i.toString())} strategy={verticalListSortingStrategy}>
                {analyzedQuestions.map((q, idx) => (
                  <SortableQuestion
                    key={idx}
                    id={idx.toString()}
                    value={q}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAnalyzedQuestions(questions => questions.map((qq, i) => i === idx ? e.target.value : qq))}
                    onDelete={() => setAnalyzedQuestions(questions => questions.filter((_, i) => i !== idx))}
                  />
                ))}
              </SortableContext>
            </DndContext>
            <Button variant="outline" onClick={() => setAnalyzedQuestions(qs => [...qs, ""])}>+ Add Question</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 