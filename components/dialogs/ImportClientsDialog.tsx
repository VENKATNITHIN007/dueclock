"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/querykeys"
import { Upload } from "lucide-react"

function splitCSVLine(line: string) {
  const parts = line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/);
  return parts.map((p) => {
    let v = p.trim();
    if (v.startsWith('"') && v.endsWith('"')) {
      v = v.slice(1, -1).replace(/""/g, '"');
    }
    return v;
  });
}

function parseCSV(text: string) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
  if (!lines.length) return { headers: [], rows: [] };
  const headers = splitCSVLine(lines[0]).map((h) => h.trim());
  const rows = lines.slice(1).map((ln) => {
    const vals = splitCSVLine(ln);
    const obj: any = {};
    headers.forEach((h, idx) => (obj[h] = vals[idx] ?? ""));
    return obj;
  });
  return { headers, rows };
}

export default function ImportClientsDialog() {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewCount, setPreviewCount] = useState<number | null>(null)
  const qc = useQueryClient()

  const onFile = (file?: File) => {
    setError(null)
    setPreviewCount(null)
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (e) => {
      const text = String(e.target?.result || "")
      const { headers, rows } = parseCSV(text)

      // required header: name
      if (!headers.includes("name")) {
        setError('CSV must include a "name" header. Example header: name,phoneNumber,email')
        return
      }

      // Validation rules
      const phoneRe = /^\+91\d{10}$/; // Must start with +91 followed by 10 digits
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email validation
      const rowErrors: string[] = []
      const payload: Array<{ name: string; phoneNumber: string; email: string }> = []

      rows.forEach((r, rowIndex) => {
        const rowNum = rowIndex + 2; // +2 because row 1 is header, so first data row is row 2
        const name = (r.name || "").trim()
        const phone = (r.phoneNumber || "").trim()
        const email = (r.email || "").trim()
        const rowErrorsList: string[] = []

        // Name validation (required)
        if (!name) {
          rowErrorsList.push("Name is required")
        }

        // Phone validation (if provided, must start with +91)
        if (phone) {
          if (!phone.startsWith("+91")) {
            rowErrorsList.push("Phone number must start with +91")
          } else if (!phoneRe.test(phone)) {
            rowErrorsList.push("Phone number must be +91 followed by 10 digits (e.g., +919876543210)")
          }
        }

        // Email validation (if provided, must be valid)
        if (email && !emailRe.test(email)) {
          rowErrorsList.push("Invalid email format")
        }

        if (rowErrorsList.length > 0) {
          rowErrors.push(`Row ${rowNum}: ${rowErrorsList.join(", ")}`)
        } else {
          payload.push({ name, phoneNumber: phone, email })
        }
      })

      if (rowErrors.length) {
        setError(rowErrors.join("\n"))
        return
      }

      // send to import API
      try {
        const res = await fetch("/api/clients/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clients: payload }),
        })

        const json = await res.json().catch(() => null)
        if (!res.ok) {
          setError(json?.error || `Import failed: ${res.status}`)
          return
        }

        // success
        setPreviewCount(payload.length)
        qc.invalidateQueries({ queryKey: queryKeys.clients.all })
        // Invalidate activity to show import in firm activity (all activity queries)
        qc.invalidateQueries({ 
          predicate: (query) => query.queryKey[0] === "activity" 
        })
      } catch (err: any) {
        setError(String(err?.message || err))
      }
    }
    reader.readAsText(file)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Import CSV</Button>
      </DialogTrigger>

      <DialogContent className="max-w-[95vw] sm:max-w-lg mx-auto max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Import Clients from CSV</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-900">CSV Format Requirements</h3>
            <ul className="text-xs sm:text-sm text-gray-600 space-y-1.5 list-disc list-inside">
              <li><strong>name</strong> - Required field</li>
              <li><strong>phoneNumber</strong> - Optional, must start with +91</li>
              <li><strong>email</strong> - Optional, valid email format</li>
            </ul>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-xs font-semibold mb-1.5 text-gray-900">Example CSV Header:</p>
            <code className="text-xs font-mono bg-white px-2 py-1.5 rounded border border-gray-200 block break-all">name,phoneNumber,email</code>
          </div>

          {/* Custom File Upload Button with Hover State */}
          <div className="relative">
            <label 
              htmlFor="csv-upload"
              className="flex flex-col items-center justify-center w-full h-28 sm:h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-blue-50 hover:border-blue-400 transition-all group"
            >
              <div className="flex flex-col items-center justify-center pt-4 pb-4">
                <Upload className="w-8 h-8 sm:w-10 sm:h-10 mb-2 text-gray-400 group-hover:text-blue-600 transition-colors" />
                <p className="mb-1 text-xs sm:text-sm text-gray-600 group-hover:text-blue-700 text-center px-2">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">CSV files only</p>
              </div>
              <input
                id="csv-upload"
                type="file"
                accept="text/csv"
                className="hidden"
                onChange={(e) => onFile(e.target.files?.[0])}
              />
            </label>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-xs sm:text-sm font-semibold text-red-800 mb-2">Validation Errors:</p>
              <pre className="text-xs text-red-700 whitespace-pre-wrap font-sans max-h-40 overflow-y-auto">{error}</pre>
            </div>
          )}
          {previewCount !== null && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-xs sm:text-sm text-green-700 font-medium">✓ Imported {previewCount} clients successfully.</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)} className="flex-1 text-sm">Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
