// components/markdown.tsx
import 'katex/dist/katex.min.css';

import { GeistMono } from 'geist/font/mono';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight, oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import Link from 'next/link';
import Latex from 'react-latex-next';
import Marked, { ReactRenderer } from 'marked-react';
import React, { useCallback, useMemo, useState, ReactNode, isValidElement } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check, Copy, WrapText, ArrowLeftRight } from 'lucide-react';
import { toast } from 'sonner';

interface MarkdownRendererProps {
  content: string;
}

const isValidUrl = (str: string) => {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
};

function checksum(s: string): number {
    let hash = 0;
    if (s.length === 0) return hash;
    for (let i = 0; i < s.length; i++) {
      const char = s.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return Math.abs(hash);
}

const preprocessLaTeX = (content: string) => {
    let processedContent = content
        .replace(/\\\[/g, '___BLOCK_OPEN___')
        .replace(/\\\]/g, '___BLOCK_CLOSE___')
        .replace(/\\\(/g, '___INLINE_OPEN___')
        .replace(/\\\)/g, '___INLINE_CLOSE___');

    const blockRegex = /(\$\$[\s\S]*?\$\$)/g;
    const blocks: string[] = [];
    processedContent = processedContent.replace(blockRegex, (match) => {
        const id = blocks.length;
        blocks.push(match);
        return `___LATEX_BLOCK_${id}___`;
    });

    const inlineRegex = /(\$(?:[^\$\\]|\\.)+?\$)/g;
    const inlines: string[] = [];
    processedContent = processedContent.replace(inlineRegex, (match) => {
        if (/^\$\d{1,3}(?:,\d{3})*(?:\.\d+)?$/.test(match)) {
            return match;
        }
        const id = inlines.length;
        inlines.push(match);
        return `___LATEX_INLINE_${id}___`;
    });

    processedContent = processedContent
        .replace(/___BLOCK_OPEN___/g, '\\[')
        .replace(/___BLOCK_CLOSE___/g, '\\]')
        .replace(/___INLINE_OPEN___/g, '\\(')
        .replace(/___INLINE_CLOSE___/g, '\\)');

    processedContent = processedContent.replace(/___LATEX_BLOCK_(\d+)___/g, (_, id) => {
        return blocks[parseInt(id)];
    });

    processedContent = processedContent.replace(/___LATEX_INLINE_(\d+)___/g, (_, id) => {
        return inlines[parseInt(id)];
    });

    return processedContent;
};


const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const processedContent = useMemo(() => preprocessLaTeX(content), [content]);

  interface CodeBlockProps {
    language: string | undefined;
    children: string;
  }

  const CodeBlock: React.FC<CodeBlockProps> = ({ language, children }) => {
    const [isCopied, setIsCopied] = useState(false);
    const [isWrapped, setIsWrapped] = useState(true);
    const { theme } = useTheme();

    const handleCopy = useCallback(async () => {
      await navigator.clipboard.writeText(children);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      toast.success("Copied to clipboard");
    }, [children]);

    const toggleWrap = useCallback(() => {
      setIsWrapped(prev => !prev);
    }, []);

    return (
      <div className="group my-5 relative">
        <div className="rounded-md overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
            <div className="px-2 py-0.5 text-xs font-medium text-neutral-600 dark:text-neutral-400">
              {language || 'text'}
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleWrap}
                className={cn(`
                  px-2 py-1
                  rounded text-xs font-medium
                  transition-all duration-200
                  flex items-center gap-1.5
                `, isWrapped ? 'text-primary' : 'text-neutral-500 dark:text-neutral-400',
                   'hover:bg-neutral-200 dark:hover:bg-neutral-700'
                )}
                aria-label="Toggle line wrapping"
              >
                {isWrapped ? (
                  <>
                    <ArrowLeftRight className="h-3 w-3" />
                    <span className="hidden sm:inline">Unwrap</span>
                  </>
                ) : (
                  <>
                    <WrapText className="h-3 w-3" />
                    <span className="hidden sm:inline">Wrap</span>
                  </>
                )}
              </button>
              <button
                onClick={handleCopy}
                className={cn(`
                  px-2 py-1
                  rounded text-xs font-medium
                  transition-all duration-200
                  flex items-center gap-1.5
                `, isCopied ? 'text-primary dark:text-primary' : 'text-neutral-500 dark:text-neutral-400',
                   'hover:bg-neutral-200 dark:hover:bg-neutral-700'
                )}
                aria-label="Copy code"
              >
                {isCopied ? (
                  <>
                    <Check className="h-3 w-3" />
                    <span className="hidden sm:inline">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span className="hidden sm:inline">Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
          <SyntaxHighlighter
            language={language || 'text'}
            style={theme === 'dark' ? oneDark : oneLight}
            customStyle={{
              margin: 0,
              padding: '0.75rem 0.25rem 0.75rem',
              backgroundColor: theme === 'dark' ? '#171717' : 'transparent',
              borderRadius: 0,
              borderBottomLeftRadius: '0.375rem',
              borderBottomRightRadius: '0.375rem',
              fontFamily: GeistMono.style.fontFamily,
            }}
            showLineNumbers={true}
            lineNumberStyle={{
              textAlign: 'right',
              color: theme === 'dark' ? '#6b7280' : '#808080',
              backgroundColor: 'transparent',
              fontStyle: 'normal',
              marginRight: '1em',
              paddingRight: '0.5em',
              fontFamily: GeistMono.style.fontFamily,
              minWidth: '2em'
            }}
            lineNumberContainerStyle={{
              backgroundColor: theme === 'dark' ? '#171717' : '#f5f5f5',
              float: 'left'
            }}
            wrapLongLines={isWrapped}
            codeTagProps={{
              style: {
                fontFamily: GeistMono.style.fontFamily,
                fontSize: '0.85em',
                whiteSpace: isWrapped ? 'pre-wrap' : 'pre',
                overflowWrap: isWrapped ? 'break-word' : 'normal',
                wordBreak: isWrapped ? 'break-word' : 'keep-all'
              }
            }}
          >
            {children}
          </SyntaxHighlighter>
        </div>
      </div>
    );
  };
  CodeBlock.displayName = 'CodeBlock';

  const renderer = useMemo((): Partial<ReactRenderer> => {
    let localKeyCounter = 0;

    const generateKey = (prefix: string) => `${prefix}-${localKeyCounter++}`;

    const ensureKeyedChildren = (children: ReactNode, baseKey: string) => {
        return React.Children.map(children, (child, index) => {
            if (isValidElement(child)) {
                return React.cloneElement(child, { key: child.key ?? `${baseKey}-${index}-${localKeyCounter++}` });
            }
            if (typeof child === 'string' || typeof child === 'number') {
                return <span key={`${baseKey}-text-${index}-${localKeyCounter++}`}>{child}</span>;
            }
            return child;
        });
    };

    return {
      text(text: string) {
        const key = generateKey('txtVal'); // Changed from `txt` to avoid conflict with ensureKeyedChildren if it were to use 'txt' as baseKey
        if (!text.includes('$')) {
            return <span key={key}>{text}</span>;
        }
        try {
              return (
                  <Latex
                      key={key}
                      delimiters={[
                          { left: '$$', right: '$$', display: true },
                          { left: '$', right: '$', display: false }
                      ]}
                      strict={false}
                  >
                      {text}
                  </Latex>
              );
          } catch (error) {
              console.warn("LaTeX rendering error:", error, "Original text:", text);
              return <span key={`${key}-err`}>{text}</span>;
          }
      },
      paragraph(children) {
        return <p key={generateKey('p')} className="my-5 leading-relaxed text-neutral-700 dark:text-neutral-300">{ensureKeyedChildren(children, 'p-child')}</p>;
      },
      code(children, language) { // This is for fenced code blocks
        return <CodeBlock key={generateKey('codeblock')} language={language}>{String(children)}</CodeBlock>;
      },
      link(href, text) { // For inline links, the key is typically handled by the parent or ensureKeyedChildren on `text`
        return isValidUrl(href)
          ? <Link href={href} target="_blank" rel="noopener noreferrer" className="text-primary dark:text-primary-light hover:underline font-medium">{ensureKeyedChildren(text, 'link-text')}</Link>
          : <span className="text-neutral-700 dark:text-neutral-300 font-medium">{ensureKeyedChildren(text, 'nolink-text')}</span>;
      },
      heading(children, level) {
        const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
        const sizeClasses = {
          1: "text-2xl md:text-3xl font-extrabold mt-8 mb-4",
          2: "text-xl md:text-2xl font-bold mt-7 mb-3",
          3: "text-lg md:text-xl font-semibold mt-6 mb-3",
          4: "text-base md:text-lg font-medium mt-5 mb-2",
          5: "text-sm md:text-base font-medium mt-4 mb-2",
          6: "text-xs md:text-sm font-medium mt-4 mb-2",
        }[level] || "";
        return (
          <HeadingTag key={generateKey(`h${level}`)} className={`${sizeClasses} text-neutral-900 dark:text-neutral-50 tracking-tight`}>
            {ensureKeyedChildren(children, `h${level}-child`)}
          </HeadingTag>
        );
      },
      list(children, ordered) { // `children` is an array of already keyed <li> elements
        const ListTag = ordered ? 'ol' : 'ul';
        return (
          <ListTag key={generateKey(ordered ? 'ol' : 'ul')} className={`my-5 pl-6 space-y-2 text-neutral-700 dark:text-neutral-300 ${ordered ? 'list-decimal' : 'list-disc'}`}>
            {children}
          </ListTag>
        );
      },
      listItem(children) { // `children` is the rendered content of the list item
        return <li key={generateKey('li')} className="pl-1 leading-relaxed">{ensureKeyedChildren(children, 'li-child')}</li>;
      },
      blockquote(children) {
        return (
          <blockquote key={generateKey('bq')} className="my-6 border-l-4 border-primary/30 dark:border-primary/20 pl-4 py-1 text-neutral-700 dark:text-neutral-300 italic bg-neutral-50 dark:bg-neutral-900/50 rounded-r-md">
            {ensureKeyedChildren(children, 'bq-child')}
          </blockquote>
        );
      },
      table(children) { // `children` is [thead, tbody]
        return (
          <div key={generateKey('table-wrapper')} className="w-full my-6 overflow-hidden rounded-md">
            <div className="w-full overflow-x-auto rounded-md border border-neutral-200 dark:border-neutral-800 shadow-xs">
              <table className="w-full border-collapse min-w-full divide-y divide-neutral-200 dark:divide-neutral-800 m-0!">
                {children}
              </table>
            </div>
          </div>
        );
      },
      tableRow(children) { // `children` is an array of rendered <td> or <th> elements
         return (
          <tr key={generateKey('tr')} className="border-b border-neutral-200 dark:border-neutral-800 last:border-0">
            {children} {/* These children should already be keyed by tableCell */}
          </tr>
        );
      },
      tableCell(children, flags) {
         const align = flags.align ? `text-${flags.align}` : 'text-left';
         const isHeader = flags.header;
         const CellTag = isHeader ? 'th' : 'td';
         const cellClasses = isHeader
            ? cn("px-4 py-2.5 text-sm font-semibold text-neutral-900 dark:text-neutral-50", "bg-neutral-100 dark:bg-neutral-800/90", "whitespace-nowrap", align)
            : cn("px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300", "bg-white dark:bg-neutral-900", align);

         return (
            <CellTag key={generateKey(isHeader ? 'th' : 'td')} className={cellClasses}>
                {ensureKeyedChildren(children, `${isHeader ? 'th' : 'td'}-child`)}
            </CellTag>
         );
      },
      tableHeader(children) { // `children` is an array of <tr> elements
        return (
          <thead key={generateKey('thead')} className="bg-neutral-100 dark:bg-neutral-800/90">
            {children} {/* These children (<tr>) should be keyed by tableRow */}
          </thead>
        );
      },
      tableBody(children) { // `children` is an array of <tr> elements
        return (
          <tbody key={generateKey('tbody')} className="divide-y divide-neutral-200 dark:divide-neutral-800 bg-white dark:bg-neutral-900">
            {children} {/* These children (<tr>) should be keyed by tableRow */}
          </tbody>
        );
      },
    };
  }, []);


  return (
    <div className="markdown-body prose prose-neutral dark:prose-invert max-w-none dark:text-neutral-200 font-sans">
      <Marked renderer={renderer} value={processedContent} />
    </div>
  );
};

export const CopyButton = ({ text }: { text: string }) => {
  const [isCopied, setIsCopied] = useState(false);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={async () => {
        if (!navigator.clipboard) {
           toast.error("Clipboard API not available in this browser.");
          return;
        }
        try {
            await navigator.clipboard.writeText(text);
            setIsCopied(true);
            toast.success("Copied to clipboard");
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
             console.error('Failed to copy text: ', err);
             toast.error("Failed to copy text.");
        }
      }}
      className="h-8 px-2 text-xs rounded-full"
    >
      {isCopied ? (
        <Check className="h-4 w-4" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  );
};

export { MarkdownRenderer, preprocessLaTeX };
