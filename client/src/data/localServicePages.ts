import { articleShareImages } from "@/data/articleShareImages";

export type LocalServicePage = {
  readonly serviceSlug: string;
  readonly citySlug: string;
  readonly serviceName: string;
  readonly cityName: string;
  readonly title: string;
  readonly description: string;
  readonly keywords: readonly string[];
  readonly neighbourhoods: readonly string[];
  readonly cityDetail: string;
  readonly serviceDetail: string;
  readonly preparation: string;
  readonly image: string;
  readonly faq: readonly { readonly question: string; readonly answer: string }[];
};

type CityProfile = {
  readonly name: string;
  readonly slug: string;
  readonly neighbourhoods: readonly string[];
  readonly detail: string;
};

type ServiceProfile = {
  readonly name: string;
  readonly slug: string;
  readonly searchTerm: string;
  readonly detail: string;
  readonly preparation: string;
};

const cities: readonly CityProfile[] = [
  { name: "الرياض", slug: "riyadh", neighbourhoods: ["الملز", "النخيل", "الياسمين", "الروضة"], detail: "تمتد أحياء الرياض على مسافات متفاوتة، لذلك يفيد ذكر الحي والطابق ووسيلة الدخول منذ الرسالة الأولى. يساعد ذلك على ترتيب التواصل وفق واقع المكان بدل الاعتماد على وصف عام." },
  { name: "جدة", slug: "jeddah", neighbourhoods: ["الصفا", "الروضة", "الحمراء", "أبحر الشمالية"], detail: "في جدة قد تختلف احتياجات المنزل بين الشقق والفلل القريبة من الواجهة أو الأحياء الداخلية؛ اذكر نوع المسكن وحالة المكان وما إذا كان الوصول يحتاج تنسيقًا مع إدارة المبنى." },
  { name: "مكة المكرمة", slug: "makkah", neighbourhoods: ["العزيزية", "العوالي", "الشرائع", "الزاهر"], detail: "تحتاج طلبات الخدمة في مكة إلى رسالة مرتبة تذكر الحي ووقت الزيارة الأنسب، خصوصًا في الأيام التي تزدحم فيها الحركة أو توجد فيها ترتيبات دخول للمبنى." },
  { name: "المدينة المنورة", slug: "madinah", neighbourhoods: ["العزيزية", "قباء", "العوالي", "شوران"], detail: "يساعد تحديد موقع المنزل بشكل عام في المدينة، وطبيعة المداخل أو المصعد، على جعل المراجعة الأولية أكثر دقة وهدوءًا قبل الاتفاق على الخطوة التالية." },
  { name: "الدمام", slug: "dammam", neighbourhoods: ["الشاطئ", "الفيصلية", "الجامعيين", "الضباب"], detail: "تتطلب المساكن والمنشآت في الدمام وصفًا واضحًا للمساحة وأولوية العمل، خاصة عندما يكون الطلب مرتبطًا بتجهيز منزل أو معالجة نقطة محددة في أكثر من غرفة." },
  { name: "الخبر", slug: "khobar", neighbourhoods: ["العليا", "العقربية", "الحزام الذهبي", "الراكة"], detail: "في الخبر من المفيد ذكر نوع العقار والحي ووجود بوابة أو مصعد؛ هذه التفاصيل تبني تنسيقًا عمليًا للخدمة وتقلل الاستفسارات المتفرقة قبل الزيارة." },
  { name: "تبوك", slug: "tabuk", neighbourhoods: ["الورود", "المصيف", "الريان", "النهضة"], detail: "يساعد وصف حالة المكان في تبوك، مثل عدد الغرف أو موضع الملاحظة، على ترتيب الاحتياج بصورة واقعية بدل افتراض مدة أو نتيجة قبل مراجعة التفاصيل." },
  { name: "أبها", slug: "abha", neighbourhoods: ["المنهل", "المحالة", "شمسان", "الضباب"], detail: "تختلف المداخل وطبيعة المباني في أبها، ولهذا من الأفضل توضيح الطريق المناسب والحي وأي تعليمات وصول أو ظروف خاصة بالمكان ضمن رسالة واحدة مختصرة." },
  { name: "خميس مشيط", slug: "khamis-mushait", neighbourhoods: ["الراقي", "الواحة", "الخالدية", "الربوة"], detail: "في خميس مشيط تبدأ الخدمة المنظمة من توضيح نوع المكان وأولوياته؛ هذا يتيح مراجعة الطلب دون وعود ثابتة قبل معرفة تفاصيل الوصول والحالة." },
  { name: "بريدة", slug: "buraydah", neighbourhoods: ["الريان", "النهضة", "الصفاء", "الفايزية"], detail: "يسهّل تحديد الحي وطبيعة المنزل في بريدة تنسيق الأعمال التي تشمل أكثر من مساحة، ويجعل الرسالة الأولى أقرب إلى قائمة عمل مفهومة للفريق." },
  { name: "حائل", slug: "hail", neighbourhoods: ["النقرة", "المنتزه الغربي", "الوسيطاء", "الزهراء"], detail: "عند طلب خدمة في حائل، ابدأ بذكر ما تريد إنجازه فعليًا والمساحات ذات الأولوية؛ فالوضوح حول الموقع والحالة أهم من استعجال تقدير غير مكتمل." },
  { name: "الطائف", slug: "taif", neighbourhoods: ["الشهار", "الحوية", "الوسام", "الفيصلية"], detail: "تساعد معرفة الحي وطريقة الدخول في الطائف على مراجعة الطلب بشكل مناسب؛ ضع في الرسالة تفاصيل المكان الأساسية وأي وقت لا يناسب الوصول أو التواصل." },
  { name: "جازان", slug: "jazan", neighbourhoods: ["السويس", "الروضة", "الشاطئ", "الصفا"], detail: "في جازان، اجمع وصفًا موجزًا للمكان والحي والنقطة المطلوبة قبل فتح واتساب، حتى يمكن متابعة احتياجك عبر معلومات واضحة بدل رسائل متفرقة." },
  { name: "نجران", slug: "najran", neighbourhoods: ["الفيصلية", "الفلل", "العريسة", "الأمير مشعل"], detail: "يفيد ترتيب معلومات الطلب في نجران، من نوع العقار إلى الأولويات وطريقة الوصول، في تحويل الحاجة العامة إلى خطوة يمكن مناقشتها بوضوح مع فريق التنسيق." },
];

