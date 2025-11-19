const puppeteer = require('puppeteer');

const DETEK_LINK = 'https://www.dtek-kem.com.ua/ua/shutdowns';

let browser = null;

const browserParams = { headless: false, defaultViewport: null, args: ['--start-maximized'] };

browser = browser || await puppeteer.launch(browserParams);
const page = await browser.newPage();
await page.setViewport({ width: 1080, height: 1024 });
await page.goto(DETEK_LINK);