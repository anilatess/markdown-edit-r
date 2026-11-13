# Doc Editor

Markdown editör + canlı önizleme + PDF çıktısı.

## Çalıştırma (iki terminal)

Terminal 1 – PDF sunucusu (Express + Puppeteer):
```bash
cd server
npm install
npm run dev
```

Terminal 2 – arayüz:
```bash
npm install
npm run dev
```

"PDF indir" → sunucuda Chromium ile A4 PDF üretir (kapak, içindekiler, sayfa numaraları).
"Yazdır" → eski yöntem (tarayıcının yazdırma penceresi), sunucu gerekmez.

Not: Puppeteer ilk kurulumda Chromium indirir (~150 MB), bu yüzden `npm install` biraz sürer.
