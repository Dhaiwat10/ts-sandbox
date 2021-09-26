import Editor from '@monaco-editor/react';
import React, { useEffect } from 'react';
import Script from 'next/script';
import { Button } from '@chakra-ui/button';
import { Container, VStack, Heading, HStack, Text } from '@chakra-ui/layout';
import Head from 'next/head';
import { useToast, Link } from '@chakra-ui/react';
import { CopyIcon, SettingsIcon, ExternalLinkIcon } from '@chakra-ui/icons';

const starterCode = `// Write your code here
console.log('Hello World');`;

function formatOutput(output) {
  return output.toString().split(',').join('\n');
}

export default function Home() {
  const [inputCode, setInputCode] = React.useState(starterCode);
  const [compilerReady, setCompilerReady] = React.useState(false);
  const [logs, setLogs] = React.useState([]);
  const [compileDuration, setCompileDuration] = React.useState(null);
  const [execDuration, setExecDuration] = React.useState(null);
  const toast = useToast();

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
    const compileStart = Date.now();
    clearLogs();
    const code = inputCode;
    const jsCode = window.ts.transpile(code);
    setCompileDuration(Date.now() - compileStart);
    const execStart = Date.now();
    eval(jsCode);
    setExecDuration(Date.now() - execStart);
  }, [inputCode, clearLogs]);

  const copyOutput = React.useCallback(() => {
    navigator.clipboard.writeText(formatOutput(logs));
    toast({
      title: 'Output copied to clipboard.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  }, [logs, toast]);

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
        <VStack
          spacing={4}
          onKeyUp={(e) => {
            if (e.ctrlKey && e.keyCode === 13) {
              compileAndExecute();
              setInputCode((input) => input.slice(0, input.length - 1));
            }
          }}
        >
          <HStack justifyContent='space-between' width='full'>
            <Heading>TS Sandbox</Heading>
            <Link href='https://github.com/dhaiwat10/ts-sandbox' isExternal>
              Source code <ExternalLinkIcon mx='2px' />
            </Link>
          </HStack>

          <Editor
            height='50vh'
            width='100%'
            language='typescript'
            defaultValue={starterCode}
            value={inputCode}
            onChange={setInputCode}
            theme='vs-dark'
          />

          <Button
            leftIcon={<SettingsIcon />}
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
              value={formatOutput(logs)}
              theme='vs-dark'
            />
          )}

          <Button leftIcon={<CopyIcon />} onClick={copyOutput}>
            Copy Output
          </Button>

          {compileDuration && execDuration && (
            <>
              <Text>Compile Time: {compileDuration}ms</Text>
              <Text>Execution Time: {execDuration}ms</Text>
            </>
          )}
        </VStack>
      </Container>
    </>
  );
}
