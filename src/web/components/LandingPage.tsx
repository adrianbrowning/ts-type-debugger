import React, { useState, useCallback } from "react";
import { ThemeDropdown } from "./ThemeDropdown.tsx";

type LandingPageProps = {
  onTryIt: (code: string, typeName: string) => void;
};

type Example = {
  label: string;
  code: string;
  typeName: string;
};

type ExampleButtonProps = {
  example: Example;
  onClick: (example: Example) => void;
};

const ExampleButton: React.FC<ExampleButtonProps> = ({ example, onClick }) => {
  const handleClick = useCallback(() => {
    onClick(example);
  }, [ example, onClick ]);

  return (
    <button
      type="button"
      onClick={handleClick}
      className="px-3 py-2 text-sm border border-slate-700 rounded hover:bg-slate-800 transition-colors theme-light:border-slate-300 theme-light:hover:bg-slate-100"
    >
      {example.label}
    </button>
  );
};

const EXAMPLES: Array<Example> = [
  {
    label: "Conditional",
    code: `type Foo<T> = T extends string ? Uppercase<T> : never;
type Result = Foo<'hello'>;`,
    typeName: "Result",
  },
  {
    label: "Flatten",
    code: `type Flatten<T> = T extends any[] ? T[number] : T;
type Result = Flatten<number[][]>;`,
    typeName: "Result",
  },
  {
    label: "keyof",
    code: `type Keys<T> = keyof T;
type Result = Keys<{ a: number; b: string }>;`,
    typeName: "Result",
  },
  {
    label: "infer",
    code: `type MyAwaited<T> = T extends Promise<infer U> ? U : T;
type Result = MyAwaited<Promise<string>>;`,
    typeName: "Result",
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({ onTryIt }) => {
  const defaultExample = EXAMPLES[0] as (typeof EXAMPLES)[number];
  const [ inputCode, setInputCode ] = useState(defaultExample.code);
  const [ typeName, setTypeName ] = useState(defaultExample.typeName);
  const [ output, setOutput ] = useState<string>("");

  const loadExample = useCallback((example: Example) => {
    setInputCode(example.code);
    setTypeName(example.typeName);
    setOutput("");
  }, []);

  const handleEvaluate = useCallback(() => {
    onTryIt(inputCode, typeName);
  }, [ inputCode, typeName, onTryIt ]);

  const handleTypeNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTypeName(e.target.value);
  }, []);

  const handleCodeChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputCode(e.target.value);
  }, []);

  return (
    <div className="landing-page min-h-screen font-sans">
      {/* HERO */}
      <header className="landing-hero border-b">
        {/* Theme Toggle + GitHub - Top Right */}
        <div className="absolute top-4 right-6 flex items-center gap-3">
          <ThemeDropdown />
          <span className="landing-footer-divider w-px h-5" />
          <a
            href="https://github.com/AdrianMayron/ts-type-debugger"
            target="_blank"
            rel="noopener noreferrer"
            className="landing-github-link flex items-center justify-center w-9 h-9 rounded-lg transition-colors"
            title="View on GitHub"
          >
            <svg className="w-5 h-5" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
          </a>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-16 text-center">
          <div className="landing-badge inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs">
            <span className="opacity-80">{"Type Evaluation Debugger"}</span>
            <span className="opacity-40">{"•"}</span>
            <span className="opacity-80">{"Visualize types, step-by-step"}</span>
          </div>

          <h1 className="landing-title mt-6 text-4xl md:text-5xl font-extrabold tracking-tight">
            {"Visualize & Debug Complex"}<br />{"TypeScript Types"}
            <span className="landing-title-accent">{" instantly"}</span>
          </h1>

          <p className="landing-subtitle mt-5 text-lg max-w-3xl mx-auto">
            {"Paste any TypeScript type and see how it evaluates step-by-step — ideal for learning, debugging, and mastering advanced type logic."}
          </p>

          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="#try"
              className="landing-btn-primary px-6 py-3 font-semibold rounded-lg transition-colors"
            >
              {"Try It Now"}
            </a>
            <a
              href="#action"
              className="landing-btn-secondary px-6 py-3 rounded-lg transition-colors"
            >
              {"See It in Action"}
            </a>
            <a
              href="#features"
              className="landing-btn-outline px-6 py-3 rounded-lg transition-colors"
            >
              {"See Features"}
            </a>
          </div>
        </div>
      </header>

      {/* TRY + WHY SPLIT SECTION */}
      <section id="try" className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="landing-card rounded-2xl p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
              {/* TRY IT COLUMN */}
              <div className="md:col-span-7">
                <h2 className="landing-heading text-2xl font-bold">{"Try It — Paste Your TypeScript Types"}</h2>

                <div className="mt-4 flex gap-2 items-center">
                  <label htmlFor="typeName" className="landing-label text-sm">{"Type to evaluate:"}</label>
                  <input
                    id="typeName"
                    type="text"
                    value={typeName}
                    onChange={handleTypeNameChange}
                    className="landing-input px-3 py-1.5 rounded-lg font-mono text-sm focus:outline-none focus:ring-2"
                    placeholder="Result"
                  />
                </div>

                <textarea
                  id="inputTypes"
                  value={inputCode}
                  onChange={handleCodeChange}
                  className="landing-textarea w-full mt-4 p-3 rounded-lg h-44 font-mono text-sm focus:outline-none focus:ring-2 resize-none"
                  placeholder="type Foo<T> = T extends string ? Uppercase<T> : never;\ntype Result = Foo<'hello'>;"
                />

                <div className="mt-4 flex flex-col sm:flex-row gap-4 items-start">
                  <button
                    type="button"
                    onClick={handleEvaluate}
                    className="landing-btn-primary px-6 py-3 font-semibold rounded-lg transition-colors"
                  >
                    {"Evaluate"}
                  </button>

                  {/* INLINE EXAMPLES */}
                  <div className="flex flex-wrap gap-2">
                    {EXAMPLES.map(example => (
                      <ExampleButton
                        key={example.label}
                        example={example}
                        onClick={loadExample}
                      />
                    ))}
                  </div>
                </div>

                {output && (
                  <pre className="landing-output mt-6 p-4 rounded-lg text-sm whitespace-pre-wrap">
                    {output}
                  </pre>
                )}
              </div>

              {/* WHY COLUMN */}
              <div className="md:col-span-5">
                <div className="landing-card-inner rounded-xl p-6">
                  <h3 className="landing-heading text-xl font-semibold">{"Why TS Debugger?"}</h3>

                  <p className="landing-text mt-3">
                    {"TypeScript's type system is incredibly powerful — and famously hard to reason about once types become generic, conditional, or recursive."}
                  </p>

                  <ul className="mt-5 space-y-3 landing-text pl-4">
                    <li className="flex gap-3">
                      <span>{"🔍"}</span>
                      <span>{"See how types actually evaluate, step by step"}</span>
                    </li>
                    <li className="flex gap-3">
                      <span>{"🧠"}</span>
                      <span>
                        {"Understand "}<code className="landing-code px-1 py-0.5 rounded">{"extends"}</code>{", "}<code className="landing-code px-1 py-0.5 rounded">{"infer"}</code>{", and mapped types visually"}
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span>{"🐞"}</span>
                      <span>{"Debug type errors without trial-and-error"}</span>
                    </li>
                    <li className="flex gap-3">
                      <span>{"📚"}</span>
                      <span>{"Learn advanced TypeScript faster"}</span>
                    </li>
                  </ul>

                  <p className="landing-text-muted mt-5 text-sm">
                    {"Ideal for library authors, educators, and developers working with advanced TypeScript patterns."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEE IT IN ACTION */}
      <section id="action" className="pb-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="landing-card-alt rounded-2xl p-6 md:p-8">
            <div className="flex items-end justify-between gap-6 flex-wrap">
              <div>
                <h2 className="landing-heading text-2xl font-bold">{"See It in Action"}</h2>
                <p className="landing-text mt-2 max-w-2xl">
                  {"A quick walkthrough showing how a complex type turns into a clear, step-by-step explanation."}
                </p>
              </div>
              <a href="#try" className="landing-link text-sm underline underline-offset-4">
                {"Back to Try It"}
              </a>
            </div>

            {/* Video / GIF Placeholder */}
            <div className="landing-video-placeholder mt-6 rounded-xl overflow-hidden">
              <div className="aspect-video flex items-center justify-center relative">
                <div className="absolute inset-0 landing-video-gradient" />
                <div className="relative text-center px-6">
                  <div className="landing-play-btn mx-auto w-14 h-14 rounded-full flex items-center justify-center">
                    <span className="text-2xl">{"▶"}</span>
                  </div>
                  <p className="landing-text mt-3 text-sm">{"Walkthrough video / animated GIF placeholder"}</p>
                  <p className="landing-text-muted mt-1 text-xs">
                    {"(Drop in a "}<code className="landing-code px-1 py-0.5 rounded">{"&lt;video&gt;"}</code>{" or "}<code className="landing-code px-1 py-0.5 rounded">{"&lt;img&gt;"}</code>{" here)"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="landing-features-card rounded-2xl p-6 md:p-8">
            <h2 className="landing-heading text-2xl font-bold">{"Features"}</h2>
            <p className="landing-text mt-2 max-w-2xl">
              {"A debugger built specifically for TypeScript's type system — understand exactly how your types evaluate."}
            </p>

            <div className="grid gap-4 mt-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="landing-feature-card p-5 rounded-xl">
                <h3 className="landing-heading font-semibold">{"Debugger Controls"}</h3>
                <p className="landing-text mt-2 text-sm">
                  {"Step into nested generics, step over branches, or step out to parent types. Navigate evaluation like you would runtime code."}
                </p>
              </div>
              <div className="landing-feature-card p-5 rounded-xl">
                <h3 className="landing-heading font-semibold">{"Call Stack Navigation"}</h3>
                <p className="landing-text mt-2 text-sm">
                  {"See the full evaluation path from your target type down to the current expression. Click any frame to jump directly."}
                </p>
              </div>
              <div className="landing-feature-card p-5 rounded-xl">
                <h3 className="landing-heading font-semibold">{"Scope Inspection"}</h3>
                <p className="landing-text mt-2 text-sm">
                  {"Watch how generic parameters bind at each step. See exactly what T resolves to inside conditionals and mapped types."}
                </p>
              </div>
              <div className="landing-feature-card p-5 rounded-xl">
                <h3 className="landing-heading font-semibold">{"Union Distribution"}</h3>
                <p className="landing-text mt-2 text-sm">
                  {"Visualize how unions distribute over conditionals. See each member evaluated individually, then combined into the final result."}
                </p>
              </div>
              <div className="landing-feature-card p-5 rounded-xl">
                <h3 className="landing-heading font-semibold">{"Infer Pattern Matching"}</h3>
                <p className="landing-text mt-2 text-sm">
                  {"Understand how infer captures types. See the pattern, what matched, and what got extracted at each step."}
                </p>
              </div>
              <div className="landing-feature-card p-5 rounded-xl">
                <h3 className="landing-heading font-semibold">{"Globals & Type Aliases"}</h3>
                <p className="landing-text mt-2 text-sm">
                  {"Track all type aliases in scope. Quickly reference definitions while stepping through complex type compositions."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer border-t py-8">
        <div className="flex items-center justify-center gap-4">
          <span>{"Made for TypeScript developers & learners."}</span>
          <span className="landing-footer-divider w-px h-5" />
          <a
            href="https://github.com/AdrianMayron/ts-type-debugger"
            className="landing-link hover:underline flex items-center gap-1.5"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            {"GitHub"}
          </a>
        </div>
      </footer>
    </div>
  );
};
