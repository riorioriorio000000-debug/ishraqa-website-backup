import { articleShareImages } from "./articleShareImages";
import { getLocalServiceMediaAlt, getLocalServiceMediaImage } from "./serviceMedia";

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
  readonly imageAlt: string;
  readonly serviceSteps: readonly { readonly title: string; readonly text: string }[];
  readonly cityTips: readonly string[];
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
  readonly extraFaq?: readonly { readonly question: string; readonly answer: string }[];
};

const cities: readonly CityProfile[] = [
  { name: "الرياض", slug: "riyadh", neighbourhoods: ["الملز", "النخيل", "الياسمين", "الروضة"], detail: "تمتد أحياء الرياض على مسافات متفاوتة، وقد يختلف ترتيب الوصول بين شقة داخل مجمع وبيت مستقل أو مبنى متعدد الطوابق. اذكر الحي والطابق ووجود مصعد أو بوابة في الرسالة الأولى، ثم حدد الغرف أو النقاط ذات الأولوية. هذه التفاصيل تساعد على جعل المراجعة الأولية واقعية، بدل الاعتماد على وصف عام أو توقع غير مؤكد عن مدة الزيارة." },
  { name: "جدة", slug: "jeddah", neighbourhoods: ["الصفا", "الروضة", "الحمراء", "أبحر الشمالية"], detail: "في جدة قد تختلف احتياجات المنزل بين الشقق والفلل القريبة من الواجهة أو الأحياء الداخلية، كما يختلف التنسيق بحسب مداخل المبنى ومواقف المركبات. يفيد أن تذكر نوع المسكن، وحالة المكان، وما إذا كان الوصول يحتاج تنسيقًا مع إدارة المبنى. وإذا كان الطلب يركز على غرفة أو سطح أو قطعة محددة، فاجمع هذه المعلومة مع وصف موجز للحالة في رسالة واحدة." },
  { name: "مكة المكرمة", slug: "makkah", neighbourhoods: ["العزيزية", "العوالي", "الشرائع", "الزاهر"], detail: "تحتاج طلبات الخدمة في مكة المكرمة إلى رسالة مرتبة تذكر الحي ووقت التواصل الأنسب، خصوصًا عندما تتغير الحركة أو توجد ترتيبات دخول للمبنى. يساعد ذكر نوع العقار والطابق ووسيلة الدخول على فهم احتياج المكان قبل اقتراح الخطوة التالية. لا يحتاج العميل إلى مشاركة بيانات دقيقة في الصفحة؛ يكفي وصف عام ثم استكمال التفاصيل اللازمة عبر واتساب عند ترتيب الخدمة." },
  { name: "المدينة المنورة", slug: "madinah", neighbourhoods: ["العزيزية", "قباء", "العوالي", "شوران"], detail: "يساعد تحديد موقع المنزل بشكل عام في المدينة، وطبيعة المداخل أو المصعد، على جعل المراجعة الأولية أكثر دقة وهدوءًا قبل الاتفاق على الخطوة التالية." },
  { name: "الدمام", slug: "dammam", neighbourhoods: ["الشاطئ", "الفيصلية", "الجامعيين", "الضباب"], detail: "تتطلب المساكن والمنشآت في الدمام وصفًا واضحًا للمساحة وأولوية العمل، خاصة عندما يكون الطلب مرتبطًا بتجهيز منزل أو معالجة نقطة محددة في أكثر من غرفة. اذكر ما إذا كان المكان شقة أو منزلًا أو مكتبًا، وهل توجد مداخل أو بوابات أو أوقات يفضّل تجنبها. وضع الأولويات في البداية يجعل المحادثة أقصر وأكثر وضوحًا من إرسال تفاصيل متفرقة بعد بدء التنسيق." },
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
  { name: "إبادة الحشرات", slug: "pest-control", searchTerm: "مكافحة حشرات", detail: "يبدأ طلب مكافحة الحشرات بوصف النوع أو الأثر الظاهر ومكانه وتكراره، لا بوعود مثل «رش بلا رائحة» قبل تقييم مناسب. يختلف المسار بين ملاحظة في المطبخ أو دورة المياه أو المخزن أو حول فتحات الخدمة، كما تختلف الاحتياطات حسب طبيعة المكان ووجود أطفال أو حيوانات أليفة. يساعد الوصف الدقيق للموقع، ووقت ظهور الملاحظة، وأي إجراء اتُخذ سابقًا على فهم السياق بدل اقتراح حل عام قبل معرفة التفاصيل.", preparation: "حدد الغرف أو الزوايا التي ظهرت فيها الملاحظة، وأخبر فريق التنسيق بوجود أطفال أو حيوانات أليفة أو أشخاص لديهم حساسية تجاه الروائح. لا تخلط مبيدات أو تستخدم مادة غير معروفة قبل فهم التعليمات. أبعد الأطعمة والأواني المكشوفة عن المنطقة المستهدفة، واترك مساحة جيدة التهوية حول نقطة العمل، ولا تفتح عبوات أو فتحات يصعب التعامل معها بأمان.", extraFaq: [{ question: "هل أستخدم مبيدًا منزليًا قبل التواصل؟", answer: "الأفضل وصف ما ظهر أولًا وذكر أي مادة استُخدمت سابقًا. خلط المنتجات أو استخدامها في أماكن مغلقة من دون فهم تعليماتها قد يصعّب تقييم الحالة، خاصة مع وجود أطفال أو حيوانات أليفة." }, { question: "ما المعلومات المفيدة عند إرسال صور للملاحظة؟", answer: "أرسل صورة واضحة للمكان أو الأثر فقط إذا كان ذلك آمنًا ولا يكشف خصوصية المنزل، واذكر الغرفة ووقت ظهور الملاحظة وما إذا كانت تتكرر. لا يحتاج فريق التنسيق إلى صور شخصية أو معلومات حساسة." }] },
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

function getServiceSteps(service: ServiceProfile) {
  if (service.slug === "pest-control") {
    return [
      { title: "حدد مكان الملاحظة", text: "اكتب الغرفة أو الزاوية التي ظهر فيها الأثر، وما إذا كان يتكرر في وقت أو مكان محدد داخل المنزل." },
      { title: "اذكر الاحتياطات المهمة", text: "أخبر فريق التنسيق عن وجود أطفال أو حيوانات أليفة أو مواد استُخدمت سابقًا، حتى لا تُعامل الحالة كوصف عام." },
      { title: "جهّز المنطقة بهدوء", text: "أبعد الطعام والأواني المكشوفة واترك مساحة حول النقطة المستهدفة، ثم راجع التعليمات الخاصة بالمكان قبل أي خطوة." },
    ] as const;
  }
  return [
    { title: "صف ما تحتاجه", text: `ابدأ بتحديد المساحة أو القطعة أو الملاحظة التي تريد ترتيبها ضمن خدمة ${service.name}.` },
    { title: "اذكر ما يؤثر في الوصول", text: "يفيد ذكر نوع المكان والطابق ووجود مصعد أو بوابة وأي وقت لا يناسب الزيارة أو التواصل." },
    { title: "ثبّت الأولويات عبر رسالة واحدة", text: "اجمع النقاط الأساسية مع التحضير البسيط حتى يمكن مراجعة الطلب قبل تثبيت توقعات عن الموعد أو المدة أو النتيجة." },
  ] as const;
}

function getCityTips(city: CityProfile) {
  const [firstNeighbourhood, secondNeighbourhood] = city.neighbourhoods;
  return [
    `اذكر الحي بصورة عامة، مثل ${firstNeighbourhood} أو ${secondNeighbourhood}، مع نوع العقار بدلاً من مشاركة عنوان كامل داخل الصفحة.`,
    "وضح إن كان الوصول يحتاج بوابة أو مصعدًا أو تنسيقًا مع إدارة المبنى، ثم اترك التفاصيل الدقيقة للتواصل المباشر عند الحاجة.",
    "حدّد النقاط الأكثر أهمية في البداية، لأن ذلك يساعد على ترتيب المحادثة دون وعد مسبق بتوفر أو موعد أو نتيجة.",
  ] as const;
}

export const localServicePages: readonly LocalServicePage[] = services.flatMap((service) => cities.map((city) => {
  const title = buildTitle(service, city);
  const description = buildDescription(service, city);
  const image = getLocalServiceMediaImage(service.slug) ?? articleShareImages[`${city.slug}-service-guide`] ?? "/ishraqa-website-backup/media/sofa.jpg";
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
    image,
    imageAlt: getLocalServiceMediaAlt(service.slug) ?? `رسم توضيحي لخدمة ${service.name} في ${city.name} دون أشخاص`,
    serviceSteps: getServiceSteps(service),
    cityTips: getCityTips(city),
    faq: [
      { question: `كيف أرتب طلب ${service.name} في ${city.name}؟`, answer: `ابدأ برسالة تتضمن الحي بصورة عامة، ونوع المكان، والمساحات أو النقاط ذات الأولوية، والوقت المناسب للتواصل. تُراجع الإمكانات بعد معرفة التفاصيل، ولا يعني ذكر المدينة تأكيد توفر أو موعد تلقائي.` },
      { question: `هل تخدمون جميع أحياء ${city.name}؟`, answer: `اذكر الحي وطريقة الوصول عند التواصل. يُراجع نطاق الخدمة وإمكانية الوصول بحسب الطلب والوقت والموقع؛ لذلك لا ينشر الموقع وعدًا عامًا قبل التحقق من التفاصيل الفعلية.` },
      { question: `ما الذي أجهزه قبل ${service.name}؟`, answer: service.preparation },
      ...(service.extraFaq ?? []),
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
