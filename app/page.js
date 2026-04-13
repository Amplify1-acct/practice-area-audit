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

  function renderMarkdown(md) {
    let html = md;
    html = html.replace(/(\|.+\|\n)+/g, (match) => {
      const lines = match.trim().split("\n");
      if (lines.length < 2) return match;
      const header = lines[0].split("|").slice(1, -1).map((s) => s.trim());
      const rows = lines
        .slice(2)
        .map((l) => l.split("|").slice(1, -1).map((s) => s.trim()));
      let t =
        '<table style="width:100%; border-collapse: collapse; margin: 1rem 0; font-size: 14px;">';
      t +=
        "<thead><tr>" +
        header
          .map(
            (h) =>
              `<th style="text-align:left; padding: 10px 8px; border-bottom: 1px solid #ddd; font-weight: 600; background: #f5f5f0;">${h}</th>`
          )
          .join("") +
        "</tr></thead><tbody>";
      rows.forEach((r) => {
        t +=
          "<tr>" +
          r
            .map(
              (c) =>
                `<td style="padding: 10px 8px; border-bottom: 1px solid #eee; vertical-align: top;">${c}</td>`
            )
            .join("") +
          "</tr>";
      });
      t += "</tbody></table>";
      return t;
    });
    html = html.replace(/^## (.+)$/gm, '<h2 style="margin: 2rem 0 0.75rem; font-size: 22px;">$1</h2>');
    html = html.replace(/^### (.+)$/gm, '<h3 style="margin: 1.5rem 0 0.5rem; font-size: 17px;">$1</h3>');
    html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/(^- .+\n?)+/gm, (match) => {
      const items = match.trim().split("\n").map((l) => l.replace(/^- /, ""));
      return (
        '<ul style="margin: 0.5rem 0 1rem; padding-left: 1.5rem;">' +
        items.map((i) => `<li style="margin-bottom: 6px;">${i}</li>`).join("") +
        "</ul>"
      );
    });
    html = html
      .split("\n\n")
      .map((block) => {
        if (block.trim().startsWith("<")) return block;
        if (!block.trim()) return "";
        return `<p style="margin: 0.75rem 0; line-height: 1.7;">${block.replace(/\n/g, "<br>")}</p>`;
      })
      .join("\n");
    return html;
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "3rem 1.5rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ margin: "0 0 8px", fontSize: 32, fontWeight: 600 }}>
          Practice area page audit
        </h1>
        <p style={{ margin: 0, color: "#666", fontSize: 15 }}>
          Paste any law firm practice area URL. Get a full 15-point gap report against the gold standard.
        </p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: "1rem" }}>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !loading && runAudit()}
          placeholder="https://lawfirm.com/practice-areas/car-accidents"
          disabled={loading}
          style={{
            flex: 1,
            padding: "12px 14px",
            fontSize: 15,
            border: "1px solid #ccc",
            borderRadius: 8,
            background: "white",
          }}
        />
        <button
          onClick={runAudit}
          disabled={loading}
          style={{
            padding: "12px 24px",
            fontSize: 15,
            fontWeight: 500,
            background: loading ? "#999" : "#1a1a1a",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: loading ? "wait" : "pointer",
          }}
        >
          {loading ? "Auditing..." : "Run audit"}
        </button>
      </div>

      {loading && (
        <p style={{ fontSize: 14, color: "#666" }}>
          Fetching page and running the 15-point audit. This takes 30–90 seconds.
        </p>
      )}

      {error && (
        <div
          style={{
            padding: "12px 16px",
            background: "#fff0f0",
            border: "1px solid #f5c2c2",
            borderRadius: 8,
            color: "#a02020",
            fontSize: 14,
            marginTop: "1rem",
          }}
        >
          {error}
        </div>
      )}

      {report && (
        <div
          style={{
            marginTop: "2rem",
            padding: "2rem",
            background: "white",
            border: "1px solid #e5e5e0",
            borderRadius: 12,
          }}
          dangerouslySetInnerHTML={{ __html: renderMarkdown(report) }}
        />
      )}
    </div>
  );
}
