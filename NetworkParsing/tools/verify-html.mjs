import { chromium } from "playwright";
import { pathToFileURL } from "node:url";
import path from "node:path";
import fs from "node:fs";

const root = process.cwd();
const chromeCandidates = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
].filter(Boolean);

const pages = {
  walkthrough: pathToFileURL(path.join(root, "how-a-note-is-fetched.html")).href,
  explorer: pathToFileURL(path.join(root, "network-parsing-explorer.html")).href,
};

function existingChromePath() {
  return chromeCandidates.find((candidate) => fs.existsSync(candidate));
}

async function assertNoWideElements(page, label) {
  const wide = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("body *"))
      .filter((el) => {
        if (el.closest(".code-panel")) return false;
        const rect = el.getBoundingClientRect();
        const style = getComputedStyle(el);
        return rect.width > 0 && rect.right > window.innerWidth + 1 && style.position !== "fixed";
      })
      .slice(0, 8)
      .map((el) => {
        const rect = el.getBoundingClientRect();
        return {
          tag: el.tagName,
          id: el.id,
          className: String(el.className),
          text: (el.textContent || "").trim().slice(0, 80),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
          viewport: window.innerWidth,
        };
      });
  });
  if (wide.length) {
    throw new Error(`${label} has wide non-code elements: ${JSON.stringify(wide, null, 2)}`);
  }
}

async function main() {
  const launchOptions = { headless: true };
  const chromePath = existingChromePath();
  if (chromePath) launchOptions.executablePath = chromePath;

  const browser = await chromium.launch(launchOptions);
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];

  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await page.goto(pages.walkthrough);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForSelector("text=Line-click annotations");
  if (await page.evaluate(() => document.documentElement.getAttribute("data-teacher") !== "on")) {
    await page.click("#teacherToggle");
  }
  await page.waitForFunction(() => document.documentElement.getAttribute("data-teacher") === "on");
  await page.click("#slideToggle");
  await page.waitForFunction(() => document.documentElement.getAttribute("data-slide") === "on");
  await page.click("#slideNext");
  await page.waitForFunction(() => document.querySelector("#slideCount")?.textContent.startsWith("2 /"));
  await page.click("#slideToggleTop");
  await page.waitForFunction(() => document.documentElement.getAttribute("data-slide") === "off");
  await page.click('[data-anno="catch"]');
  await page.waitForFunction(() => document.querySelector("#annotationDetail")?.textContent.includes("Converts thrown failures"));
  await page.click('[data-layer="network"]');
  await page.waitForFunction(() => document.querySelector("#layerDetail")?.textContent.includes("Network or fake JSON"));
  await page.click('[data-dto-lab="badtype"]');
  await page.waitForFunction(() => document.querySelector("#dtoLabResult")?.textContent.includes("No Weather is created"));
  await page.click('[data-state-demo="success"]');
  await page.waitForFunction(() => document.querySelector("#stateDemoScreen")?.textContent.includes("Orlando"));
  await page.click("#stepNext");
  await page.waitForFunction(() => document.querySelector("#stepExplain")?.textContent.includes("Plain English for step 2"));
  await page.click('a[href="#exercises"]');
  await page.waitForSelector("#exercises details");
  await page.click("#exercises details summary");
  await page.waitForFunction(() => document.querySelector("#exercises details")?.open === true);
  await page.waitForFunction(() => document.querySelector("#exerciseProgress")?.textContent.includes("1 / 6"));
  await page.click("#resetExerciseProgress");
  await page.waitForFunction(() => document.querySelector("#exerciseProgress")?.textContent.includes("0 / 6"));
  await page.click('a[href="#worksheet"]');
  await page.waitForSelector("#worksheet .answer-line");

  await page.goto(pages.explorer);
  await page.waitForSelector("text=Practice before the quiz");
  if (await page.evaluate(() => document.documentElement.getAttribute("data-teacher") !== "on")) {
    await page.click("#teacherToggle");
  }
  await page.waitForFunction(() => document.documentElement.getAttribute("data-teacher") === "on");
  await page.click("#slideToggle");
  await page.waitForFunction(() => document.documentElement.getAttribute("data-slide") === "on");
  await page.click("#slideNext");
  await page.waitForFunction(() => document.querySelector("#slideCount")?.textContent.startsWith("2 /"));
  await page.click("#slideToggleTop");
  await page.waitForFunction(() => document.documentElement.getAttribute("data-slide") === "off");
  await page.click("#simLoad");
  await page.waitForFunction(() => document.querySelector("#simScreen")?.textContent.includes("Orlando"), null, { timeout: 5000 });
  await page.click('#outcomeSeg [data-out="offline"]');
  await page.click("#simLoad");
  await page.waitForFunction(() => document.querySelector("#simScreen")?.textContent.includes("Unable to resolve host"), null, { timeout: 5000 });
  await page.click('#outcomeSeg [data-out="badjson"]');
  await page.click("#simLoad");
  await page.waitForFunction(() => document.querySelector("#simScreen")?.textContent.includes("SerializationException"), null, { timeout: 5000 });
  await page.click('#stateSeg [data-state="error"]');
  await page.waitForFunction(() => document.querySelector("#stateInfo")?.textContent.includes("Retry calls"));
  await page.click('#dtoSeg [data-dto="badtype"]');
  await page.waitForFunction(() => document.querySelector("#dtoMsg")?.textContent.includes("wrong type"));
  await page.click("#practice details summary");
  await page.waitForFunction(() => document.querySelector("#practice details")?.open === true);
  await page.waitForFunction(() => document.querySelector("#practiceProgress")?.textContent.includes("1 / 6"));
  await page.click("#resetPracticeProgress");
  await page.waitForFunction(() => document.querySelector("#practiceProgress")?.textContent.includes("0 / 6"));
  await page.click("#resetQuiz");
  await page.locator("#quizList .q").first().locator(".opt").nth(1).click();
  await page.waitForFunction(() => document.querySelector("#quizScore")?.textContent.includes("1 / 5"));
  await page.reload();
  await page.waitForFunction(() => document.querySelector("#quizScore")?.textContent.includes("1 / 5"));
  await page.click("#glossary .acc-q");
  await page.waitForFunction(() => document.querySelector("#glossary .acc-item")?.classList.contains("open"));

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(pages.walkthrough);
  await page.waitForSelector("#annotations");
  await assertNoWideElements(page, "walkthrough mobile");
  await page.click('[data-anno="mapper"]');
  await page.waitForFunction(() => document.querySelector("#annotationDetail")?.textContent.includes("Flattens the nested"));

  await page.goto(pages.explorer);
  await page.waitForSelector("#practice");
  await assertNoWideElements(page, "explorer mobile");
  await page.click('#dtoSeg [data-dto="extra"]');
  await page.waitForFunction(() => document.querySelector("#dtoMsg")?.textContent.includes("server added"));

  await browser.close();

  if (errors.length) {
    throw new Error(errors.join("\n"));
  }
  console.log("HTML verification passed");
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