const services: readonly ServiceProfile[] = [
  { name: "تنظيف المنازل", slug: "home-cleaning", searchTerm: "تنظيف منازل", detail: "يركز تنظيف المنازل على المساحات التي تحددها أنت، مثل المطبخ ودورات المياه والاستقبال. اذكر الأسطح الحساسة أو المناطق التي تحتاج اهتمامًا أولًا حتى يكون الحوار دقيقًا من البداية.", preparation: "أبعد الأوراق والأدوية والأشياء الشخصية الصغيرة، واكتب الغرف أو الزوايا ذات الأولوية. لا يلزم تجهيز المنزل بالكامل؛ المطلوب فقط توضيح ما لا ترغب في تحريكه أو لمسه." },
  { name: "تنظيف الكنب والمجالس", slug: "sofa-cleaning", searchTerm: "تنظيف كنب ومجالس", detail: "تحتاج الأقمشة والمجالس إلى وصف نوع البقعة أو الاستخدام ومدة ظهور الملاحظة، لأن طريقة العناية تختلف باختلاف القماش وحالة القطعة. تجنب تجربة خلطات غير معروفة قبل شرح الحالة.", preparation: "صوّر القطعة من زاوية توضح موضع البقعة عند الحاجة، وأخبر فريق التنسيق عن نوع القماش أو أي مادة استُخدمت سابقًا. أبعد المخدات الشخصية والقطع القابلة للكسر من المنطقة." },
  { name: "تنظيف الخزانات", slug: "tank-cleaning", searchTerm: "تنظيف خزانات", detail: "تنظيف الخزانات يبدأ بتحديد نوع الخزان وموقعه وسهولة الوصول إليه، مع الانتباه إلى تعليمات السلامة وعدم فتح نقاط لا تعرف طبيعتها. لا يقدم الموقع حكمًا فنيًا قبل مراجعة الحالة.", preparation: "اذكر موقع الخزان وطريقة الوصول العامة وأي ملاحظة ظهرت، ولا تفتح أغطية أو وصلات مجهولة. جهّز مساحة آمنة حول مكان العمل وأبعد الأطفال والحيوانات الأليفة." },
  { name: "الصيانة المنزلية", slug: "home-maintenance", searchTerm: "صيانة منزلية", detail: "تشمل الصيانة المنزلية وصفًا محددًا للملاحظة: أين تظهر، ومتى بدأت، وما الذي يتغير معها. هذا يفرّق بين طلب عام وبين مشكلة يمكن مناقشة مسارها بطريقة مسؤولة.", preparation: "اكتب ما تراه أو تسمعه بصورة مباشرة، مثل تسرب أو مفتاح لا يعمل أو نقطة تحتاج فحصًا. لا تفك أجزاء كهربائية أو سباكة داخلية إذا لم تكن مؤهلًا لذلك." },
  { name: "صيانة التكييفات", slug: "ac-maintenance", searchTerm: "صيانة تكييف", detail: "في طلبات التكييف، تساعد معلومة نوع الجهاز والمكان ووقت ظهور الملاحظة على فهم السياق. لا تتجاهل رائحة احتراق أو صوتًا غير معتاد، ولا تحاول إصلاح الأجزاء الداخلية بنفسك.", preparation: "دوّن ما إذا كان التبريد تغير أو ظهر صوت أو تسريب، واذكر عدد الوحدات والمناطق المهمة. أزل العوائق البسيطة حول الوحدة الداخلية فقط من دون لمس التوصيلات." },
  { name: "نقل العفش والفك والتركيب", slug: "furniture-moving", searchTerm: "نقل عفش مع الفك والتركيب", detail: "نقل العفش يحتاج قائمة مختصرة بالقطع الكبيرة والمداخل والمصعد والطابق، لأن كل تفصيل يؤثر في ترتيب الحركة والتغليف. احفظ الوثائق والمجوهرات والأدوية بعيدًا عن الصناديق العامة.", preparation: "اكتب القطع التي تحتاج عناية خاصة، وصوّر الممرات أو الدرج عند الحاجة، وراجع موقف التحميل وإجراءات البوابة. لا تضع أغراضًا شخصية مهمة داخل كراتين النقل." },
  { name: "إبادة الحشرات", slug: "pest-control", searchTerm: "مكافحة حشرات", detail: "يبدأ طلب مكافحة الحشرات بوصف النوع أو الأثر الظاهر ومكانه وتكراره، لا بوعود مثل «رش بلا رائحة» قبل تقييم مناسب. تختلف الاحتياطات حسب المكان ووجود أطفال أو حيوانات أليفة.", preparation: "حدد الغرف أو الزوايا التي ظهرت فيها الملاحظة، وأخبر فريق التنسيق بوجود أطفال أو حيوانات أليفة. لا تخلط مبيدات أو تستخدم مادة غير معروفة قبل فهم التعليمات." },
  { name: "عزل الأسطح والخزانات", slug: "insulation", searchTerm: "عزل أسطح وخزانات", detail: "تحتاج أعمال العزل إلى معلومات عن موضع السطح أو الخزان ونوع الملاحظة مثل رطوبة أو أثر تسرب، مع الانتباه إلى أن الفحص وتحديد الحل يتطلبان معرفة ميدانية مناسبة.", preparation: "اذكر موضع الأثر وتاريخه التقريبي، وصوّر المنطقة إن كانت الصورة آمنة ولا تكشف معلومات خاصة. لا تصعد إلى سطح غير آمن أو تحاول اختبار التوصيلات بنفسك." },
  { name: "الدهانات", slug: "painting", searchTerm: "دهانات منازل", detail: "في الدهانات، اذكر الغرف والمساحة التقريبية وحالة الجدران والألوان المطلوبة إن وجدت. الوضوح حول التشققات أو الرطوبة يساعد على تجنب افتراض أن الدهان وحده يعالج سببًا يحتاج فحصًا.", preparation: "أزل اللوحات والقطع القريبة من الجدران قدر الإمكان، وحدد اللون أو النتيجة التي تتخيلها. اذكر أي رطوبة أو تقشر بدل تغطيته قبل مراجعته." },
];

