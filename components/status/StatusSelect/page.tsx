import React from "react";

type DocValue = "pending" | "received";
type WorkValue = "pending" | "completed";

type Props =
  | { type: "doc"; value: DocValue; onChange: (v: DocValue) => void; className?: string }
  | { type: "work"; value: WorkValue; onChange: (v: WorkValue) => void; className?: string };

export function StatusSelect(props: Props) {
  const { type, value, onChange, className = "" } = props;

  return (
    <select
      value={value as string}
      onChange={(e) => {
        if (type === "doc") onChange(e.target.value as DocValue);
        else onChange(e.target.value as WorkValue);
      }}
      className={`rounded-md border px-2 py-1 text-sm font-medium ${
        (value === "completed" || value === "received")
          ? "text-emerald-600"
          : "text-yellow-600"
      } ${className}`}
    >
      {type === "doc" ? (
        <>
          <option value="pending">Pending</option>
          <option value="received">Received</option>
        </>
      ) : (
        <>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </>
      )}
    </select>
  );
}