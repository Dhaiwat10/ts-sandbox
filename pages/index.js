import Editor from '@monaco-editor/react';
import React, { useEffect } from 'react';
import Script from 'next/script';
import { Button } from '@chakra-ui/button';
import { Container, VStack, Heading, HStack, Text } from '@chakra-ui/layout';
import { useToast, Link } from '@chakra-ui/react';
import { CopyIcon, SettingsIcon, ExternalLinkIcon } from '@chakra-ui/icons';

const starterCode = `// Write your code here
console.log('Hello World');`;

function formatOutput(output) {
  return output.toString().split(',').join('\n');
}

function getTypeErrors(code, ts) {
  const dummyFilePath = '/file.ts';
  const textAst = ts.createSourceFile(
    dummyFilePath,
    code,
    ts.ScriptTarget.Latest
  );
  const options = {};
  const host = {
    fileExists: (filePath) => filePath === dummyFilePath,
    directoryExists: (dirPath) => dirPath === '/',
    getCurrentDirectory: () => '/',
    getDirectories: () => [],
    getCanonicalFileName: (fileName) => fileName,
    getNewLine: () => '\n',
    getDefaultLibFileName: () => '',
    getSourceFile: (filePath) =>
      filePath === dummyFilePath ? textAst : undefined,
    readFile: (filePath) => (filePath === dummyFilePath ? code : undefined),
    useCaseSensitiveFileNames: () => true,
    writeFile: () => {},
  };
  const program = ts.createProgram({
    options,
    rootNames: [dummyFilePath],
    host,
  });

  return ts
    .getPreEmitDiagnostics(program)
    .filter((d) => d.file)
    .filter(
      (d) =>
        // Ignoring an error that says that console is not in scope (more about it here: https://stackoverflow.com/a/53764522 (check the imperfect example section))
        !d.messageText.startsWith("Cannot find name 'console'")
    )
    .map((d) => d.messageText);
}

export default function Home() {
  const [inputCode, setInputCode] = React.useState(starterCode);
  const [compilerReady, setCompilerReady] = React.useState(false);
  const [logs, setLogs] = React.useState([]);
  const [compileDuration, setCompileDuration] = React.useState(null);
  const [execDuration, setExecDuration] = React.useState(null);
  const [errors, setErrors] = React.useState([]);
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
    setErrors([]);
  }, [setLogs]);

  const compileAndExecute = React.useCallback(() => {
    const compileStart = Date.now();
    clearLogs();
    const code = inputCode;

    const typeErrors = getTypeErrors(code, window.ts);

    if (typeErrors.length === 0) {
      const jsCode = window.ts.transpile(code);
      setCompileDuration(Date.now() - compileStart);
      const execStart = Date.now();
      eval(jsCode);
      setExecDuration(Date.now() - execStart);
    } else {
      setErrors(typeErrors);
    }
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

          <Text width='100%' textAlign='left' fontWeight='bold'>
            Write your code here
          </Text>
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

          {errors.length > 0 && (
            <>
              <Text textAlign='left' width='100%' fontWeight='bold'>
                Errors
              </Text>
              {errors.map((err, idx) => (
                <Text
                  width='100%'
                  textAlign='left'
                  fontSize='sm'
                  key={idx}
                  color='red'
                >
                  {err}
                </Text>
              ))}
            </>
          )}

          <Text width='100%' textAlign='left' fontWeight='bold'>
            Output
          </Text>
          <Editor
            defaultValue='// Output will be shown here'
            height='30vh'
            value={formatOutput(logs)}
            theme='vs-dark'
            options={{
              readOnly: true,
            }}
          />

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
