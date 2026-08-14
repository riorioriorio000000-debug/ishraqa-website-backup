# ملاحظات بحث SEO — Google Search Central

تمت مراجعة مصادر Google الرسمية في 14 أغسطس 2026 لتوجيه تحسينات الموقع. لا يوجد إجراء تقني يضمن الفهرسة أو المركز الأول؛ فالمطلوب هو تسهيل الزحف والفهم وتقديم محتوى أصلي مفيد.

| المحور | التطبيق في موقع الإشراقة | المصدر الرسمي |
| --- | --- | --- |
| قابلية الاكتشاف | إبقاء الروابط الداخلية مفهومة وإضافة الصفحات المهمة إلى خريطة الموقع. خريطة الموقع تساعد على اكتشاف الروابط لكنها لا تضمن زحفها أو فهرستها. | [Google: Learn about sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview) |
| نشاط محلي | استخدام JSON-LD من نوع `LocalBusiness` بمعلومات مطابقة لما يظهر للزائر، ثم اختباره في Rich Results Test وفحص الرابط عبر Search Console. | [Google: LocalBusiness structured data](https://developers.google.com/search/docs/appearance/structured-data/local-business) |
| الصور | استخدام عناصر `<img>` بسمات `alt` وصفية ومتصلة بسياق الصفحة، وأصول متجاوبة مع `src` احتياطي، وعدم حشو الكلمات المفتاحية في البدائل. | [Google: Image SEO best practices](https://developers.google.com/search/docs/appearance/google-images) |
| المحتوى | كتابة محتوى أصلي ومفيد ومنظم بعناوين وفقرات وروابط داخلية منطقية، وتجنب الصفحات المتكررة أو حشو الكلمات المفتاحية. | [Google: SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide) |
| المتابعة | بعد النشر يُقدَّم الموقع وملف sitemap في Google Search Console، ثم يُتابَع تقرير الفهرسة وURL Inspection. قد ينعكس الأثر خلال أسابيع أو أشهر، وليس فورًا. | [Google: SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide) |

## قرارات تنفيذية

- ستُنشأ مقالات المدن كصفحات ذات قيمة فعلية ومختلفة، لا قوالب متطابقة باسم المدينة.
- لن تُضاف تقييمات أو مراجعات مصطنعة إلى البيانات المنظمة أو الواجهة.
- ستُحدَّث الوسوم، الروابط الأساسية، `robots.txt`، `sitemap.xml`، ملف PWA، وبدائل الصور، ثم تُفحص صفحات النشر قبل طلب الفهرسة.
