import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { currentGitBranch, isMasterGitBranchOrNotFound, getFilesInFolderByMask } from './helpersFunctions.js';

//определяем есть ли отдельный .env.* файл для текущей ветки
const branchName = currentGitBranch();
let branchEnvFile = `.env.${branchName}`;
if (!fs.existsSync(branchEnvFile)) {
    branchEnvFile = (!fs.existsSync('.env.test')) ? '.env.test' : '.env';
    // если не существует тестового файла то попробовать загрузить обычный файл
}

// в случае если ветка не master/main то использовать .env.test (или .env.<branch>)
const envFile = isMasterGitBranchOrNotFound() ? '.env' : branchEnvFile;
if (!fs.existsSync(envFile)) {
    const envFileList = getFilesInFolderByMask('./', /^\.env/)
    throw Error(`Подходящий .env файл не найден!\nСписок доступных .env.* файлов:\n${envFileList.join('\n')}\n`);
}

dotenv.config({ path: envFile });

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

const DEFAULT_CITY = 'м. Київ';
const CITY = process.env.CITY || DEFAULT_CITY;
const STREET = process.env.STREET;
const HOUSE = process.env.HOUSE;
const APPEND_WEEK_DAYS = (process.env.APPEND_WEEK_DAYS === 'true');

const SEND_EMPTY_SHUDOWN_DAY = (process.env.SEND_EMPTY_SHUDOWN_DAY === 'true');

const USE_CUSTOM_STYLING = (process.env.USE_CUSTOM_STYLING === 'true');

let customStyleText = '';
if (USE_CUSTOM_STYLING) {
    const customStylePath = path.resolve(
        path.dirname(fileURLToPath(import.meta.url)),
        'customPageStyle.css'
    )
    if (fs.existsSync(customStylePath)) {
        customStyleText = fs.readFileSync(customStylePath, 'utf-8');
    }
    else {
        console.warn('Custom style file not found at:', customStylePath);
    }
}  
const CUSTOM_STYLE_TEXT = customStyleText;

const PHOTO_WHITE_BORDER_SIZE = 20;
const TYPE_DELAY = 120;

const DETEK_LINK = 'https://www.dtek-kem.com.ua/ua/shutdowns';
const DETEK_KREM_LINK = 'https://www.dtek-krem.com.ua/ua/shutdowns';

const UPDATE_DATE_SPLITER = 'Дата оновлення інформації – ';

const HIDE_INFO_TEXT_ARRAY = [
    `У разі відсутності світла у зоні, що гарантує його наявність (на графіку – білий колір), оформіть заявку нижче.\n`,
    `Просимо перевірити інформацію через 15 хвилин, саме стільки часу потрібно для оновлення даних на сайті.`,
    `\n\nУвага!\nГрафіки стабілізаційних відключень не діють. Час відновлення світла може змінюватись відповідно до ситуації в енергосистемі та команд НЕК Укренерго`,
];

const SHUTDONW_TEXT = `За вашою адресою в даний момент відсутня електроенергія`

const PREFIX_EMOJI = {
    NOT_SHUTDOWN: '✅ ',
    SHUTDOWN: '❌ ',
    LIGHTNING: '⚡ ',
}


export {
    TELEGRAM_BOT_TOKEN,
    CHAT_ID, 
    DEFAULT_CITY,
    CITY,
    STREET,
    HOUSE,
    APPEND_WEEK_DAYS,
    SEND_EMPTY_SHUDOWN_DAY,
    USE_CUSTOM_STYLING,
    CUSTOM_STYLE_TEXT,
    PHOTO_WHITE_BORDER_SIZE,
    TYPE_DELAY,
    DETEK_LINK,
    DETEK_KREM_LINK,
    UPDATE_DATE_SPLITER,
    HIDE_INFO_TEXT_ARRAY,
    SHUTDONW_TEXT,
    PREFIX_EMOJI,
};
