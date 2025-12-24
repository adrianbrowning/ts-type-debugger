import { Editor } from "@monaco-editor/react";
import React, { useState, useCallback, useRef, useEffect } from "react";
import { useTheme } from "../hooks/useThemeHook.ts";
import { ThemeDropdown } from "./ThemeDropdown.tsx";

type LandingPageProps = {
  onTryIt: (code: string, typeName: string) => void;
};

type Example = {
  label: string;
  code: string;
  typeName: string;
  link: string;
};

type ExampleButtonProps = {
  example: Example;
  onClick: (example: Example) => void;
  isSelected: boolean;
};

const ExampleButton: React.FC<ExampleButtonProps> = ({ example, onClick, isSelected }) => {
  const handleClick = useCallback(() => {
    onClick(example);
  }, [ example, onClick ]);

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`landing-example-btn${isSelected ? " selected" : ""}`}
      aria-label={`Load ${example.label} example`}
    >
      {example.label}
    </button>
  );
};

const EXAMPLES: Array<Example> = [
  {
    label: "Conditional",
    code: `type Foo<T> = T extends string ? Uppercase<T> : never;`,
    typeName: "Foo<'hello'>",
    link: "/debugger?code=IwHwYg9hA8DkAWBTANsisB8IAuBPADogASQwAqGRAvEWUYgB7aIB2AJgM5EfYBOAliwDmRAPxEAqvkK8AxgEMOiaBSIAuIi0QA3RLwDcQA",
  },
  {
    label: "Flatten",
    code: `type Flatten<T> = T extends any[] ? T[number] : T;`,
    typeName: "Flatten<number[][]>",
    link: "/debugger?code=IwHwYgNghgLjCmA7APIgrgWwEbwE4G0BdIgPhBgE8AHeAAklgRQBUTaBeW52%2BADyYAmAZ1pREFIrQD8XfOmx5CtAFxcA3EA",
  },
  {
    label: "keyof",
    code: `type Keys<T> = keyof T;`,
    typeName: "Keys<{ a: number; b: string }>;",
    link: "/debugger?code=IwHw0gpgngzgPAbwAQEMBcSB2BXAtgIwgCcBuJfDGAFyIEtMBzJAXwD4SQqoAHCJSWHAAqrJAF4kAa2gB7AGZIhJIA",
  },
  {
    label: "infer",
    code: `type MyAwaited<T> = T extends Promise<infer U> ? U : T;`,
    typeName: "MyAwaited<Promise<string>>",
    link: "/debugger?code=IwHwsgnggg7ghgSwC4FMAmAeACgJwPYC2CAzihsUjggHYDmAfPSEhAA4oAEksiqmAKvQ4BeDvw4oAHqmppiHXIRJkaAMxQ4OAVSEB%2BbRwBcYgNxA",
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({ onTryIt }) => {
  const { isDark } = useTheme();
  const monacoTheme = isDark ? "vs-dark" : "vs";

  const defaultExample = EXAMPLES[0] as (typeof EXAMPLES)[number];
  const [ inputCode, setInputCode ] = useState(defaultExample.code);
  const [ typeName, setTypeName ] = useState(defaultExample.typeName);
  const [ output, setOutput ] = useState<string>("");
  const [ selectedExample, setSelectedExample ] = useState(defaultExample);

  // Video lazy-loading state
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ videoLoaded, setVideoLoaded ] = useState(false);
  const [ videoPlaying, setVideoPlaying ] = useState(false);

  const handleHover = useCallback(() => {
    if (!videoLoaded) {
      setVideoLoaded(true);
    }
  }, [ videoLoaded ]);

  const handlePlayVideo = useCallback(() => {
    setVideoLoaded(true);
    setVideoPlaying(true);
    void videoRef.current?.play();
  }, []);

  const loadExample = useCallback((example: Example) => {
    setInputCode(example.code);
    setTypeName(example.typeName);
    setOutput("");
    setSelectedExample(example);
  }, []);

  const handleEvaluate = useCallback(() => {
    // Use pre-computed link if example unchanged; otherwise generate dynamic URL
    const isUnmodified =
      inputCode === selectedExample.code &&
      typeName === selectedExample.typeName;

    if (isUnmodified) {
      window.location.href = selectedExample.link;
    }
    else {
      onTryIt(inputCode, typeName);
    }
  }, [ inputCode, typeName, selectedExample, onTryIt ]);

  const handleTypeNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTypeName(e.target.value);
  }, []);

  const handleEditorChange = useCallback((value: string | undefined) => {
    setInputCode(value ?? "");
  }, []);

  // Scroll-to-top button visibility
  const [ showScrollTop, setShowScrollTop ] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 200);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTry = useCallback(() => {
    document.getElementById("try")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <div className="landing-page">
      {/* HERO */}
      <header className="landing-hero border-b">
        {/* Theme Toggle + GitHub - Top Right */}
        <div className="landing-header-controls">
          <ThemeDropdown />
          <span className="landing-footer-divider" />
          <a
            href="https://github.com/AdrianMayron/ts-type-debugger"
            target="_blank"
            rel="noopener noreferrer"
            className="landing-github-link"
            title="View on GitHub"
          >
            <svg
              className="landing-icon-md"
              viewBox="0 0 16 16"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
          </a>
        </div>

        <div className="landing-hero-content">
          <div className="landing-badge">
            <span>{"Type Evaluation Debugger"}</span>
            <span className="landing-text-muted">{"•"}</span>
            <span>{"Visualize types, step-by-step"}</span>
          </div>

          <h1 className="landing-title">
            {"Visualize & Debug Complex"}<br />{"TypeScript Types"}
            <span className="landing-title-accent">{" instantly"}</span>
          </h1>

          <p className="landing-subtitle landing-container">
            {"Paste any TypeScript type and see how it evaluates step-by-step — ideal for learning, debugging, and mastering advanced type logic."}
          </p>

          <nav className="landing-nav" aria-label="Page navigation">
            <a href="#try" className="landing-btn-primary">
              {"Try It Now"}
            </a>
            <a href="#action" className="landing-btn-secondary">
              {"See It in Action"}
            </a>
            <a href="#features" className="landing-btn-outline">
              {"See Features"}
            </a>
          </nav>
        </div>
      </header>

      <main>
        {/* TRY + WHY SPLIT SECTION */}
        <section id="try" className="landing-section">
          <div className="landing-container-lg">
            <div className="landing-card">
              <div className="landing-try-grid">
                {/* TRY IT COLUMN */}
                <div>
                  <h2 className="landing-heading landing-heading-lg">{"Try It — Paste Your TypeScript Types"}</h2>

                  <div className="landing-input-row">
                    <label htmlFor="typeName" className="landing-label">{"Type to evaluate:"}</label>
                    <input
                      id="typeName"
                      type="text"
                      value={typeName}
                      onChange={handleTypeNameChange}
                      className="landing-input"
                    />
                  </div>

                  <label htmlFor="inputTypes" className="sr-only">{"TypeScript code input"}</label>
                  <div className="landing-editor-container">
                    <Editor
                      height="176px"
                      defaultLanguage="typescript"
                      value={inputCode}
                      onChange={handleEditorChange}
                      theme={monacoTheme}
                      options={{
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        fontSize: 13,
                        lineHeight: 20,
                        fontFamily: "'Fira Code', monospace",
                        tabSize: 2,
                        padding: { top: 12, bottom: 12 },
                        lineNumbersMinChars: 2,
                        renderLineHighlight: "none",
                        overviewRulerLanes: 0,
                        hideCursorInOverviewRuler: true,
                        scrollbar: { vertical: "hidden", horizontal: "auto" },
                      }}
                      loading={<div className="landing-editor-loading">{"Loading editor..."}</div>}
                    />
                  </div>

                  <div className="landing-action-row">
                    <button
                      type="button"
                      onClick={handleEvaluate}
                      className="landing-btn-primary"
                    >
                      {"Evaluate"}
                    </button>

                    {/* INLINE EXAMPLES */}
                    <div className="landing-examples-row">
                      {EXAMPLES.map(example => (
                        <ExampleButton
                          key={example.label}
                          example={example}
                          onClick={loadExample}
                          isSelected={selectedExample.label === example.label}
                        />
                      ))}
                    </div>
                  </div>

                  {output && (
                    <pre className="landing-output">
                      {output}
                    </pre>
                  )}
                </div>

                {/* WHY COLUMN */}
                <aside>
                  <div className="landing-card-inner">
                    <h3 className="landing-heading landing-heading-md">{"Why TS Debugger?"}</h3>

                    <p className="landing-text">
                      {"TypeScript's type system is incredibly powerful — and famously hard to reason about once types become generic, conditional, or recursive."}
                    </p>

                    <ul className="landing-text landing-why-list">
                      <li>{"See how types actually evaluate, step by step"}</li>
                      <li>
                        {"Understand "}<code className="landing-code">{"extends"}</code>{", "}<code className="landing-code">{"infer"}</code>{", and mapped types visually"}
                      </li>
                      <li>{"Debug type errors without trial-and-error"}</li>
                      <li>{"Learn advanced TypeScript faster"}</li>
                    </ul>

                    <p className="landing-text-muted">
                      {"Ideal for library authors, educators, and developers working with advanced TypeScript patterns."}
                    </p>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </section>

        {/* SEE IT IN ACTION */}
        <section id="action" className="landing-section-sm">
          <div className="landing-container-lg">
            <div className="landing-card-alt">
              <div className="landing-section-header">
                <div>
                  <h2 className="landing-heading landing-heading-lg">{"See It in Action"}</h2>
                  <p className="landing-text landing-container">
                    {"A quick walkthrough showing how a complex type turns into a clear, step-by-step explanation."}
                  </p>
                </div>
              </div>

              {/* Demo Video */}
              <div className="landing-video-container">
                {!videoPlaying && (
                  <button
                    type="button"
                    className="landing-video-overlay"
                    onClick={handlePlayVideo}
                    onMouseEnter={handleHover}
                    onFocus={handleHover}
                  >
                    <div className="landing-play-btn">
                      <span>{"▶"}</span>
                    </div>
                  </button>
                )}
                {videoLoaded && (
                  <video
                    ref={videoRef}
                    muted
                    loop
                    playsInline
                    controls={videoPlaying}
                    className="landing-video"
                    preload="auto"
                  >
                    <source src="/ts-debugger-view.webm" type="video/webm" />
                    <source src="/ts-debugger-view.mp4" type="video/mp4" />
                    {"Your browser does not support the video tag."}
                  </video>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="landing-section">
          <div className="landing-container-lg">
            <div className="landing-features-card">
              <h2 className="landing-heading landing-heading-lg">{"Features"}</h2>
              <p className="landing-text landing-container">
                {"A debugger built specifically for TypeScript's type system — understand exactly how your types evaluate."}
              </p>

              <div className="landing-features-grid">
                <article className="landing-feature-card">
                  <h3 className="landing-heading landing-heading-md">{"Debugger Controls"}</h3>
                  <p className="landing-text">
                    {"Step into nested generics, step over branches, or step out to parent types. Navigate evaluation like you would runtime code."}
                  </p>
                </article>
                <article className="landing-feature-card">
                  <h3 className="landing-heading landing-heading-md">{"Call Stack Navigation"}</h3>
                  <p className="landing-text">
                    {"See the full evaluation path from your target type down to the current expression. Click any frame to jump directly."}
                  </p>
                </article>
                <article className="landing-feature-card">
                  <h3 className="landing-heading landing-heading-md">{"Scope Inspection"}</h3>
                  <p className="landing-text">
                    {"Watch how generic parameters bind at each step. See exactly what T resolves to inside conditionals and mapped types."}
                  </p>
                </article>
                <article className="landing-feature-card">
                  <h3 className="landing-heading landing-heading-md">{"Union Distribution"}</h3>
                  <p className="landing-text">
                    {"Visualize how unions distribute over conditionals. See each member evaluated individually, then combined into the final result."}
                  </p>
                </article>
                <article className="landing-feature-card">
                  <h3 className="landing-heading landing-heading-md">{"Infer Pattern Matching"}</h3>
                  <p className="landing-text">
                    {"Understand how infer captures types. See the pattern, what matched, and what got extracted at each step."}
                  </p>
                </article>
                <article className="landing-feature-card">
                  <h3 className="landing-heading landing-heading-md">{"Globals & Type Aliases"}</h3>
                  <p className="landing-text">
                    {"Track all type aliases in scope. Quickly reference definitions while stepping through complex type compositions."}
                  </p>
                </article>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="landing-footer border-t">
        <div className="landing-footer-content">
          <span>{"Made for TypeScript developers & learners."}</span>
          <span className="landing-footer-divider" aria-hidden="true" />
          <a
            href="https://github.com/AdrianMayron/ts-type-debugger"
            className="landing-link landing-footer-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg
              className="landing-icon-sm"
              viewBox="0 0 16 16"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            {"GitHub"}
          </a>
        </div>
      </footer>

      {/* Scroll to Try It button */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTry}
          className="landing-scroll-top"
          aria-label="Scroll to Try It section"
        >
          <svg
            className="landing-icon-md"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </button>
      )}
    </div>
  );
};
