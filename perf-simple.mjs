import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Throttle CPU 4x
  const client = await page.context().newCDPSession(page);
  await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });

  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <body>
      <div id="filter-container">
        <svg viewBox="0 0 400 400" width="400" height="400">
          <defs>
            <filter id="liquid" color-interpolation-filters="sRGB">
              <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
              <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
              <feComposite in="SourceGraphic" in2="goo" operator="atop" />
            </filter>
          </defs>
          <g filter="url(#liquid)" fill="blue">
            <circle id="c1" cx="150" cy="200" r="40" />
            <circle id="c2" cx="250" cy="200" r="40" />
          </g>
        </svg>
      </div>
      <script>
        const c1 = document.getElementById('c1');
        let start = performance.now();
        let frames = 0;
        let lastTime = start;
        window.stats = { totalTime: 0, maxFrame: 0 };
        function animate(time) {
          const dt = time - lastTime;
          if (frames > 0) {
            window.stats.totalTime += dt;
            if (dt > window.stats.maxFrame) window.stats.maxFrame = dt;
          }
          lastTime = time;
          frames++;
          
          c1.setAttribute('cx', 150 + Math.sin(time / 100) * 50);
          
          if (time - start < 1000) {
            requestAnimationFrame(animate);
          } else {
            window.stats.frames = frames;
            window.stats.fps = frames / ((time - start) / 1000);
            window.stats.done = true;
          }
        }
        requestAnimationFrame(animate);
      </script>
    </body>
    </html>
  `);

  await page.waitForFunction('window.stats && window.stats.done === true');
  const stats = await page.evaluate('window.stats');
  
  console.log(`[400x400 Area, 4x Throttled CPU] FPS: ${stats.fps.toFixed(1)}, Avg Frame: ${(stats.totalTime / stats.frames).toFixed(1)}ms, Max Frame: ${stats.maxFrame.toFixed(1)}ms`);

  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <body>
      <div id="filter-container">
        <svg viewBox="0 0 100 100" width="100" height="100">
          <defs>
            <filter id="liquid" color-interpolation-filters="sRGB">
              <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
              <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
              <feComposite in="SourceGraphic" in2="goo" operator="atop" />
            </filter>
          </defs>
          <g filter="url(#liquid)" fill="blue">
            <circle id="c1" cx="30" cy="50" r="20" />
            <circle id="c2" cx="70" cy="50" r="20" />
          </g>
        </svg>
      </div>
      <script>
        const c1 = document.getElementById('c1');
        let start = performance.now();
        let frames = 0;
        let lastTime = start;
        window.stats = { totalTime: 0, maxFrame: 0 };
        function animate(time) {
          const dt = time - lastTime;
          if (frames > 0) {
            window.stats.totalTime += dt;
            if (dt > window.stats.maxFrame) window.stats.maxFrame = dt;
          }
          lastTime = time;
          frames++;
          
          c1.setAttribute('cx', 30 + Math.sin(time / 100) * 20);
          
          if (time - start < 1000) {
            requestAnimationFrame(animate);
          } else {
            window.stats.frames = frames;
            window.stats.fps = frames / ((time - start) / 1000);
            window.stats.done = true;
          }
        }
        requestAnimationFrame(animate);
      </script>
    </body>
    </html>
  `);

  await page.waitForFunction('window.stats && window.stats.done === true');
  const statsSmall = await page.evaluate('window.stats');
  
  console.log(`[100x100 Area, 4x Throttled CPU] FPS: ${statsSmall.fps.toFixed(1)}, Avg Frame: ${(statsSmall.totalTime / statsSmall.frames).toFixed(1)}ms, Max Frame: ${statsSmall.maxFrame.toFixed(1)}ms`);

  await browser.close();
})();
