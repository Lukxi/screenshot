const puppeteer = require('puppeteer');

async function takeScreenshot() {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--window-size=1920,1080'],
    });
    const page = await browser.newPage();
    await page.goto('http://192.168.2.148:3000/d/ht6vknSSz1/pv-anlage-public?orgId=2&refresh=10s&from=1709639445515&to=1709661045515&theme=light');
    await page.setViewport({
        width: 1920,
        height: 1080,
    });

    // Wait for the specific elements you want to capture to render
    // You can use page.waitForSelector or any other wait methods here

    // Get the dimensions and position of the area you want to capture
    await page.waitForSelector('.panel-content');
    await page.waitForSelector('.dashboard-row');
    const clip = await page.evaluate(() => {
        const element = document.querySelector('.panel-content,  .dashboard-row'); // Replace with the ID or selector of the element you want to capture
        const { x, y, width, height } = element.getBoundingClientRect();
        return { x, y, width, height };
    });

    // Take a screenshot of the specified area
    const screenshotPath = `screenshot_${Date.now()}.png`;
    await page.screenshot({ path: screenshotPath, clip });

    await browser.close();
}

setInterval(takeScreenshot, 60000); // Take screenshot every minute (60000 milliseconds)

// Initial screenshot
takeScreenshot();