console.log('start');

import puppeteer from 'puppeteer';
import schedule from 'node-schedule';

import {
    STREET,
    HOUSE,
    PHOTO_WHITE_BORDER_SIZE,
    DETEK_LINK,
    UPDATE_DATE_SPLITER,
    HIDE_INFO_TEXT,
} from './globals.js';

import {
    sendPhoto,
    sendMessage,
    editMessage,
} from './functions/telegramBotFunctions.js';

import {
    addWhiteBorderToImage,
    delay,
} from './helpersFunctions.js';

let lastUpdateDate = '00:00 00.00.0000';
let thsStartUpdateDate = '00:00 00.00.0000';
let lastTextInfo = '';
let lastMessageId = 0;

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
async function getDetekData(street, house, typeDelay = 120) {
    async function clickElement(selector) {
        await page.waitForSelector(selector);
        await page.$eval(selector, el => el.click());
    }
    async function typeText(selector, text) {
        await page.waitForSelector(selector);
        await page.type(selector, text, { delay: typeDelay });
    }
    async function closeModal() {
        try{
            await clickElement('.modal__close');
            /* console.log('close modal'); */
        }
        catch { /*console.log('no modal');*/ }
    }
    async function getInfoText() {
        await typeText('#street', street);
        await clickElement('#streetautocomplete-list>div');
        await typeText('#house_num:not([disabled])', house);
        await clickElement('#house_numautocomplete-list>div');

        await page.waitForSelector('#showCurOutage');

        return await page.$eval('#showCurOutage>p', el => el.innerHTML.replaceAll('<br>', '\n'));
    }

    browser = browser || await puppeteer.launch(browserParams);
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1024 });
    await page.goto(DETEK_LINK);

    await delay(500);
    await closeModal();
    const textInfo = await getInfoText();
    await closeModal(); // на случай если модалка выскочит снова
    await delay(500);

    // Ждём элемент
    const element = await page.waitForSelector('#discon-fact');
    // Делаем скриншот в буфер (без сохранения на диск)
    const screenshotBuffer = await element.screenshot();
    const htmlFragment = await page.$eval('#discon-fact', el => el.innerHTML);

    await page.waitForSelector('.dates .date:not(.active)');
    await page.$eval('.dates .date:not(.active)', el => el.click());

    const element2 = await page.waitForSelector('#discon-fact');
    // Делаем скриншот в буфер (без сохранения на диск)
    const screenshotBuffer2 = await element2.screenshot();
    const htmlFragment2 = await page.$eval('#discon-fact', el => el.innerHTML);

    // временно убрано для тестов
    // await page.close();

    return [textInfo, screenshotBuffer, htmlFragment, screenshotBuffer2, htmlFragment2];
}

async function main() {
    console.log('main start');
    const [textInfoFull, screenshotBuffer, htmlFragment, screenshotBuffer2, htmlFragment2] = await getDetekData(STREET, HOUSE);
    const [textInfo, nowUpdateDate] = [
        ...textInfoFull.split(UPDATE_DATE_SPLITER),
        '00:00 00.00.0000'
    ];
    console.log(new Date(), lastUpdateDate, nowUpdateDate);
    if (nowUpdateDate !== lastUpdateDate) {
        lastUpdateDate = nowUpdateDate;
        if (textInfo === lastTextInfo && lastMessageId) {
            await editMessage(
                lastMessageId,
                textInfo
                    // .replaceAll('<strong>','*')
                    // .replaceAll('</strong>','*')
                    .replace(/<[^>]*>/gi, '')
                    // .replace(HIDE_INFO_TEXT, '') + 
                    +
                'Данні оновлено: \n' + 
                thsStartUpdateDate + '\n' + nowUpdateDate
            );
            console.log('edit message', lastMessageId)
        }
        else {
            const messageReturn = await sendMessage(
                textInfo
                    // .replaceAll('<strong>','*')
                    // .replaceAll('</strong>','*')
                    .replace(/<[^>]*>/gi, '')
                    // .replace(HIDE_INFO_TEXT, '') + 
                    +
                'Данні оновлено: \n' + 
                nowUpdateDate
            );
            lastMessageId = messageReturn?.data?.result?.message_id || 0;
            lastTextInfo = textInfo;
            thsStartUpdateDate = nowUpdateDate;
            console.log('send message', lastMessageId);
        }
    }

    const photoWithBorder = await addWhiteBorderToImage(screenshotBuffer, PHOTO_WHITE_BORDER_SIZE);
    const photoWithBorder2 = await addWhiteBorderToImage(screenshotBuffer2, PHOTO_WHITE_BORDER_SIZE);
    sendPhoto(photoWithBorder);
    sendPhoto(photoWithBorder2);

    console.log('main end');
}

await main();




console.log('end');