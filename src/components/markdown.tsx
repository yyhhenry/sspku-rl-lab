import { Separator } from "@radix-ui/react-separator";
import DOMPurify from "dompurify";
import hljs from "highlight.js/lib/common";
import "highlight.js/styles/github-dark.min.css";
import { marked, type Token, type Tokens } from "marked";
import markedKatex from "marked-katex-extension";
import { useMemo } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";

marked.use(
  markedKatex({
    throwOnError: false,
    output: "mathml",
    nonStandard: true,
    strict: false,
  })
);

/**
 * Transfer inline `\( ... \)` and  block `\[ ... \]` formulas to katex format.
 * Katex format: `$ ... $` and `$$ ... $$` (whitespace cannot be omitted)
 */
function bracketsFormulaToKatex(content: string) {
  const inlinePattern = /\\\((.*?)\\\)/g;
  const blockPattern = /\\\[(.*?)\\\]/gs;

  content = content.replaceAll(
    inlinePattern,
    (_, formula) => ` $ ${formula} $ `
  );

  content = content.replaceAll(
    blockPattern,
    (_, formula) => `\n$$\n${formula}\n$$\n`
  );

  return content;
}

function markedLex(content: string) {
  content = bracketsFormulaToKatex(content);

  return marked.lexer(content);
}
function markedParse(tokens: Token | Token[]) {
  tokens = Array.isArray(tokens) ? tokens : [tokens];
  return DOMPurify.sanitize(marked.parser(tokens));
}

export function CodeBlock(props: { code: string; lang: string }) {
  const language = useMemo(
    () => (hljs.getLanguage(props.lang) ? props.lang : "plaintext"),
    [props.lang]
  );
  const highlighted = useMemo(
    () => hljs.highlight(props.code, { language: language }).value,
    [props.code, language]
  );
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  };
  return (
    <div className="hljs p-2 rounded-md border">
      <div className="flex items-center justify-between">
        <span className="p-2">{props.lang}</span>
        <Button variant="ghost" onClick={() => copy(props.code)}>
          Copy
        </Button>
      </div>
      <Separator className="my-2" />
      <pre className="p-1 overflow-x-auto">
        <code
          className={`language-${props.lang}`}
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </pre>
    </div>
  );
}

export function Markdown(props: { content: string }) {
  const tokens = useMemo(() => markedLex(props.content), [props.content]);

  return (
    <div className="markdown-document">
      {tokens.map(token => {
        if (token.type === "code") {
          const codeToken = token as Tokens.Code;
          return (
            <CodeBlock
              code={codeToken.text}
              lang={codeToken.lang ?? "plaintext"}
            />
          );
        } else {
          return (
            <div dangerouslySetInnerHTML={{ __html: markedParse(token) }} />
          );
        }
      })}
    </div>
  );
}
