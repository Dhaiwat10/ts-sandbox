import Editor from '@monaco-editor/react';
import React, { useEffect } from 'react';
import Script from 'next/script';

export default function Home() {
  const [inputCode, setInputCode] = React.useState('');
  const [compilerReady, setCompilerReady] = React.useState(false);
  const [logs, setLogs] = React.useState([]);

  useEffect(() => {
    console.stdlog = console.log.bind(console);
    console.log = function () {
      setLogs((logs) => [...logs, Array.from(arguments)]);
      console.stdlog.apply(console, arguments);
    };
  }, []);

  const clearLogs = React.useCallback(() => {
    setLogs([]);
  }, [setLogs]);

  const compileAndExecute = React.useCallback(() => {
    clearLogs();
    const code = inputCode;
    const jsCode = window.ts.transpile(code);
    eval(jsCode);
  }, [inputCode, clearLogs]);

  return (
    <>
      <Script
        onLoad={() => setCompilerReady(true)}
        src='https://unpkg.com/typescript@latest/lib/typescriptServices.js'
      />
      <div>
        <Editor
          height='50vh'
          width='50%'
          defaultLanguage='typescript'
          defaultValue='// some comment'
          value={inputCode}
          onChange={setInputCode}
          theme='vs-dark'
        />

        <button onClick={compileAndExecute} disabled={!compilerReady}>
          Run
        </button>

        {logs && <pre>{logs}</pre>}
      </div>
    </>
  );
}
