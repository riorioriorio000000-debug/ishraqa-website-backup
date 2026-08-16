import { dehydrate, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { renderToString } from "react-dom/server";
import superjson from "superjson";
import { Router } from "wouter";
import App from "./App";
import { trpc } from "./lib/trpc";
import { getSsrHeadMeta, type SsrHeadMeta } from "./ssr/meta";

export type SsrRenderResult = { html: string; dehydratedState: unknown; head: SsrHeadMeta };

export async function render(url: string): Promise<SsrRenderResult> {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } } });
  const questionMark = url.indexOf("?");
  const ssrPath = questionMark === -1 ? url : url.slice(0, questionMark);
  const ssrSearch = questionMark === -1 ? "" : url.slice(questionMark + 1);
  const head = getSsrHeadMeta(url);
  const trpcClient = trpc.createClient({ links: [httpBatchLink({ url: "/api/trpc", transformer: superjson })] });
  const html = renderToString(
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <Router ssrPath={ssrPath} ssrSearch={ssrSearch}><App /></Router>
      </QueryClientProvider>
    </trpc.Provider>,
  );
  return { html, dehydratedState: dehydrate(queryClient), head };
}
