import axios from "axios";
import puppeteer from "puppeteer";
import users from "../../user.mjs";
import fs from "fs"
let imgSrc;
let count = 0;
let browser;
let page;
let captchaCode;
let checkFalse = 0;
const getHomePage = async (req, ress) => {

    if (count == users.length - 1) {
        ress.redirect('/done')
    }
    try {
        browser = await puppeteer.launch({ headless: false })
        page = await browser.newPage();
        await page.setViewport({ width: 1600, height: 900 })
        await page.goto('https://nohu82.com');
        // await page.waitForSelector('.btn.btn-link');
        // await page.click('.btn.btn-link');
        // await page.waitForSelector('.ng-scope span[ng-click="$ctrl.ok()"][translate="Common_Closed"]');
        // await page.click('.ng-scope span[ng-click="$ctrl.ok()"][translate="Common_Closed"]');
        page.waitForTimeout(1000)
        await page.evaluate(() => {
            const button = document.querySelector('button[ng-click="$ctrl.openLoginModal()"]');
            const clickEvent = new Event('click', { bubbles: true });
            button.dispatchEvent(clickEvent);
        });
        await page.waitForTimeout(1000)
        await page.type('input[ng-model="$ctrl.user.account.value"]', users[count].userName)
        await page.type('input[ng-model="$ctrl.user.password.value"]', users[count].passWord)
        await page.type('input[ng-model="$ctrl.code"]', "")
        await page.waitForTimeout(1000)
        await getBase64(req, ress);
    } catch (error) {
        await browser.close()
        checkFalse = 1;
        ress.redirect('/')
    }
}

const getBase64 = async (req, res) => {
    imgSrc = await page.$eval('img.dVSNlKsQ1qaz1uSto7bNM', img => img.getAttribute('src'));
    imgSrc = imgSrc.toString().replace('data:image/png;base64,', '')
    handleBase64(req, res)
}

const handleBase64 = async (req, ress) => {
    const data = new URLSearchParams();
    data.append('method', 'base64');
    data.append('key', "d1448890138e20f62555edafc3c33cb5");
    data.append('body', imgSrc);
    const apiKey = "d1448890138e20f62555edafc3c33cb5"
    await axios.post('https://2captcha.com/in.php', data)
        .then((res) => {
            const checkUrl = `https://2captcha.com/res.php?key=${apiKey}&action=get&id=${Number(res.data.replace('OK|', ''))}`;
            setTimeout(() => {
                axios.get(checkUrl)
                    .then((res) => {
                        captchaCode = res.data.replace('OK|', '')//captchaCode
                        ress.redirect('/postData')
                    })
            }, 8000)
        })
}

const postData = async (req, res) => {

    try {
        await (async () => {
            await page.type('input[ng-model="$ctrl.code"]', captchaCode)
            await page.waitForSelector('button[type="submit"][ng-disabled="$ctrl.loginPending"]');
            await page.click('button[type="submit"][ng-disabled="$ctrl.loginPending"]');
            await page.waitForTimeout(500)


            const getBalanceAccount = async () => {
                console.log(`tool dang chay den count : ${count} , account : ${users[count].userName} \n`)
                await page.waitForSelector('span.balance.ng-binding.HU9oLicjLil3hDKujppTr');
                const element = await page.$('span.balance.ng-binding.HU9oLicjLil3hDKujppTr');
                if (element) {
                    const textContent = await page.evaluate(element => element.textContent, element);
                    return textContent;
                } else {
                    console.error('Không tìm thấy phần tử.');
                }
            }

            const closeTab = async () => {
                await page.evaluate(() => {
                    let closeButton = document.querySelector('button[translate="RedEnvelope_Close"]');
                    if (closeButton) {
                        closeButton.click();
                    } else {
                        console.error("Không tìm thấy phần tử để click");
                    }
                });
            }
            await page.evaluate(() => {
                let closeButton = document.querySelector('div.m6St-e1wM0x21-4b5uLpn.ng-scope[translate="RedEnvelope_GrabEenvelope"]');
                if (closeButton) {
                    closeButton.click();
                } else {
                    console.error("Không tìm thấy phần tử để click");
                }
            });
            const spanText = await page.evaluate(() => {
                const spanElement = document.querySelector('span.gSzr4CypKJcHsURkQtHL1.ng-scope[translate="RedEnvelope_ReceiveAmountTip"]');

                if (spanElement) {
                    return spanElement.textContent.trim().split(" ")[2]
                } else {
                    return 0
                }
            });

            let quantityOfEnvelopes = Number(spanText)
            console.log(quantityOfEnvelopes);
            if (quantityOfEnvelopes === 0) {
                console.log(`khong co li xi nao de nhan o acc nay`)
                console.log('')
                fs.appendFileSync('../../toolAuto/result.txt', `so du ${users[count].userName} :  ${await getBalanceAccount()} \n`)
            }

            const getCoin = async () => {
                await page.waitForSelector('img[ng-src="https://haon-jpnext.cdn-bebo.com/system-requirement/Web.PortalNew/UA531-01/8efe89d90d/images/da64f917d8eced48bf1c10e83be937f8.png"]');
                await page.evaluate(() => {
                    const element = document.querySelector('img[ng-src="https://haon-jpnext.cdn-bebo.com/system-requirement/Web.PortalNew/UA531-01/8efe89d90d/images/da64f917d8eced48bf1c10e83be937f8.png"]');
                    if (element) {
                        element.click();
                    } else {
                        console.error('Không tìm thấy phần tử để click');
                    }
                });

                await page.waitForTimeout(500);
                await page.waitForSelector('button[ng-click="$ctrl.remove(redEnvelope)"][translate="RedEnvelope_Withdraw"].ng-scope:not([ng-disabled="true"])')
                await page.evaluate(() => {
                    const button = document.querySelector('button[ng-click="$ctrl.remove(redEnvelope)"][translate="RedEnvelope_Withdraw"].ng-scope:not([ng-disabled="true"])');
                    if (button) {
                        button.click();
                    } else {
                        console.error("Không tìm thấy phần tử để click");
                    }
                });
            }

            if (quantityOfEnvelopes === 1) {
                console.log(`acc nay co 1 li xi`);
                console.log('')
                await getCoin()
                await closeTab()
                fs.appendFileSync('../../toolAuto/result.txt', `so du ${users[count].userName} :  ${await getBalanceAccount()} \n`)
            }


            const getCoinMoreThanOne = async () => {
                if (!isNaN(quantityOfEnvelopes) && quantityOfEnvelopes >= 1) {
                    await getCoin();
                    quantityOfEnvelopes--;
                    await getCoinMoreThanOne()
                } else {
                    await closeTab()
                    fs.appendFileSync('../../toolAuto/result.txt', `so du ${users[count].userName} :  ${await getBalanceAccount()} \n`)
                }
            }

            if (!isNaN(quantityOfEnvelopes) && quantityOfEnvelopes > 1) {
                console.log(`acc nay co ${quantityOfEnvelopes} li xi de nhan`)
                console.log('')
                await getCoinMoreThanOne()
            }
        })();
        await browser.close()
        count++
        res.redirect('/')
    } catch (error) {
        await browser.close()
        res.redirect('/')
    }


}
const Controler = {
    getHomePage: getHomePage,
    postData: postData,

}

export default Controler