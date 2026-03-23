"use client";

import { useState, useEffect, useTransition } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import useDebounce from "@/hooks/useDebounce";
import { searchContacts } from "@/actions/ecosystem";

type ContactOption = { id: string; name: string; organization: string | null };

interface ContactSearchComboboxProps {
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ContactSearchCombobox({
  value,
  onChange,
  placeholder = "Search contacts…",
  disabled,
}: ContactSearchComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [contacts, setContacts] = useState<ContactOption[]>([]);
  const [selected, setSelected] = useState<ContactOption | null>(null);
  const [isPending, startTransition] = useTransition();

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    if (!open) return;
    startTransition(async () => {
      const results = await searchContacts(debouncedSearch || "");
      setContacts(results);
    });
  }, [open, debouncedSearch]);

  // Resolve selected name on mount
  useEffect(() => {
    if (!value || contacts.find((c) => c.id === value)) return;
    startTransition(async () => {
      const results = await searchContacts("", 50);
      const found = results.find((c: ContactOption) => c.id === value) ?? null;
      setSelected(found);
    });
  }, [value]);

  const display = contacts.find((c) => c.id === value) ?? selected;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
          disabled={disabled}
          type="button"
        >
          <span className="truncate text-sm">
            {display ? (
              <>
                {display.name}
                {display.organization && (
                  <span className="text-muted-foreground"> ({display.organization})</span>
                )}
              </>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Search contacts…" value={search} onValueChange={setSearch} />
          <CommandList>
            {isPending && contacts.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">Loading…</div>
            ) : (
              <>
                <CommandEmpty>No contacts found.</CommandEmpty>
                <CommandGroup>
                  {contacts.map((contact) => (
                    <CommandItem
                      key={contact.id}
                      value={contact.id}
                      onSelect={(id) => {
                        onChange(id === value ? "" : id);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn("mr-2 h-4 w-4", value === contact.id ? "opacity-100" : "opacity-0")}
                      />
                      <span>
                        {contact.name}
                        {contact.organization && (
                          <span className="text-muted-foreground text-xs ml-1">({contact.organization})</span>
                        )}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
