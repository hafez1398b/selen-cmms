// Image AI Analysis — Google Lens-like
// Uses image-pixel heuristics + domain knowledge for industrial equipment diagnosis

export interface ImageAnalysisResult {
  category: 'equipment' | 'damage' | 'leak' | 'corrosion' | 'overheating' | 'wear' | 'unknown';
  categoryLabel: string;
  confidence: number;
  observations: string[];
  diagnoses: string[];
  recommendations: string[];
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  colors: { dominant: string; rgb: [number, number, number] }[];
  brightness: number;
  estimatedComponents: string[];
}

// Get dominant colors and brightness from canvas
async function analyzeImagePixels(imageUrl: string): Promise<{
  dominant: [number, number, number][];
  brightness: number;
  rustRatio: number; // brownish/orange pixels
  blackRatio: number; // dark pixels (oil/burn)
  whiteRatio: number;
  redRatio: number;
}> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const size = 80; // downsample for performance
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, size, size);
      const data = ctx.getImageData(0, 0, size, size).data;

      // Color buckets
      const buckets: Map<string, number> = new Map();
      let totalBrightness = 0;
      let rustCount = 0, blackCount = 0, whiteCount = 0, redCount = 0;
      const totalPixels = size * size;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        const brightness = (r + g + b) / 3;
        totalBrightness += brightness;

        // Color classification
        if (r > 100 && g > 50 && g < 130 && b < 80 && r > b + 30) rustCount++; // rust/orange
        if (brightness < 40) blackCount++; // very dark (oil/burn/shadow)
        if (brightness > 215) whiteCount++; // very bright
        if (r > 150 && g < 100 && b < 100) redCount++; // red (alarm, paint, blood)

        // Bucket dominant colors (quantize to 5 levels per channel)
        const qR = Math.floor(r / 51) * 51;
        const qG = Math.floor(g / 51) * 51;
        const qB = Math.floor(b / 51) * 51;
        const key = `${qR},${qG},${qB}`;
        buckets.set(key, (buckets.get(key) ?? 0) + 1);
      }

      const sorted = Array.from(buckets.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
      const dominant = sorted.map(([k]) => k.split(',').map(Number) as [number, number, number]);

      resolve({
        dominant,
        brightness: totalBrightness / totalPixels,
        rustRatio: rustCount / totalPixels,
        blackRatio: blackCount / totalPixels,
        whiteRatio: whiteCount / totalPixels,
        redRatio: redCount / totalPixels,
      });
    };
    img.onerror = () => resolve({
      dominant: [[128, 128, 128]],
      brightness: 128,
      rustRatio: 0, blackRatio: 0, whiteRatio: 0, redRatio: 0,
    });
    img.src = imageUrl;
  });
}

// Color name in Persian
function colorName(rgb: [number, number, number]): string {
  const [r, g, b] = rgb;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const brightness = (r + g + b) / 3;

  if (brightness < 30) return 'سیاه';
  if (brightness > 220) return 'سفید';
  if (max - min < 25) {
    if (brightness < 80) return 'خاکستری تیره';
    if (brightness > 180) return 'خاکستری روشن';
    return 'خاکستری';
  }
  if (r > g + 30 && r > b + 30) {
    if (g > 80) return 'نارنجی/زنگ‌زدگی';
    return 'قرمز';
  }
  if (g > r + 20 && g > b + 20) return 'سبز';
  if (b > r + 20 && b > g + 20) return 'آبی';
  if (r > 150 && g > 130 && b < 100) return 'زرد/طلایی';
  if (r > 100 && g > 60 && b < 80) return 'قهوه‌ای';
  return 'مخلوط';
}

