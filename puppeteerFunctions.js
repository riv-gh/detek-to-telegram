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

    /**
     * Получает данные графиков отключений
     * @param {string} screenshotElementSelector - селектор элемента для скриншота
     * @param {string} stateClassListSelector - селектор строки таблицы для получения классов состояний по часам
     * @param {string} captionSelector - селектор элемента для получения текста подписи к графику
     * @returns {object} - объект с буфером скриншота, списком классов состояний и текстом подписи к графику
     */
    async function getGraphicDataBySelectors(screenshotElementSelector, stateClassListSelector, captionSelector) {
        const screenshotBuffer = await getScreenshotOfElement(screenshotElementSelector);
        const stateClassList = await TableToListByHoursInLine(stateClassListSelector);
        const screenshotCaptionText = await getPlainText(captionSelector);
        return {
            screenshotBuffer,
            stateClassList,
            screenshotCaptionText,
        }
    }

    /**
     * Получает данные графика отключений по его номеру (1 или 2)
     * @param {number} num - номер графика (1 или 2)
     * @returns {object} - объект с буфером скриншота, списком классов состояний и текстом подписи к графику
     */
    async function getGraphicDataByNum(num) {
        return await getGraphicDataBySelectors(
            `#discon-fact`,
            `.discon-fact-table:nth-child(${num}) table>tbody>tr`,
            `.dates>.date:nth-child(${num})`
        );
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

    const graphics = [];
    graphics.push(await getGraphicDataByNum(1));
    await clickElement('.dates .date:not(.active)');
    graphics.push(await getGraphicDataByNum(2));

    await page.close();

    return {
        textInfoFull: textInfo, 
        graphics: graphics,
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