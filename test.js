console.log('start');

import schedule from 'node-schedule';

import {
    STREET,
    HOUSE,
    PHOTO_WHITE_BORDER_SIZE,
    UPDATE_DATE_SPLITER,
    HIDE_INFO_TEXT,
} from './globals.js';

import {
    sendPhoto,
    sendMessage,
    editMessage,
} from './telegramBotFunctions.js';

import {
    addWhiteBorderToImage,
    delay,
} from './helpersFunctions.js';

import {
    getDetekData,
} from './puppeteerFunctions.js';

let lastUpdateDate = '00:00 00.00.0000';
let thisStartUpdateDate = '00:00 00.00.0000';
let lastTextInfo = '';
let lastMessageId = 0;



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
                thisStartUpdateDate + '\n' + nowUpdateDate
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
            thisStartUpdateDate = nowUpdateDate;
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