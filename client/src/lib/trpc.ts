type StaticQueryResult = {
  data?: unknown;
  isLoading: false;
  isFetching: false;
  isError: false;
  error: null;
  refetch: () => Promise<{ data: unknown }>;
};

type StaticMutationResult = {
  data?: unknown;
  isPending: false;
  isError: false;
  error: null;
  mutate: (_input?: unknown, _options?: unknown) => void;
  mutateAsync: (_input?: unknown) => Promise<undefined>;
  reset: () => void;
};

const queryResult = (): StaticQueryResult => ({
  data: undefined,
  isLoading: false,
  isFetching: false,
  isError: false,
  error: null,
  refetch: async () => ({ data: undefined }),
});

const mutationResult = (): StaticMutationResult => ({
  data: undefined,
  isPending: false,
  isError: false,
  error: null,
  mutate: () => undefined,
  mutateAsync: async () => undefined,
  reset: () => undefined,
});

/**
 * نسخة ثابتة من عميل tRPC. تحفظ واجهة المكونات القديمة حتى تعمل صفحات
 * المقالات والخدمات على GitHub Pages دون قاعدة بيانات أو API خارجي.
 * الوظائف التفاعلية التي تحتاج خادمًا (التعليقات، التقييمات، الإشعارات، AI)
 * تصبح اختيارية بصمت بدل تعطيل الصفحة كاملة.
 */
const staticProcedure = new Proxy({}, {
  get: () => new Proxy({}, {
    get: (_target, property) => {
      if (property === "useMutation") return mutationResult;
      return queryResult;
    },
  }),
});

export const trpc = new Proxy({}, {
  get: () => staticProcedure,
}) as any;
