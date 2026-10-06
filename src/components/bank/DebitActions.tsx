"use client";

import type { MouseEvent } from "react";
import { confirmReceipt, failDebit, honourDebit } from "@/lib/scheme";
import type { DebitRequest } from "@/lib/data";

export function DebitRowActions({ debit, bankId }: { debit: DebitRequest; bankId: string }) {
  const sending = debit.sendingBank === bankId;
  const receiving = debit.receivingBank === bankId;

  const stop = (event: MouseEvent) => event.stopPropagation();

  if (sending && debit.status === "pending") {
    return (
      <div style={{ display: "flex", gap: 8 }} className="actions-row" onClick={stop}>
        <button type="button" className="btn-success" style={{ padding: "8px 12px", fontSize: 12 }} onClick={() => honourDebit(debit.id)}>
          Honour
        </button>
        <button type="button" className="btn-danger" onClick={() => failDebit(debit.id, "Insufficient funds")}>
          Decline
        </button>
      </div>
    );
  }

  if (receiving && debit.status === "success" && !debit.creditedAt) {
    return (
      <button type="button" className="btn-primary" style={{ padding: "8px 12px", fontSize: 12 }} onClick={event => { stop(event); confirmReceipt(debit.id); }}>
        Confirm credit
      </button>
    );
  }

  if (receiving && debit.creditedAt) {
    return <span style={{ color: "var(--green)", fontWeight: 600, fontSize: 12 }}>Credited</span>;
  }

  return <span style={{ color: "var(--text-dim)" }}>—</span>;
}
