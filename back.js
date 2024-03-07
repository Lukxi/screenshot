const puppeteer = require('puppeteer');
const fs = require('fs');
const sharp = require('sharp');

// Puppeteer configuration options
const URL = 'http://192.168.2.148:3000/d/ht6vknSSz1/pv-anlage-public?orgId=2&refresh=10s&from=1709639445515&to=1709661045515&theme=light';
const VIEWPORT_WIDTH = 600;
const VIEWPORT_HEIGHT = 800;
const DEVICE_SCALE_FACTOR = 2;
const CHUNK_HEIGHT = 6000;

// Helper function, needed for calculating number of chunks
const getHeight = async (page) => {
  const height = await page.evaluate(() => {
    return document.body.scrollHeight;
  });
  return height;
};

// Auto scroll the page to trigger all page animations and image loading
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

  await autoScroll(page);
  const pageHeight = await getHeight(page);

  await page.waitForNetworkIdle();

  /*
  // If page has height more than 6000px, then split it into the chunks and take screenshots of each chunk
  if (pageHeight > CHUNK_HEIGHT) {
    const chunks = Math.ceil(pageHeight / CHUNK_HEIGHT);
    const chunkCompositeOptions = [];
    for (let i = 0; i < chunks; i++) {
      let height = 0;
      // Calculate chunk offset top for a screenshot
      const offsetTop = i * CHUNK_HEIGHT;
      const filePath = `./screenshot-${i}.png`;

      if (pageHeight - CHUNK_HEIGHT * i < CHUNK_HEIGHT) {
        height = pageHeight - CHUNK_HEIGHT * i;
        // Take a screenshot using clip option passing top offset
        await page.screenshot({
          path: filePath,
          clip: {
            x: 0,
            y: offsetTop,
            width: VIEWPORT_WIDTH,
            height: pageHeight - CHUNK_HEIGHT * i,
          },
        });
      } else {
        height = CHUNK_HEIGHT;
        await page.screenshot({
          path: filePath,
          clip: {
            x: 0,
            y: offsetTop,
            width: VIEWPORT_WIDTH,
            height: CHUNK_HEIGHT,
          },
        });
      }

      // Prepare image merge options for sharp library api
      chunkCompositeOptions.push({
        input: filePath,
        top: offsetTop * DEVICE_SCALE_FACTOR,
        left: 0,
        width: VIEWPORT_WIDTH,
        height: height * DEVICE_SCALE_FACTOR,
      });
    }

    // An example to find batch of files in the folder
    const files = fs.readdirSync('./');
    const images = files.filter((file) => file.includes('screenshot'));

    // Merge images into one
    await sharp({
      create: {
        width: VIEWPORT_WIDTH * DEVICE_SCALE_FACTOR,
        height: pageHeight * DEVICE_SCALE_FACTOR,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      },
    })
      .composite(chunkCompositeOptions)
      .toFile('./merged.png');
    // Delete all the screenshots
    images.forEach((image) => fs.unlinkSync(image));
  } else {
    */
    await page.screenshot({
      path: './screenshot.png',
      fullPage: true,
    });
  //}

  await browser.close();
};

screenshot();