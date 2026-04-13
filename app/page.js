"use client";
import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState("");
  const [error, setError] = useState("");

  async function runAudit() {
    if (!url.trim()) {
      setError("Please enter a URL.");
      return;
    }
    setLoading(true);
    setError("");
    setReport("");
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setReport(data.report || "No report returned.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function styleStatusCell(cell) {
    const trimmed = cell.trim();
    if (trimmed.startsWith("✅")) {
      return `<span style="display:inline-flex;align-items:center;gap:6px;padding:4px 10px;background:#e8f5ed;color:#1a6b35;border-radius:6px;font-size:13px;font-weight:500;white-space:nowrap;">✓ Present</span>`;
    }
    if (trimmed.startsWith("⚠️")) {
      return `<span style="display:inline-flex;align-items:center;gap:6px;padding:4px 10px;background:#fff4e0;color:#8a5a00;border-radius:6px;font-size:13px;font-weight:500;white-space:nowrap;">⚠ Partial</span>`;
    }
    if (trimmed.startsWith("❌")) {
      return `<span style="display:inline-flex;align-items:center;gap:6px;padding:4px 10px;background:#fde8e8;color:#9a1f1f;border-radius:6px;font-size:13px;font-weight:500;white-space:nowrap;">✗ Missing</span>`;
    }
    return cell;
  }

  function renderMarkdown(md) {
    let html = md;

    // Tables
    html = html.replace(/(\|.+\|\n)+/g, (match) => {
      const lines = match.trim().split("\n");
      if (lines.length < 2) return match;
      const header = lines[0].split("|").slice(1, -1).map((s) => s.trim());
      const rows = lines
        .slice(2)
        .map((l) => l.split("|").slice(1, -1).map((s) => s.trim()));
      let t = '<div style="overflow-x:auto;margin:1.5rem 0;border:1px solid #e5e5e0;border-radius:12px;">';
      t += '<table style="width:100%;border-collapse:collapse;font-size:14px;">';
      t += "<thead><tr>";
      header.forEach((h, i) => {
        const width = i === 0 ? "width:50px;" : i === 1 ? "width:30%;" : i === 2 ? "width:130px;" : "";
        t += `<th style="text-align:left;padding:14px 16px;background:#f7f5f0;font-weight:600;font-size:13px;text-transform:uppercase;letter-spacing:0.4px;color:#666;border-bottom:1px solid #e5e5e0;${width}">${h}</th>`;
      });
      t += "</tr></thead><tbody>";
      rows.forEach((r, ri) => {
        const bg = ri % 2 === 0 ? "white" : "#fafaf7";
        t += `<tr style="background:${bg};">`;
        r.forEach((c, ci) => {
          const isStatus = ci === 2;
          const content = isStatus ? styleStatusCell(c) : c;
          const align = ci === 0 ? "text-align:center;color:#999;font-weight:500;" : "";
          t += `<td style="padding:14px 16px;border-bottom:1px solid #f0ede5;vertical-align:top;line-height:1.5;${align}">${content}</td>`;
        });
        t += "</tr>";
      });
      t += "</tbody></table></div>";
      return t;
    });

    // H2 headings
    html = html.replace(/^## (.+)$/gm, '<h2 style="margin:2.5rem 0 1rem;font-size:24px;font-weight:600;color:#1a1a1a;padding-bottom:10px;border-bottom:2px solid #f0ede5;">$1</h2>');
    // H3 headings
    html = html.replace(/^### (.+)$/gm, '<h3 style="margin:1.75rem 0 0.75rem;font-size:18px;font-weight:600;color:#1a1a1a;">$1</h3>');

    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong style="font-weight:600;color:#1a1a1a;">$1</strong>');

    // Bullet lists
    html = html.replace(/(^- .+\n?)+/gm, (match) => {
      const items = match.trim().split("\n").map((l) => l.replace(/^- /, ""));
      return (
        '<ul style="margin:0.75rem 0 1.25rem;padding-left:1.5rem;">' +
        items.map((i) => `<li style="margin-bottom:8px;line-height:1.7;">${i}</li>`).join("") +
        "</ul>"
      );
    });

    // Numbered lists
    html = html.replace(/(^\d+\. .+\n?)+/gm, (match) => {
      const items = match.trim().split("\n").map((l) => l.replace(/^\d+\. /, ""));
      return (
        '<ol style="margin:0.75rem 0 1.25rem;padding-left:1.5rem;">' +
        items.map((i) => `<li style="margin-bottom:12px;line-height:1.7;">${i}</li>`).join("") +
        "</ol>"
      );
    });

    // Paragraphs
    html = html
      .split("\n\n")
      .map((block) => {
        const trimmed = block.trim();
        if (!trimmed) return "";
        if (trimmed.startsWith("<")) return block;
        if (trimmed === "---") return '<hr style="border:none;border-top:1px solid #e5e5e0;margin:2rem 0;">';
        return `<p style="margin:0.75rem 0;line-height:1.75;color:#333;">${block.replace(/\n/g, "<br>")}</p>`;
      })
      .join("\n");

    return html;
  }

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "3rem 1.5rem 6rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2.5rem" }}>
        <h1 style={{ margin: "0 0 10px", fontSize: 36, fontWeight: 600, letterSpacing: "-0.5px" }}>
          Practice area page audit
        </h1>
        <p style={{ margin: 0, color: "#666", fontSize: 16, lineHeight: 1.6 }}>
          Paste any law firm practice area URL. Get a full 15-point gap report against the gold standard.
        </p>
      </div>

      {/* Input */}
      <div style={{ display: "flex", gap: 10, marginBottom: "1rem" }}>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !loading && runAudit()}
          placeholder="https://lawfirm.com/practice-areas/car-accidents"
          disabled={loading}
          style={{
            flex: 1,
            padding: "14px 16px",
            fontSize: 15,
            border: "1px solid #d4d1c7",
            borderRadius: 10,
            background: "white",
            outline: "none",
            transition: "border-color 0.15s",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#1a1a1a")}
          onBlur={(e) => (e.target.style.borderColor = "#d4d1c7")}
        />
        <button
          onClick={runAudit}
          disabled={loading}
          style={{
            padding: "14px 28px",
            fontSize: 15,
            fontWeight: 500,
            background: loading ? "#999" : "#1a1a1a",
            color: "white",
            border: "none",
            borderRadius: 10,
            cursor: loading ? "wait" : "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {loading ? "Auditing..." : "Run audit"}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div
          style={{
            padding: "16px 20px",
            background: "#f7f5f0",
            border: "1px solid #e5e5e0",
            borderRadius: 10,
            color: "#666",
            fontSize: 14,
            marginTop: "1rem",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 16,
              height: 16,
              border: "2px solid #ccc",
              borderTopColor: "#1a1a1a",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
          Fetching the page and running the 15-point audit. This takes 30–90 seconds.
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          style={{
            padding: "14px 18px",
            background: "#fdf0f0",
            border: "1px solid #f5c2c2",
            borderRadius: 10,
            color: "#9a1f1f",
            fontSize: 14,
            marginTop: "1rem",
          }}
        >
          {error}
        </div>
      )}

      {/* Report */}
      {report && (
        <div
          style={{
            marginTop: "2.5rem",
            padding: "2.5rem 3rem",
            background: "white",
            border: "1px solid #e5e5e0",
            borderRadius: 16,
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
          dangerouslySetInnerHTML={{ __html: renderMarkdown(report) }}
        />
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        h2:first-child { margin-top: 0 !important; }
      `}</style>
    </div>
  );
}
