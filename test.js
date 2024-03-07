const puppeteer = require('puppeteer');
const fs = require('fs');

// Puppeteer configuration options
const URL = 'http://192.168.2.148:3000/d/ht6vknSSz1/pv-anlage-public?orgId=2&refresh=10s&from=1709639445515&to=1709661045515&theme=light';
const VIEWPORT_WIDTH = 600;
const VIEWPORT_HEIGHT = 800;
const DEVICE_SCALE_FACTOR = 2;
const CHUNK_HEIGHT = 6000;


const getHeight = async (page) => {
  const height = await page.evaluate(() => {
    return document.body.scrollHeight;
  });
  return height;
};


async function autoScroll(page) {
  try {
    await page.evaluate(async () => {
      await new Promise((resolve, reject) => {
        var totalHeight = 0;
        var distance = 100;
        var timer = setInterval(() => {
          var scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;
          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 50);
      });
      // Scroll back to the top of the page, so sticky menus appears at the right place.
      document.body.scrollTop = document.documentElement.scrollTop = 0;
    });
  } catch (err) {
    console.log(err);
  }
}

const screenshot = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setViewport({
    width: VIEWPORT_WIDTH,
    height: VIEWPORT_HEIGHT,
    deviceScaleFactor: DEVICE_SCALE_FACTOR,
  });

  await page.goto(URL);

  await page.addStyleTag({content: `
  nav {
    display: none !important;
  }
  [data-panelid="4"] {
    display: none !important;
  }
  [data-panelid="20"] {
    margin-top: 8px !important;
  }
`});

  await autoScroll(page);

  await page.waitForNetworkIdle();

    await page.screenshot({
      path: `./Image_${Date.now()}.png`,
      fullPage: true,
    });
  //}

  await browser.close();
};
setInterval(screenshot, 60000); // Take screenshot every minute (60000 milliseconds)

screenshot();