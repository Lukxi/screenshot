const puppeteer = require('puppeteer');
const fs = require('fs');
const sharp = require('sharp');
const http = require('http');
const path = require('path');

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

  try {
    let name = `./Image_${Date.now()}.png`;
    await page.screenshot({
      path: name,
      fullPage: true,
    });

    // Rotate and overwrite the original image
    await sharp(name)
      .rotate(90)
      .toFile('out.png');

    // Delete the original image
    fs.unlink(name, (err) => {
      if (err) {
        console.error(`Error deleting ${name}: ${err}`);
      } else {
        console.log(`Original image ${name} deleted`);
      }
    });

    console.log('Image Taken, Rotated, and Original Deleted: out.png');
  } catch (error) {
    console.error('Error taking and processing screenshot:', error);
  }

  await browser.close();
};

const PORT = 3000;

const server = http.createServer((req, res) => {
    const filePath = path.join(__dirname, 'out.png');

    // Check if the file exists
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            res.statusCode = 404;
            res.end('File not found');
            return;
        }

        // Serve the file
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.statusCode = 500;
                res.end('Internal server error');
                return;
            }

            res.setHeader('Content-Type', 'image/png');
            res.end(data);
        });
    });
});

server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}/`);
});

// Initial Screen
screenshot();

// Schedule screenshots every minute
setInterval(screenshot, 60000);