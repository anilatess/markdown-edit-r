import express from "express";
import puppeteer, { type Browser } from "puppeteer";
import { buildHtml, escapeHtml } from "./template.js";

const app = express();
app.use(express.json({ limit: "5mb" }));

// Tarayıcıyı her istekte açmak yavaş: bir kez açıp tekrar kullanıyoruz
let browserPromise: Promise<Browser> | null = null;
const getBrowser = () => (browserPromise ??= puppeteer.launch({ headless: true }));

app.post("/api/pdf", async (req, res) => {
  const { html, title = "document", footer = "" } = req.body ?? {};
  if (typeof html !== "string" || !html.trim()) {
    res.status(400).json({ error: "html alanı gerekli" });
    return;
  }

  const page = await (await getBrowser()).newPage();
  try {
    // Güvenlik: script çalıştırma ve dış ağa istek atma kapalı
    await page.setJavaScriptEnabled(false);
    await page.setRequestInterception(true);
    page.on("request", (r) =>
      r.url().startsWith("data:") || r.url() === "about:blank" ? r.continue() : r.abort(),
    );

    await page.setContent(buildHtml(html, String(title)), { waitUntil: "load" });

    const footerHtml = `
      <div style="width:100%;font-size:9px;color:#777;padding:0 18mm;display:flex;justify-content:space-between;">
        <span>${escapeHtml(String(footer))}</span>
        <span><span class="pageNumber"></span> / <span class="totalPages"></span></span>
      </div>`;

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: "<div></div>",
      footerTemplate: footerHtml,
      margin: { top: "18mm", bottom: "22mm", left: "18mm", right: "18mm" },
    });

    res.setHeader("Content-Type", "application/pdf");
    res.send(Buffer.from(pdf));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "PDF üretilemedi" });
  } finally {
    await page.close();
  }
});

const PORT = Number(process.env.PORT ?? 3001);
app.listen(PORT, () => console.log(`PDF sunucusu hazır: http://localhost:${PORT}`));