const KNOWLEDGE_BASE: Record<string, { observations: string[]; diagnoses: string[]; recommendations: string[] }> = {
  rust: {
    observations: ['نواحی نارنجی/قهوه‌ای روی سطح فلز قابل مشاهده است', 'احتمالاً زنگ‌زدگی یا اکسیداسیون فلز'],
    diagnoses: [
      'فرسایش الکتروشیمیایی فلز در اثر رطوبت و اکسیژن',
      'احتمال نشتی آب یا تعریق در محیط کار',
      'عدم اعمال پوشش محافظ یا فرسودگی رنگ',
    ],
    recommendations: [
      'پاکسازی سطح با برس سیمی یا سندبلاست',
      'اعمال پرایمر ضدزنگ و سپس رنگ روغنی',
      'بررسی منبع رطوبت و رفع آن',
      'اضافه کردن این تجهیز به برنامه بازرسی دوره‌ای',
    ],
  },
  leak: {
    observations: ['نواحی تیره و چرب روی سطح', 'احتمال نشتی مایع (روغن یا آب)'],
    diagnoses: [
      'فرسودگی آب‌بند مکانیکی یا گلند',
      'ترک خوردگی اتصالات لوله یا فلنج',
      'فرسایش اورینگ‌ها در اثر دما یا فشار بالا',
    ],
    recommendations: [
      'شناسایی دقیق محل نشتی با تمیزکاری و رنگ نشت‌یاب',
      'تعویض آب‌بند یا اورینگ مشکوک',
      'بررسی گشتاور اتصالات (طبق مشخصات سازنده)',
      'ثبت دستور کار اصلاحی فوری و ایزوله کردن تجهیز',
    ],
  },
  burn: {
    observations: ['نواحی بسیار تیره / سوختگی روی سطح', 'احتمال overheating یا قوس الکتریکی'],
    diagnoses: [
      'گرم شدن بیش از حد سیم‌پیچ یا اتصال الکتریکی',
      'قوس الکتریکی در کنتاکت‌ها',
      'اصطکاک بیش از حد در یاتاقان (در صورت سوختگی محل یاتاقان)',
    ],
    recommendations: [
      'قطع برق فوری و ایزوله کردن تجهیز (LOTO)',
      'اندازه‌گیری مقاومت عایقی (Megger Test)',
      'بازرسی کنتاکت‌ها و تعویض در صورت آسیب',
      'بررسی بار الکتریکی و عدم تعادل فاز',
      'ترموگرافی دوره‌ای برای تشخیص زودهنگام',
    ],
  },
  damage: {
    observations: ['آسیب فیزیکی یا ترک‌خوردگی روی سطح'],
    diagnoses: [
      'ضربه مکانیکی یا برخورد',
      'خستگی فلز در اثر تنش‌های مکرر',
      'تنش حرارتی در اثر گرم/سرد شدن مکرر',
    ],
    recommendations: [
      'بازرسی دقیق با ذره‌بین یا روش غیرمخرب (NDT)',
      'تعمیر یا تعویض قطعه آسیب‌دیده',
      'بررسی علت ریشه‌ای آسیب و رفع آن',
      'تحلیل تنش و طراحی مجدد در صورت تکرار',
    ],
  },
  normal: {
    observations: ['تجهیز در ظاهر سالم و در وضعیت طبیعی است'],
    diagnoses: ['هیچ نشانه آشکار از خرابی یا فرسایش مشاهده نمی‌شود'],
    recommendations: [
      'ادامه بازرسی‌های دوره‌ای طبق برنامه PM',
      'ثبت تصویر در پرونده تجهیز برای مقایسه آینده',
      'بررسی پارامترهای عملکرد (دما، فشار، لرزش)',
    ],
  },
  electrical: {
    observations: ['تجهیزات الکتریکی شناسایی شد (کابل، تابلو، کنتاکتور)'],
    diagnoses: [
      'بررسی کیفیت اتصالات و سفتی پیچ‌ها',
      'احتمال شل بودن ترمینال یا اکسیداسیون',
    ],
    recommendations: [
      'انجام ترموگرافی برای تشخیص نقاط داغ',
      'سفت کردن اتصالات با گشتاور استاندارد',
      'تمیزکاری و بازرسی عایق‌ها',
    ],
  },
};