export function getLocalServicePagePath(serviceSlug: string, citySlug: string) {
  return `/services/${serviceSlug}/${citySlug}`;
}

function buildTitle(service: ServiceProfile, city: CityProfile) {
  return `${service.searchTerm} في ${city.name} | شركة الإشراقة`;
}

function buildDescription(service: ServiceProfile, city: CityProfile) {
  return `تعرّف إلى خدمة ${service.searchTerm} في ${city.name} من شركة الإشراقة، مع إرشادات للطلب وأسئلة عن الحي وتجهيز المكان والتنسيق عبر واتساب.`;
}

export const localServicePages: readonly LocalServicePage[] = services.flatMap((service) => cities.map((city) => {
  const title = buildTitle(service, city);
  const description = buildDescription(service, city);
  return {
    serviceSlug: service.slug,
    citySlug: city.slug,
    serviceName: service.name,
    cityName: city.name,
    title,
    description,
    keywords: [service.searchTerm, `${service.searchTerm} ${city.name}`, `شركة ${service.searchTerm} ${city.name}`, ...city.neighbourhoods.map((neighbourhood) => `${service.searchTerm} ${neighbourhood}`), "شركة الإشراقة"],
    neighbourhoods: city.neighbourhoods,
    cityDetail: city.detail,
    serviceDetail: service.detail,
    preparation: service.preparation,
    image: articleShareImages[`${city.slug}-service-guide`] ?? "/manus-storage/ishraqa-home-open-graph_7b7b6db0.jpg",
    faq: [
      { question: `كيف أرتب طلب ${service.name} في ${city.name}؟`, answer: `ابدأ برسالة تتضمن الحي بصورة عامة، ونوع المكان، والمساحات أو النقاط ذات الأولوية، والوقت المناسب للتواصل. تُراجع الإمكانات بعد معرفة التفاصيل، ولا يعني ذكر المدينة تأكيد توفر أو موعد تلقائي.` },
      { question: `هل تخدمون جميع أحياء ${city.name}؟`, answer: `اذكر الحي وطريقة الوصول عند التواصل. يُراجع نطاق الخدمة وإمكانية الوصول بحسب الطلب والوقت والموقع؛ لذلك لا ينشر الموقع وعدًا عامًا قبل التحقق من التفاصيل الفعلية.` },
      { question: `ما الذي أجهزه قبل ${service.name}؟`, answer: service.preparation },
    ],
  };
}));

export const localServiceSlugAliases: Readonly<Record<string, string>> = {
  cleaning: "home-cleaning",
};

export function resolveLocalServiceSlug(serviceSlug: string | undefined) {
  return serviceSlug ? localServiceSlugAliases[serviceSlug] ?? serviceSlug : undefined;
}

export function getLocalServicePage(serviceSlug: string | undefined, citySlug: string | undefined) {
  return localServicePages.find((page) => page.serviceSlug === resolveLocalServiceSlug(serviceSlug) && page.citySlug === citySlug);
}
