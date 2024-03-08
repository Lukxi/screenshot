const puppeteer = require('puppeteer');
const fs = require('fs');
const sharp = require('sharp');

// Puppeteer configuration options
const URL = 'http://192.168.2.148:3000/d/ht6vknSSz1/pv-anlage-public?from=now%2Fd&orgId=2&refresh=1m&theme=light&to=now%2Fd';
const VIEWPORT_WIDTH = 1024;
const VIEWPORT_HEIGHT = 758;
const DEVICE_SCALE_FACTOR = 1;


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

    let name = `./Image_${Date.now()}.png`;
    await page.screenshot({
      path: name,
      fullPage: true,
    });
  //}

  await browser.close();
  sharp(name)
  .rotate(90)
  .toFile('out.png', (err, info) => {
      if (err) {
          console.error(err);
      } else {
          console.log('Image Taken and rotated: ' + name);
      }
  });
};
setInterval(screenshot, 60000); // Take screenshot every minute (60000 milliseconds)

screenshot();

