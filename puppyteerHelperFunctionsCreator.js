function puppeteerFunctionsCreator(page, typeDelay) {
    return {
        async clickElement(selector) {
            await page.waitForSelector(selector);
            await page.$eval(selector, el => el.click());
        },
        async nativeClickElement(selector) {
            const element = await page.$(selector);
            const box = await element.boundingBox(); 
            await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
        },
        async typeText(selector, text) {
            await page.waitForSelector(selector);
            await page.type(selector, text, { delay: typeDelay });
        },
        async getHTMLText(selector) {
            await page.waitForSelector(selector);
            return await page.$eval(selector, el => el.innerHTML);
        },
        async getPlainText(selector) {
            await page.waitForSelector(selector);
            return await page.$eval(selector, el => el.textContent.trim());
        },
        async getScreenshotOfElement(selector) {
            await page.setJavaScriptEnabled(false); //временно отключаем js для избегания перерисовок
            await page.waitForSelector(selector);
            const element = await page.$(selector);
            const elementScreenshot = await element.screenshot()
            await page.setJavaScriptEnabled(true); //возвращаем js
            return elementScreenshot;
        }
    }
}

export {
    puppeteerFunctionsCreator,
};