import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Create a fast CDP session for CPU throttling
  const client = await page.context().newCDPSession(page);
  // Throttle CPU 4x
  await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });

  await page.goto('http://localhost:9099/iframe.html?id=clay-effects-liquidgroup--merging-pieces&viewMode=story');

  // Wait for the button
  await page.waitForSelector('button:has-text("Merge the drops")');
  
  // Measure frame time using requestAnimationFrame
  const measureFPS = async (durationMs) => {
    return await page.evaluate((ms) => {
      return new Promise((resolve) => {
        let frames = 0;
        let start = performance.now();
        let lastFrame = start;
        let totalTime = 0;
        let maxTime = 0;
        
        function tick(now) {
          if (frames > 0) {
            const time = now - lastFrame;
            totalTime += time;
            if (time > maxTime) maxTime = time;
          }
          frames++;
          lastFrame = now;
          if (now - start < ms) {
            requestAnimationFrame(tick);
          } else {
            resolve({ 
              avgFrameMs: totalTime / (frames - 1), 
              maxFrameMs: maxTime,
              fps: (frames / (now - start)) * 1000 
            });
          }
        }
        requestAnimationFrame(tick);
      });
    }, durationMs);
  };

  // Click to separate
  await page.click('button:has-text("Merge the drops")');
  await page.waitForTimeout(500);
  
  // Measure while clicking
  const perfPromise = measureFPS(1000);
  await page.click('button:has-text("Split the drops")');
  const res = await perfPromise;

  console.log(`[4x Throttled] FPS: ${res.fps.toFixed(1)}, Avg Frame: ${res.avgFrameMs.toFixed(1)}ms, Max Frame: ${res.maxFrameMs.toFixed(1)}ms`);

  await browser.close();
})();
