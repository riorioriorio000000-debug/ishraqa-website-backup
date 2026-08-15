# بيان الاستعادة للأصول

هذا البيان يرافق نسخة المراجعة المحدثة ويبيّن الأصول التي تعتمد عليها الواجهة. توجد النسخ المصدرية داخل الأرشيف تحت `webdev-static-assets/ishraqa/`، وتوجد النسخ المتجاوبة الأخف تحت `webdev-static-assets/ishraqa-responsive/`. تعمل النسخة المنشورة من خلال المسارات أدناه.

| الأصل المنشور | النسخة المصدرية في الأرشيف | الاستخدام |
|---|---|---|
| `/manus-storage/ad-home-cleaning_8b448cef.mp4` | `ad-home-cleaning.mp4` | إعلان تنظيف المنزل |
| `/manus-storage/ad-maintenance_ab0928ad.mp4` | `ad-maintenance.mp4` | إعلان الصيانة |
| `/manus-storage/ad-moving_5126576b.mp4` | `ad-moving.mp4` | إعلان نقل العفش |
| `/manus-storage/ai-loading_4a219f05.gif` | `ai-loading.gif` | مؤشر انتظار المساعد |
| `/manus-storage/brand-mark-generated_b4592103.png` | `brand-mark-generated.png` | أصل العلامة البديل |
| `/manus-storage/cleaning-spark-transparent_91163e0d.png` | `cleaning-spark-transparent.png` | رسم خدمة التنظيف |
| `/manus-storage/hero-care-generated_fcbc94c2.jpg` | `hero-care-generated.jpg` | صورة البطل الرئيسية |
| `/manus-storage/ishraqa-calculator-background_0832e013.webp` | `ishraqa-calculator-background.webp` | خلفية الحاسبة |
| `/manus-storage/ishraqa-original-logo_5e61c480.png` | `ishraqa-original-logo.png` | شعار المستخدم المعتمد |
| `/manus-storage/maintenance-tools-transparent_75e7c68e.png` | `maintenance-tools-transparent.png` | رسم الصيانة |
| `/manus-storage/map-reference_99f2fe20.png` | `map-reference.png` | خريطة نطاق الخدمة |
| `/manus-storage/moving-box-transparent_9c5b10ea.png` | `moving-box-transparent.png` | رسم نقل العفش |

## النسخ المتجاوبة

تستخدم الصفحة الرئيسية وصفحات المقالات نسخًا أصغر من الرسومات الشفافة عبر `srcSet` و`sizes`، مع تحميل كسول وفك ترميز غير متزامن للصور غير الحرجة. تحفظ ملفات المصدر والتوليد داخل `webdev-static-assets/ishraqa-responsive/` ولا توضع داخل مجلد المشروع حتى لا تؤثر في زمن النشر.

## البيانات وقاعدة البيانات

يشمل الأرشيف مخطط Drizzle اللازم لإنشاء جداول `site_metrics` و`visitor_feedback` عند الاستعادة ضمن مشروع مؤهل. لا يشمل الأرشيف سجلات قاعدة البيانات الحية أو بيانات الحسابات أو التقييمات المعلّقة، لأن تلك البيانات قد تحتوي معلومات خاصة. تظل هذه البيانات ضمن قاعدة بيانات مشروع Manus الحالي، وتستلزم أي عملية تصدير مستقلة موافقة المالك وإجراءً إداريًا مقيدًا بالصلاحيات.
