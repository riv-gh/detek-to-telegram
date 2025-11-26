import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
/**
 * Добавляет белые края к изображению из буфера
 * @param {Buffer} imageBuffer - исходное изображение
 * @param {number} padding - размер отступа (px)
 * @returns {Buffer} - новое изображение с белыми краями
 */
async function addWhiteBorderToImage(imageBuffer, padding = 20) {
    const img = sharp(imageBuffer);

    // Получаем размеры исходного изображения
    const metadata = await img.metadata();

    // Создаём белый фон большего размера
    const extended = await img
        .extend({
            top: padding,
            bottom: padding,
            left: padding,
            right: padding,
            background: { r: 255, g: 255, b: 255, alpha: 1 }, // белый цвет
        })
        .toBuffer();

    return extended;
}

/**
 * Дает задержку в милисикундах через Promise
 * @param {number} ms - задержка в милисекундах
 */
function delay(ms) {
    return new Promise(res => setTimeout(res, ms));
}


/**
 * Экранирует специальные символы MarkdownV2 в тексте
 * @param {string} text - входящий текст
 * @returns {string} - текст с экранированными символами
 */
function escapeMarkdownV2(text) {
    // список спецсимволов, которые нужно экранировать
    const escapeChars = [
        '_', '*', '[', ']', '(', ')', '~', '`', '>', '#',
        '+', '-', '=', '|', '{', '}', '.', '!'
    ];

    let escaped = text;
    escapeChars.forEach(char => {
        const regex = new RegExp(`\\${char}`, 'g'); // ищем все вхождения
        escaped = escaped.replace(regex, `\\${char}`); // добавляем обратный слэш
    });

    return escaped;
}

/**
 * віделение по регулярному выражению в тексте для MarkdownV2
 * @param {string} inputText - входящий текст
 * @param {RegExp} [regex=/\b([0-2]\d:[0-5]\d)\b/g] - регулярное выражение для поиска
 * (по умолчанию время в формате HH:MM)
 * @param {string} [highlightTpl='__*$1*__'] - шаблон для выделения (по умолчанию __*$1*__)
 * @returns {string} - текст с выделенными данными в формате MarkdownV2
 */
function highlightDatesMarkdown(
    inputText,
    regex = /\b([0-2]\d:[0-5]\d)\b/g,
    highlightTpl = '__*$1*__'
) {
    // Заменяем найденные совпадения на выделенные в Markdown
    return escapeMarkdownV2(inputText).replace(regex, highlightTpl);
}

/** * Удаляет из текста указанные подстроки
 * @param {string} inputText - входящий текст
 * @param {string[]} substrings - массив подстрок для удаления
 * @returns {string} - текст с удалёнными подстроками
 */
function removeSubstrings(inputText, substrings) {
    substrings.forEach(substring => {
        inputText = inputText.replace(substring, '');
    });
    return inputText;
}

/** * Получает название текущий ветки в git
 * @returns {string} - название ветки или 'not_found' если что-то пошло не так
 */
function currentGitBranch() {
    let branch = 'not_found';
    try {
        branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
        console.log(`Текущая ветка: ${branch}`);
    } catch (err) {
        console.error('Не удалось определить ветку:', err.message);
    }
    return branch;
}

/** * Проверка является ли ветка main|master|not_found 
 * @param {string} inputBranch - название текущей ветки если нет попытается выполнить currentGitBranch()
 * @returns {boolean} - подходит ли ветка
 */
function isMasterGitBranchOrNotFound(inputBranch = '') {
    const branch = inputBranch || currentGitBranch();
    return (branch === 'main' || branch === 'master' || branch === 'not_found');
}

/** * Удаляет из текста указанные подстроки
 * @param {string} dir - строка пути к папке
 * @param {RegExp} mask - маска для поиска
 * @returns {string[]} - список файлов в папке подхдящих под маску
 */
function getFilesInFolderByMask(dir, mask) {
    const files = 
        fs.readdirSync(dir)
        .filter(file => mask.test(file))
        .map(file => path.join(dir, file));
    return files;
}


export {
    addWhiteBorderToImage,
    delay,
    escapeMarkdownV2,
    highlightDatesMarkdown,
    removeSubstrings,
    currentGitBranch,
    isMasterGitBranchOrNotFound,
    getFilesInFolderByMask,
};