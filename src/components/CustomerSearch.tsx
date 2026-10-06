"use client";

import { KeyboardEvent, useEffect, useId, useMemo, useRef, useState } from "react";
import { institutionName, type Mandate } from "@/lib/data";
import { mandatesForBank, mandatesForInstitution, searchMandates } from "@/lib/scheme";
import { useAuth } from "@/hooks/useAuth";
import { useScheme } from "@/hooks/useScheme";
import { Badge } from "@/components/ui";
import { Icon } from "@/components/icons";

const LIMIT = 8;

export function CustomerSearch({ onSelect }: { onSelect: (ref: string) => void }) {
  const scheme = useScheme();
  const { user, portal } = useAuth();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const pool = useMemo(() => {
    if (portal === "institution" && user?.institutionId) return mandatesForInstitution(scheme, user.institutionId);
    if (portal === "bank" && user?.bankId) return mandatesForBank(scheme, user.bankId);
    return scheme.mandates;
  }, [scheme, portal, user?.bankId, user?.institutionId]);

  const hits = useMemo(() => searchMandates(pool, query).slice(0, LIMIT), [pool, query]);
  const show = open && query.trim().length > 0;

  useEffect(() => {
    setActive(0);
  }, [query]);

  useEffect(() => {
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, []);

  const pick = (ref: string) => {
    onSelect(ref);
    setQuery("");
    setOpen(false);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!show || hits.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive(i => (i + 1) % hits.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive(i => (i - 1 + hits.length) % hits.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const row = hits[active] ?? hits[0];
      if (row) pick(row.ref);
    }
  };

  return (
    <div ref={rootRef} className="customer-search">
      <span className="customer-search-icon">
        <Icon name="search" size={16} />
      </span>
      <input
        className="pill-input"
        value={query}
        onChange={e => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="Search customer"
        aria-label="Search customer"
        aria-autocomplete="list"
        aria-expanded={show}
        aria-controls={listId}
        autoComplete="off"
        role="combobox"
      />
      {query && (
        <button
          type="button"
          className="customer-search-clear"
          aria-label="Clear search"
          onClick={() => {
            setQuery("");
            setOpen(false);
          }}
        >
          <Icon name="x" size={14} />
        </button>
      )}
      {show && (
        <div className="search-menu" id={listId} role="listbox">
          {hits.length === 0 ? (
            <div className="search-empty">No customers match “{query.trim()}”.</div>
          ) : hits.map((row, index) => (
            <ResultRow
              key={row.ref}
              row={row}
              active={index === active}
              onPick={pick}
              onHover={() => setActive(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ResultRow({
  row, active, onPick, onHover,
}: {
  row: Mandate;
  active: boolean;
  onPick: (ref: string) => void;
  onHover: () => void;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={active}
      className={`search-hit${active ? " active" : ""}`}
      onMouseEnter={onHover}
      onMouseDown={event => event.preventDefault()}
      onClick={() => onPick(row.ref)}
    >
      <span className="search-hit-copy">
        <span className="search-hit-name">{row.customer}</span>
        <span className="search-hit-meta">
          {row.ref} · {institutionName(row.institution)}
        </span>
      </span>
      <Badge status={row.status} />
    </button>
  );
}
