import { Browser, Page } from "puppeteer";
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { fakerEN } from '@faker-js/faker';
import { generate } from 'generate-password';

puppeteer.use(StealthPlugin());

//注册网址
const registerUrl = 'https://accounts.google.com/SignUp'

type Context = {
    browser: Browser,
    page: Page
}

const Gender = [
    'Male',
    'Female',
    'Rather not say',
    'Custom'
];

async function main()
{
    const proxy = await getProxy();
    console.log(`代理: ${JSON.stringify(proxy)}`);
    const browser = await puppeteer.launch({
        headless: false,
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        args: [
            '--lang=en-US,en',
            `--proxy-server=http://${proxy.ip}:${proxy.port}`,
            '--no-sandbox',
            '--disable-setuid-sandbox',
        ]
    });
    const testPage = await browser.newPage();
    await testPage.authenticate({
        username: proxy.username,
        password: proxy.password
    })
    // 测试代理是否工作
    try {
        await testPage.goto('https://api.ipify.org?format=json');
        const content = await testPage.content();
        const ipMatch = content.match(/"ip":"([^"]+)"/);
        if (ipMatch) {
            console.log('Current IP:', ipMatch[1]);
        }
    } catch (error) {
        throw new Error('Proxy test failed: ' + error);
    }
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');
    await page.authenticate({
        username: proxy.username,
        password: proxy.password
    })
    await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9'
    });
    await wait();  // 使用您现有的 wait 函数
    await page.goto(registerUrl);
    const context: Context = {
        browser,
        page
    };
    try {
        await step1(context);
        await step2(context);
        await step3(context);
        await step4(context);
    } catch (error) {
        console.error(error);
    }
    // await browser.close()
}

//设置账号的用户姓名
async function step1(context: Context)
{
    const { page } = context;
    //找到页面中的form表单
    const form = await page.$('form');
    if (!form) {
        throw new Error('step1: form not found');
    }
    //找到form表单中的input元素
    const inputs = await form.$$('input');
    await wait();
    //id: firstName
    await inputs[0].type(fakerEN.person.firstName());
    await wait();
    //id: lastName
    await inputs[1].type(fakerEN.person.lastName());
    await wait();
    //提交
    await page.click('button');
    // 等待页面加载完成
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
}

//设置账号的生日和性别
async function step2(context: Context)
{
    const { page } = context;
    await wait();
    //找到页面中的form表单
    const form = await page.$('form');
    if (!form) {
        throw new Error('step2: form not found');
    }
    //找到form表单中的input元素 day和year是input，month和性别是select
    const inputs = await form.$$('input');
    const selects = await form.$$('select');
    await wait();
    // 获取一个生日
    const birthday = fakerEN.date.birthdate({ min: 18, max: 30, mode: 'age' });
    console.log(birthday);

    //id: day
    await inputs[0].type(birthday.getDate().toString());
    await wait();
    //id: month
    await selects[0].select(birthday.getMonth().toString());
    await wait();
    //id: year
    await inputs[1].type(birthday.getFullYear().toString());
    await wait();
    //id: gender 随机选择一个性别 （1 or 2）
    await selects[1].select(Math.ceil(Math.random() * 2).toString());
    await wait();
    //提交
    await page.click('button');
    // 等待页面加载完成
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
}

//选择一个推荐的email
async function step3(context: Context)
{
    const { page } = context;
    await page.waitForSelector('[role=radio]');
    const radios = await page.$$('[role=radio]');
    if (radios.length > 0) {
        // google给到的推荐邮箱数量两个三个都有可能，所以这里为了不报错只取第一个
        const selectedRadio = radios[0];
        await selectedRadio.evaluate(el =>
        {
            if (el instanceof HTMLElement) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
        await wait();
        // Click using better targeting
        await selectedRadio.click({ delay: 100 });
    }
    await wait();
    await page.click('button');
    // 等待页面加载完成
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
}

//设置账号的密码
async function step4(context: Context)
{
    const { page } = context;
    //找到页面中的form表单
    const form = await page.$('form');
    if (!form) {
        throw new Error('step2: form not found');
    }
    const password = generate({
        length: 12,
        numbers: true,
        symbols: true,
        uppercase: true,
        excludeSimilarCharacters: true,
        strict: true
    });
    await wait();
    await page.waitForSelector('input[name=Passwd]');
    //id: password
    await page.type('input[name=Passwd]', password);
    await page.waitForSelector('input[name=PasswdAgain]');
    await wait();
    //id: confirmPassword
    await page.type('input[name=PasswdAgain]', password);
    await wait();
    //提交
    await page.click('button');
    // 等待页面加载完成
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
}

/**
 * @description 模拟真人 等待几秒 （1s - 3s）
 */
async function wait()
{
    await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 2000) + 1000));
}

/**
 * @description 获取一个代理
 * @returns 代理
 */
async function getProxy()
{
    return {
        username: "eaydtrgg",
        password: "mf0uyn4rtahs",
        ip: "161.123.152.115",
        port: 6360
    }
}


main();
