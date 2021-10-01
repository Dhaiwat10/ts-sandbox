import { ChakraProvider } from '@chakra-ui/react';
import '@fontsource/inter';
import { theme } from '../theme';
import Head from 'next/head';

function SEO() {
  return (
    <Head>
      <title>TypeScript Sandbox</title>
      <meta name='title' content='TypeScript Sandbox' />
      <meta
        name='description'
        content='Compile & run TypeScript code inside your browser. '
      />
      <meta
        name='keywords'
        content='typescript,playground,sandbox,browser,compile,run,execute,javascript,ts'
      />
      <meta name='robots' content='index, follow' />
      <meta httpEquiv='Content-Type' content='text/html; charset=utf-8' />
      <meta name='language' content='English' /> /
      <meta name='author' content='Dhaiwat Pandya' />
    </Head>
  );
}

function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider theme={theme}>
      <SEO />
      <Component {...pageProps} />
    </ChakraProvider>
  );
}
export default MyApp;
