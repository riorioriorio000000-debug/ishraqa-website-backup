# ملاحظات بحث SEO — Google Search Central

تمت مراجعة مصادر Google الرسمية في 14 أغسطس 2026 لتوجيه تحسينات الموقع. لا يوجد إجراء تقني يضمن الفهرسة أو المركز الأول؛ فالمطلوب هو تسهيل الزحف والفهم وتقديم محتوى أصلي مفيد.

| المحور | التطبيق في موقع الإشراقة | المصدر الرسمي |
| --- | --- | --- |
| قابلية الاكتشاف | إبقاء الروابط الداخلية مفهومة وإضافة الصفحات المهمة إلى خريطة الموقع. خريطة الموقع تساعد على اكتشاف الروابط لكنها لا تضمن زحفها أو فهرستها. | [Google: Learn about sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview) |
| نشاط محلي | استخدام JSON-LD من نوع `LocalBusiness` بمعلومات مطابقة لما يظهر للزائر، ثم اختباره في Rich Results Test وفحص الرابط عبر Search Console. | [Google: LocalBusiness structured data](https://developers.google.com/search/docs/appearance/structured-data/local-business) |
| الصور | استخدام عناصر `<img>` بسمات `alt` وصفية ومتصلة بسياق الصفحة، وأصول متجاوبة مع `src` احتياطي، وعدم حشو الكلمات المفتاحية في البدائل. يستخدم Google النص البديل مع محتوى الصفحة وفهمه البصري لاستنتاج موضوع الصورة. | [Google: Image SEO best practices](https://developers.google.com/search/docs/appearance/google-images) |
| المحتوى | كتابة محتوى أصلي ومفيد ومنظم بعناوين وفقرات وروابط داخلية منطقية، وتجنب الصفحات المتكررة أو حشو الكلمات المفتاحية. | [Google: SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide) |
| المتابعة | بعد النشر يُقدَّم الموقع وملف sitemap في Google Search Console، ثم يُتابَع تقرير الفهرسة وURL Inspection. قد ينعكس الأثر خلال أسابيع أو أشهر، وليس فورًا. | [Google: SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide) |

## قرارات تنفيذية

- ستُنشأ مقالات المدن كصفحات ذات قيمة فعلية ومختلفة، لا قوالب متطابقة باسم المدينة.
- لن تُضاف تقييمات أو مراجعات مصطنعة إلى البيانات المنظمة أو الواجهة.
- ستُحدَّث الوسوم، الروابط الأساسية، `robots.txt`، `sitemap.xml`، ملف PWA، وبدائل الصور، ثم تُفحص صفحات النشر قبل طلب الفهرسة.
- ستقتصر خريطة الموقع على الصفحات التي يُسمح بفهرستها وتكون روابطها الداخلية متاحة للزائر؛ فالخريطة تساعد Google على اكتشاف العناوين ولا تضمن وحدها الفهرسة.

## مراجعة المقالات والبحث الداخلي — 14 أغسطس 2026

| القرار | سبب التطبيق | المصدر الرسمي |
| --- | --- | --- |
| يبقى وسم `meta keywords` في الصفحة الرئيسية بخمس عبارات مطلوبة من أداة المراجعة، لكنه ليس وسيلة ترتيب في Google. | Google يوضح أنه يتجاهل هذا الوسم في ترتيب بحث الويب؛ لذلك تركز الصفحات أيضًا على العنوان والوصف والمحتوى والروابط المفهومة. | [Google: meta keywords](https://developers.google.com/search/blog/2009/09/google-does-not-use-keywords-meta-tag) |
| يعتمد بحث المقالات على تصفية فورية في الواجهة، لكن تبقى روابط كل المقالات روابط نصية قابلة للنقر داخل المكتبة وخريطة الموقع. | برامج الزحف لا تعتمد عادةً على إدخال البحث في الموقع؛ وتساعد الروابط الوصفية المتاحة للمستخدم في اكتشاف الصفحات وفهم سياقها. | [Google: link architecture](https://developers.google.com/search/blog/2008/10/importance-of-link-architecture) |
| يضاف `BlogPosting` منظم لكل مقالة بما يتفق مع عنوانها ووصفها وكلماتها وروابطها، مع ناشر من نوع Organization وشعار الشركة. | يوصي دليل Google ببيانات Article التي تصف المحتوى الفعلي وتضيف خصائص موصى بها ذات صلة، ثم اختبارها قبل طلب إعادة الزحف. | [Google: Article structured data](https://developers.google.com/search/docs/appearance/structured-data/article) |

> لا يضمن أي وسم أو ملف أن تظهر الصفحة في ترتيب أو وقت محدد. بعد النشر، يبقى فحص الرابط وإرسال خريطة الموقع من Google Search Console خطوة المتابعة السليمة.