export async function analyzeImage(imageUrl: string, contextHint?: string): Promise<ImageAnalysisResult> {
  const px = await analyzeImagePixels(imageUrl);

  // Determine category from pixel analysis
  let category: ImageAnalysisResult['category'] = 'equipment';
  let categoryLabel = 'تجهیز عمومی';
  let confidence = 70;
  let severity: ImageAnalysisResult['severity'] = 'info';
  let kb = KNOWLEDGE_BASE.normal;

  if (px.rustRatio > 0.08) {
    category = 'corrosion';
    categoryLabel = 'زنگ‌زدگی / خوردگی';
    confidence = Math.min(95, 60 + px.rustRatio * 200);
    severity = px.rustRatio > 0.2 ? 'high' : 'medium';
    kb = KNOWLEDGE_BASE.rust;
  } else if (px.blackRatio > 0.35 && px.brightness < 90) {
    if (contextHint && /(برق|electric|سیم|panel|کنتاکت)/i.test(contextHint)) {
      category = 'overheating';
      categoryLabel = 'سوختگی / گرمای بیش از حد';
      confidence = 82;
      severity = 'critical';
      kb = KNOWLEDGE_BASE.burn;
    } else {
      category = 'leak';
      categoryLabel = 'نشتی روغن یا مایع';
      confidence = 78;
      severity = 'high';
      kb = KNOWLEDGE_BASE.leak;
    }
  } else if (px.redRatio > 0.05) {
    category = 'damage';
    categoryLabel = 'هشدار / آسیب';
    confidence = 70;
    severity = 'high';
    kb = KNOWLEDGE_BASE.damage;
  } else if (px.brightness < 70) {
    category = 'damage';
    categoryLabel = 'تصویر تاریک — نیاز به نور بهتر';
    confidence = 50;
    severity = 'low';
    kb = KNOWLEDGE_BASE.damage;
  } else {
    category = 'equipment';
    categoryLabel = 'تجهیز در وضعیت عادی';
    confidence = 75;
    severity = 'info';
    kb = KNOWLEDGE_BASE.normal;
  }

  // If context hint provided, blend it
  if (contextHint) {
    const hint = contextHint.toLowerCase();
    if (/(نشتی|leak)/i.test(hint)) { kb = KNOWLEDGE_BASE.leak; categoryLabel = 'نشتی (طبق توضیحات کاربر)'; severity = 'high'; }
    if (/(سوخت|burn|گرم|overheat)/i.test(hint)) { kb = KNOWLEDGE_BASE.burn; categoryLabel = 'سوختگی / گرمای بیش از حد'; severity = 'critical'; }
    if (/(زنگ|rust|خوردگی)/i.test(hint)) { kb = KNOWLEDGE_BASE.rust; categoryLabel = 'زنگ‌زدگی'; severity = 'medium'; }
    if (/(الکتری|electric|برق)/i.test(hint)) { kb = KNOWLEDGE_BASE.electrical; categoryLabel = 'تجهیز الکتریکی'; }
  }

  // Estimate components based on color profile
  const estimatedComponents: string[] = [];
  if (px.dominant.some(c => c[0] < 80 && c[1] < 80 && c[2] < 80)) estimatedComponents.push('سطح فلزی تیره');
  if (px.dominant.some(c => c[0] > 150 && c[1] > 130 && c[2] < 100)) estimatedComponents.push('سطح فلزی روشن (آلومینیم/استیل)');
  if (px.rustRatio > 0.05) estimatedComponents.push('نواحی زنگ‌زده');
  if (px.blackRatio > 0.2) estimatedComponents.push('روغن یا گریس');
  if (px.brightness > 180) estimatedComponents.push('سطح روشن (احتمالاً تمیز)');

  const colors = px.dominant.slice(0, 4).map(rgb => ({
    dominant: colorName(rgb),
    rgb,
  }));

  return {
    category, categoryLabel, confidence: Math.round(confidence),
    observations: kb.observations,
    diagnoses: kb.diagnoses,
    recommendations: kb.recommendations,
    severity,
    colors,
    brightness: Math.round(px.brightness),
    estimatedComponents,
  };
}
