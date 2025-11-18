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

const lastHTMLFragments = ['', ''];



async function main() {
    console.log('main start');
    const {textInfoFull, graphics} = await getDetekData(STREET, HOUSE);
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

    graphics.forEach(async ({screenshotBuffer, htmlFragment}, index) => {
        if (htmlFragment === lastHTMLFragments[index]) {
            console.log('skip photo send index', index);
            return;
        }
        const photoWithBorder = await addWhiteBorderToImage(screenshotBuffer, PHOTO_WHITE_BORDER_SIZE);
        await sendPhoto(photoWithBorder, `detek_${index}_${Date.now()}.png`);
        lastHTMLFragments[index] = htmlFragment;
        console.log('send photo index', index);
    });
    

    console.log('main end');
}

await main();


const rule = new schedule.RecurrenceRule();
rule.minute = new schedule.Range(0, 59, 5); //кожні (остання цифра) хвилин
const medocJob = schedule.scheduleJob(rule, main);

console.log('end');