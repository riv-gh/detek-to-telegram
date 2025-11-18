import puppeteer from 'puppeteer';

import {
    DETEK_LINK,
    TYPE_DELAY,
} from './globals.js';

import {
    delay,
} from './helpersFunctions.js';

import { puppeteerFunctionsCreator } from './puppyteerHelperFunctionsCreator.js';


let browser = null;

const browserParams =
    (process.platform === 'win32') //на виндовс отображем бразур для удобного тестирования
    ? { headless: false, defaultViewport: null, args: ['--start-maximized'] }
    : { args: ['--no-sandbox', '--disable-setuid-sandbox'] };

/**
 * Получает текст с сайта детек (необходимы browser и browserParams)
 * @param {string} street - улица полностью как в детеке
 * @param {string} house - номер дома полностью
 * @param {number} typeDelay - задержка между нажатиями при "печати" (120 по умолчанию)
 * @returns {string} - текст про отключение электроэнерии
 */
async function getDetekData(street, house, typeDelay = TYPE_DELAY) {
    /**
     * Закрывает модальное окно если оно есть
     */
    async function closeModal() {
        try{
            await clickElement('.modal__close');
            /* console.log('close modal'); */
        }
        catch { /*console.log('no modal');*/ }
    }

    /**
     * Вводит улицу и дом и получает текст с информацией об отключении
     * @returns {string} - текст про отключение электроэнерии
     */
    async function getInfoText() {
        await typeText('#street', street);
        await clickElement('#streetautocomplete-list>div');
        await typeText('#house_num:not([disabled])', house);
        await clickElement('#house_numautocomplete-list>div');

        return (await getHTMLText('#showCurOutage')).replaceAll('<br>', '\n')
    }

    browser = browser || await puppeteer.launch(browserParams);
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1024 });
    await page.goto(DETEK_LINK);

    const {
        clickElement,
        typeText,
        getHTMLText,
        getScreenshotOfElement,
    } = puppeteerFunctionsCreator(page, typeDelay);

    await delay(1500);
    await closeModal();
    const textInfo = await getInfoText();
    await delay(1500);
    await closeModal(); // на случай если модалка выскочит снова
    

    const screenshotBuffer = await getScreenshotOfElement('#discon-fact');
    const htmlFragment = await getHTMLText('#discon-fact');

    await clickElement('.dates .date:not(.active)');

    const screenshotBuffer2 = await getScreenshotOfElement('#discon-fact');
    const htmlFragment2 = await getHTMLText('#discon-fact');

    // временно комментировать для тестов
    await page.close();

    return {
        textInfoFull: textInfo, 
        graphics: [
            {
                screenshotBuffer: screenshotBuffer,
                htmlFragment: htmlFragment,
            },
            {
                screenshotBuffer: screenshotBuffer2,
                htmlFragment: htmlFragment2,
            },
        ],

    };
}

export {
    getDetekData,
}