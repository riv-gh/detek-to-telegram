import puppeteer from 'puppeteer';

import {
    DETEK_LINK,
    DETEK_KREM_LINK,
    TYPE_DELAY,
    DEFAULT_CITY,
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
 * @param {string} city - город полностью как в детеке
 * @param {string} street - улица полностью как в детеке
 * @param {string} house - номер дома полностью
 * @param {number} typeDelay - задержка между нажатиями при "печати" (120 по умолчанию)
 * @returns {string} - текст про отключение электроэнерии
 */
async function getDetekData(city, street, house, typeDelay = TYPE_DELAY) {
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
     * Проверяет пустая ли таблица отключений на следующий день
     * @returns {boolean} - true если таблица пустая
     */
    async function nextDayTableIsEmpty() {
        return (
            await page.$eval('.discon-fact-table:last-child table>tbody>tr', tr => (
                Array.from(
                    tr.querySelectorAll('td'),
                    td => td.classList.value
                ).filter(cls => cls && cls!=='cell-non-scheduled').length === 0
            ))
        );
    }

    /**
     * Получает список классов из таблицы отключений по часам в строку через запятую
     * @param {string} selctor - селектор строки таблицы ('.discon-fact-table:first-child table>tbody>tr'|'.discon-fact-table:last-child table>tbody>tr')
     * @returns {string} - текст про отключение электроэнерии
     */
    async function TableToListByHoursInLine(selctor) {
        return (
            await page.$eval(selctor, tr => (
                Array.from(
                    tr.querySelectorAll('td'),
                    td => td.classList.value
                ).filter(cls => cls).join('')
            ))
        );
    }

    /**
     * Вводит улицу и дом и получает текст с информацией об отключении
     * @returns {string} - текст про отключение электроэнерии
     */
    async function getInfoText() {
        if (city !== DEFAULT_CITY) {
            await typeText('#city', city);
            await nativeClickElement('#cityautocomplete-list>div'); // "нативный" клик так как обычный не срабатывает
        }
        await typeText('#street', street);
        await clickElement('#streetautocomplete-list>div');
        await typeText('#house_num:not([disabled])', house);
        await clickElement('#house_numautocomplete-list>div');

        return (await getHTMLText('#showCurOutage')).replaceAll('<br>', '\n').replace(/<[^>]*>/gi, '');
    }


    browser = browser || await puppeteer.launch(browserParams);
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1024 });
    await page.goto(
        city === DEFAULT_CITY
        ? DETEK_LINK
        : DETEK_KREM_LINK
    );

    const {
        clickElement,
        nativeClickElement,
        typeText,
        getHTMLText,
        getPlainText,
        getScreenshotOfElement,
    } = puppeteerFunctionsCreator(page, typeDelay);

    await delay(1500);
    await closeModal();
    const textInfo = await getInfoText();
    await delay(1500);
    await closeModal(); // на случай если модалка выскочит снова
    

    const screenshotBuffer = await getScreenshotOfElement('#discon-fact');
    const stateClassList = await TableToListByHoursInLine('.discon-fact-table:nth-child(1) table>tbody>tr');
    const screenshotCaptionText = await getPlainText('.dates>.date:nth-child(1)');

    await clickElement('.dates .date:not(.active)');

    const screenshotBuffer2 = await getScreenshotOfElement('#discon-fact');
    const stateClassList2 = await TableToListByHoursInLine('.discon-fact-table:nth-child(2) table>tbody>tr');
    const screenshotCaptionText2 = await getPlainText('.dates>.date:nth-child(2)');

    
    await page.close();
    // временно комментировать для тестов
    // await browser.close();

    return {
        textInfoFull: textInfo, 
        graphics: [
            {
                screenshotBuffer: screenshotBuffer,
                stateClassList: stateClassList,
                screenshotCaptionText: screenshotCaptionText,
            },
            {
                screenshotBuffer: screenshotBuffer2,
                stateClassList: stateClassList2,
                screenshotCaptionText: screenshotCaptionText2,
            },
        ],

    };
}

function browserIsLaunched() {
    return browser !== null;
}

async function browserClose() {
    try {
        await browser.close();
    }
    catch { /* browser was not launched */ }
    finally {
        browser = null;
    }
}

export {
    getDetekData,
    browserIsLaunched,
    browserClose,
}