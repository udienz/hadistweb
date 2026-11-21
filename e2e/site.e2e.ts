import { expect, test, type Page } from "@playwright/test";

/** Errors in the browser console (React hydration problems, failed scripts) fail a test. */
function watchConsole(page: Page): string[] {
  const problems: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") problems.push(message.text());
  });
  page.on("pageerror", (error) => problems.push(error.message));
  return problems;
}

test("addresses that are not a book, chapter, hadith or topic answer 404", async ({ request }) => {
  for (const ok of ["/", "/about", "/privacy", "/bukhari", "/bukhari/chapter/1", "/bukhari/1", "/topics", "/topics/59", "/topics/hadith/66512"]) {
    expect((await request.get(ok)).status(), ok).toBe(200);
  }
  for (const bad of ["/xyz", "/bukhari/chapter/99", "/bukhari/99999", "/bukhari/abc", "/bukhari/chapter/1/x", "/topics/999999", "/topics/hadith/1"]) {
    expect((await request.get(bad)).status(), bad).toBe(404);
  }
});

test("from the books to a chapter, with Indonesian chapter names and the English one under each", async ({ page }) => {
  const problems = watchConsole(page);
  await page.goto("/");
  await page.getByRole("link", { name: /Shahih al-Bukhari/ }).first().click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Shahih al-Bukhari");
  const first = page.getByRole("link", { name: /Kitab Permulaan Turunnya Wahyu/ });
  await expect(first).toContainText("Revelation");
  await first.click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Kitab Permulaan Turunnya Wahyu (Bad' al-Wahyi)");
  await expect(page.locator("article")).toHaveCount(7);
  expect(problems).toEqual([]);
});

test("5 or 10 hadiths per page, keeping the first hadith on screen", async ({ page, context }) => {
  await page.goto("/bukhari/chapter/2?page=2");
  await expect(page.locator("article").first()).toHaveId("h-18");
  await page.getByRole("radio", { name: "5" }).click();
  await expect(page).toHaveURL(/page=3$/);
  await expect(page.locator("article")).toHaveCount(5);
  await expect(page.locator("article").first()).toHaveId("h-18");
  expect((await context.cookies()).find((c) => c.name === "hw-page-size")?.value).toBe("5");
});

test("a hadith without an Indonesian translation shows the English one, labelled", async ({ page }) => {
  await page.goto("/bukhari/4");
  await expect(page.getByText("Terjemahan Inggris: hadis ini tidak punya terjemahan dalam bahasa Anda")).toBeVisible();
  await expect(page.locator("article div[lang=en]")).toContainText("Narrated");
});

test("an-Nawawi in Indonesian comes from HadeethEnc, with its takhrij and credit", async ({ page }) => {
  await page.goto("/nawawi/1");
  const card = page.locator("article");
  await expect(card.locator("p[lang=id]").first()).toContainText("Sesungguhnya segala amalan itu tergantung pada niatnya");
  await expect(card.getByText("Takhrij:")).toBeVisible();
  await expect(card.getByRole("link", { name: /Terjemahan dari HadeethEnc.com/ })).toHaveAttribute("href", "https://hadeethenc.com/id/browse/hadith/66511");
});

test("topics: a topic lists its hadiths, a hadith has its explanation and credit", async ({ page }) => {
  const problems = watchConsole(page);
  await page.goto("/topics/59");
  await page.getByRole("link", { name: "Islam dibangun di atas lima perkara" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Islam dibangun di atas lima perkara");
  await expect(page.getByRole("heading", { name: "Penjelasan" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Faedah" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Lihat di HadeethEnc.com" })).toHaveAttribute("href", "https://hadeethenc.com/id/browse/hadith/66512");
  expect(problems).toEqual([]);
});

test("the language and the theme can be switched", async ({ page }) => {
  await page.goto("/bukhari");
  await page.getByRole("button", { name: /Bahasa/ }).click();
  await page.getByRole("menuitemradio", { name: "English" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Sahih al-Bukhari");
  await expect(page.getByRole("link", { name: /Revelation/ })).toBeVisible();

  const dark = () => page.evaluate(() => document.documentElement.classList.contains("dark"));
  const before = await dark();
  await page.getByRole("button", { name: /Switch to (dark|light) mode/ }).click();
  await expect.poll(dark).toBe(!before);
  await page.reload();
  await expect.poll(dark).toBe(!before);
});

test("a translation reads as a sanad above paragraphs, and the text size is kept", async ({ page }) => {
  await page.goto("/bukhari/1");
  const sanad = page.locator("article div[lang=id]").getByLabel("Sanad");
  await expect(page.locator("article div[lang=ar]").getByLabel("Sanad")).toBeVisible();
  await expect(sanad).toContainText("Telah menceritakan kepada kami");
  await expect(sanad.locator("span.font-semibold").first()).toHaveText("Al Humaidi Abdullah bin Az Zubair");
  await expect(page.locator("article div[lang=id]")).not.toContainText("[");

  await page.getByRole("button", { name: "Ukuran huruf" }).click();
  await page.getByRole("button", { name: "Perbesar: Terjemahan" }).click();
  await page.reload();
  const scale = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--latin-scale"));
  expect(scale.trim()).toBe("1.15");
});

test("search finds words, opens a typed reference, and offers a bare number in each book", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("searchbox", { name: "Kata atau rujukan" }).fill("niat");
  await page.getByRole("button", { name: "Cari", exact: true }).click();
  await expect(page).toHaveURL(/\/search\?q=niat/);
  await expect(page.getByText(/hadis ditemukan/)).toBeVisible();
  const first = page.getByRole("link", { name: /Shahih al-Bukhari, hadis 1\b/ });
  await expect(first.locator("mark").first()).toBeVisible();

  await page.goto("/search?q=Bukhari%201");
  await expect(page).toHaveURL(/\/bukhari\/1$/);
  const redirect = await page.request.get("/search?q=HR.%20Bukhari%20no.%201", { maxRedirects: 0 });
  expect(redirect.status()).toBe(307);
  expect(redirect.headers().location).toMatch(/\/bukhari\/1$/);

  await page.goto("/search?q=1");
  await expect(page.getByText("Hadis nomor 1 di:")).toBeVisible();
  await expect(page.getByRole("link", { name: "Shahih al-Bukhari", exact: true })).toHaveAttribute("href", "/bukhari/1");

  await page.goto("/search?q=zzzzqqq");
  await expect(page.getByText("Tidak ada hadis yang memuat “zzzzqqq”.")).toBeVisible();
});
