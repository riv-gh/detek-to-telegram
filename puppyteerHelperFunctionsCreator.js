function puppeteerFunctionsCreator(page, typeDelay) {
    return {
        async clickElement(selector) {
            try {
                await page.waitForSelector(selector);
                await page.$eval(selector, el => el.click());
                return true;
            }
            catch (err) {
                console.warn(`!!! clicElement('${selector}') error`);
            }
            return false;
        },
        async nativeClickElement(selector) {
            try {
                const element = await page.$(selector);
                const box = await element.boundingBox(); 
                await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
                return true;
            }
            catch (err) {
                console.warn(`!!! nativeClickElement('${selector}') error`);
            }
            return false;
        },
        async typeText(selector, text) {
            try {
                await page.waitForSelector(selector);
                await page.type(selector, text, { delay: typeDelay });
            }
            catch (err) {
                console.warn(`!!! nativeClickElement('${selector}') error`);
            }
            return false;
        },
        async getHTMLText(selector) {
            try {
                await page.waitForSelector(selector);
                return await page.$eval(selector, el => el.innerHTML);
            }
            catch (err) {
                console.warn(`!!! getHTMLText('${selector}') error`);
            }
            return '';
        },
        async getPlainText(selector) {
            try {
                await page.waitForSelector(selector);
                return await page.$eval(selector, el => el.textContent.trim());
            }
            catch (err) {
                console.warn(`!!! getPlainText('${selector}') error`);
            }
            return '';
        },
        async getScreenshotOfElement(selector) {
            try {
                await page.setJavaScriptEnabled(false); //временно отключаем js для избегания перерисовок
                await page.waitForSelector(selector);
                const element = await page.$(selector);
                const elementScreenshot = await element.screenshot()
                await page.setJavaScriptEnabled(true); //возвращаем js
                return elementScreenshot;
            }
            catch (err) {
                console.warn(`!!! getScreenshotOfElement('${selector}') error:`, err);
            }
            return null;

        }
    }
}

export {
    puppeteerFunctionsCreator,
};