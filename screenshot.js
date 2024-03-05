const puppeteer = require('puppeteer');
const fs = require('fs');

async function takeScreenshot() {
    const browser = await puppeteer.launch({
		args : [
      '--window-size=1920,1080',
    ],
    headless: true,
});
    const page = await browser.newPage();
    await page.goto('http://192.168.2.148:3000/d/ht6vknSSz1/pv-anlage-public?orgId=2&refresh=10s&from=1709639445515&to=1709661045515&theme=light');
    await page.setViewport({
        width: 1920,
        height: 1080,
      });
      setTimeout(function(){
        console.log("Executed after 1 second");
    }, 5000);

    const screenshotPath = `screenshot_${Date.now()}.png`;
    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3738.0 Safari/537.36');
    await page.screenshot({ path: screenshotPath });

    await browser.close();

    }
setInterval(takeScreenshot, 60000); // Take screenshot every minute (60000 milliseconds)

// Initial screenshot
takeScreenshot();
