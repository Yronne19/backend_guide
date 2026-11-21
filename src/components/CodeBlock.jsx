import { useState } from "react";
import { Highlight, themes } from "prism-react-renderer";
import Prism from "prismjs";
import "prismjs/components/prism-java";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-json";
import "prismjs/components/prism-http";
import "prismjs/components/prism-docker";
import "prismjs/components/prism-markup";
import { Check, Copy } from "./Icons.jsx";

const LANGUAGE_LABELS = {
  java: "Java",
  sql: "SQL",
  bash: "Shell",
  yaml: "YAML",
  json: "JSON",
  http: "HTTP",
  docker: "Dockerfile",
  xml: "XML",
};

export default function CodeBlock({ file, lang = "java", code, heightClass = "max-h-[440px]" }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0a0d15]">
      <div className="flex items-center gap-3 border-b border-white/[0.07] px-3 py-2.5 sm:px-4">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]/80" />
        </div>
        <p className="min-w-0 flex-1 truncate font-mono text-[11px] text-slate-400 sm:text-xs">
          {file}
        </p>
        <span className="hidden rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-slate-400 sm:inline">
          {LANGUAGE_LABELS[lang] ?? lang}
        </span>
        <button
          type="button"
          onClick={copy}
          className="flex shrink-0 items-center gap-1.5 rounded-md border border-white/10 px-2 py-1 font-mono text-[10px] text-slate-300 transition hover:border-mint-400/40 hover:bg-mint-400/10 hover:text-mint-300"
          aria-label={`Copy ${file} to clipboard`}
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <div className={`code-scroll overflow-auto ${heightClass}`}>
        <Highlight theme={themes.vsDark} code={code.trim()} language={lang} prism={Prism}>
          {({ tokens, getLineProps, getTokenProps }) => (
            <pre className="min-w-full p-3 font-mono text-[11.5px] leading-[1.65] sm:p-4 sm:text-xs">
              {tokens.map((line, i) => {
                const { key: lineKey, ...lineProps } = getLineProps({ line });
                return (
                  <div key={lineKey ?? i} {...lineProps} className={`table-row ${lineProps.className ?? ""}`}>
                    <span className="table-cell select-none pr-4 text-right text-[10px] text-slate-600">
                      {i + 1}
                    </span>
                    <span className="table-cell whitespace-pre">
                      {line.map((token, key) => {
                        const { key: tokenKey, ...tokenProps } = getTokenProps({ token });
                        return <span key={tokenKey ?? key} {...tokenProps} />;
                      })}
                    </span>
                  </div>
                );
              })}
            </pre>
          )}
        </Highlight>
      </div>
    </div>
  );
}
