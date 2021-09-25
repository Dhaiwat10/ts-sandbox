import Editor from '@monaco-editor/react';
import React, { useEffect } from 'react';
import Script from 'next/script';
import { Button } from '@chakra-ui/button';
import { Container, VStack } from '@chakra-ui/layout';
import Head from 'next/head';

const starterCode = `// Write your code here
console.log('Hello World');`;

export default function Home() {
  const [inputCode, setInputCode] = React.useState(starterCode);
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
      <Head>
        <title>TS Sandbox</title>
      </Head>
      <Script
        onLoad={() => setCompilerReady(true)}
        src='https://unpkg.com/typescript@latest/lib/typescriptServices.js'
      />
      <Container padding='5'>
        <VStack>
          <Editor
            height='60vh'
            width='100%'
            language='typescript'
            defaultValue={starterCode}
            value={inputCode}
            onChange={setInputCode}
            theme='vs-dark'
          />

          <Button
            backgroundColor='green.200'
            onClick={compileAndExecute}
            disabled={!compilerReady}
          >
            Run
          </Button>

          {logs && (
            <Editor
              defaultValue='// Output will be shown here'
              height='30vh'
              value={logs.toString().split(',').join('\n')}
              theme='vs-dark'
            />
          )}
        </VStack>
      </Container>
    </>
  );
}
