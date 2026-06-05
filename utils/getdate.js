import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PLUGIN_ROOT = path.join(process.cwd(), 'plugins/logier-plugin');

export function pluginAssetUrl(relativePath) {
    return pathToFileURL(path.join(PLUGIN_ROOT, relativePath)).href;
}

const GALLERY_DIR = path.join(PLUGIN_ROOT, 'resources/gallery');

/** 仅从插件本地 gallery 取背景图，不访问任何外部 API */
export async function getLocalGalleryImage() {
    const imageUrl = await getRandomUrl(GALLERY_DIR);
    return toLocalFileUrl(imageUrl);
}

export async function readAndParseJSON(filePath) {
    try {
        const fileContent = await fs.promises.readFile(path.join(__dirname, filePath), 'utf8');
        return JSON.parse(fileContent);
    } catch (e) {
        logger.info('[鸢尾花插件]json读取失败') ;
    }
}

export function getTimeOfDay() {
    let date = new Date();
    let hours = date.getHours();

    let timeOfDay;
    if (hours >= 0 && hours < 6) {
        timeOfDay = '凌晨';
    } else if (hours >= 6 && hours < 12) {
        timeOfDay = '上午';
    } else if (hours >= 12 && hours < 18) {
        timeOfDay = '下午';
    } else {
        timeOfDay = '晚上';
    }

    return timeOfDay;
  }



export async function numToChinese(num) {
    const units = ['', '十', '百', '千'];
    const nums = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
    let result = '';
    const strNum = num.toString();
    const len = strNum.length;
    for(let i = 0; i < len; i++) {
        const curNum = parseInt(strNum[i]);
        const unit = units[len - 1 - i];
        if(curNum === 0) {
            if(result.slice(-1) !== '零') {
                result += '零';
            }
        } else {
            result += nums[curNum] + unit;
        }
    }
    return result.replace(/零+$/, '');
}

async function getAllImageFiles(dirPath, imageFiles = []) {
    let files = fs.readdirSync(dirPath);

    for (let i = 0; i < files.length; i++) {
        let filePath = path.join(dirPath, files[i]);

        if (fs.statSync(filePath).isDirectory()) {
            imageFiles = await getAllImageFiles(filePath, imageFiles);
        } else if (['.jpg', '.png', '.gif', '.jpeg', '.webp'].includes(path.extname(filePath))) {
            imageFiles.push(filePath);
        }
    }

    return imageFiles;
}

export async function getRandomUrl(imageUrls) {
    let imageUrl;

    if (Array.isArray(imageUrls)) {
        imageUrl = imageUrls[Math.floor(Math.random() * imageUrls.length)];
    } else {
        imageUrl = imageUrls;
    }

    if (fs.existsSync(imageUrl) && fs.lstatSync(imageUrl).isDirectory()) {
        let imageFiles = await getAllImageFiles(imageUrl);

        if (imageFiles.length > 0) {
            imageUrl = imageFiles[Math.floor(Math.random() * imageFiles.length)];
        }
    }

    return imageUrl;
}

function toLocalFileUrl(imageUrl) {
    if (fs.existsSync(imageUrl)) {
        return pathToFileURL(path.resolve(imageUrl)).href;
    }
    return pathToFileURL(path.join(GALLERY_DIR, '92095127.webp')).href;
}