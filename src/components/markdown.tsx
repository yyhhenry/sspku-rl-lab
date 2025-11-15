import hljs from "highlight.js/lib/common";
import "highlight.js/styles/github-dark.min.css";
import "katex/dist/katex.min.css";
import type React from "react";
import { useMemo } from "react";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";

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
    <div className="hljs p-2 rounded-md border w-full">
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

/**
 * Extract code block information from react-markdown's pre children
 */
function extractCodeBlock(children: React.ReactNode):
  | {
      code: string;
      lang: string;
    }
  | undefined {
  if (
    !children ||
    typeof children !== "object" ||
    !("props" in children) ||
    !children.props
  ) {
    return;
  }

  const props = children.props as {
    className?: string;
    children?: React.ReactNode;
  };
  const className = props.className || "";
  const match = /language-(\w+)/.exec(className);

  if (!match) {
    return;
  }

  const lang = match[1];
  const code = props.children ? String(props.children).replace(/\n$/, "") : "";

  return { code, lang };
}

const markdownComponents: Components = {
  pre: ({ children, ...props }) => {
    const codeBlock = extractCodeBlock(children);
    if (codeBlock) {
      return <CodeBlock code={codeBlock.code} lang={codeBlock.lang} />;
    }
    return <pre {...props}>{children}</pre>;
  },
};

export function Markdown(props: { content: string }) {
  const processedContent = useMemo(
    () => bracketsFormulaToKatex(props.content),
    [props.content]
  );

  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={markdownComponents}
    >
      {processedContent}
    </ReactMarkdown>
  );
}
