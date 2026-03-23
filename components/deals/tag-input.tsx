"use client";

import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
}

const DEFAULT_SUGGESTIONS = [
  "AI-native",
  "repeat founder",
  "B2B",
  "India-first",
  "deep-tech",
  "marketplace",
  "API-first",
  "open-source",
];

export function TagInput({
  value,
  onChange,
  placeholder = "Add tag…",
  suggestions = DEFAULT_SUGGESTIONS,
}: TagInputProps) {
  const [input, setInput] = useState("");

  function addTag(tag: string) {
    const trimmed = tag.trim().toLowerCase();
    if (!trimmed || value.includes(trimmed)) return;
    onChange([...value, trimmed]);
    setInput("");
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    }
    if (e.key === "Backspace" && !input && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  }

  const filtered = suggestions.filter(
    (s) => !value.includes(s.toLowerCase()) && s.toLowerCase().includes(input.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        {value.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1 text-xs">
            {tag}
            <button type="button" onClick={() => removeTag(tag)} className="hover:text-destructive">
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="text-sm"
      />
      {input && filtered.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {filtered.slice(0, 5).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => addTag(s)}
              className="text-xs text-muted-foreground hover:text-foreground border rounded px-1.5 py-0.5"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
