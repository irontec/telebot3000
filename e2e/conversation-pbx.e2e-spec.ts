import { browser, by, element, Ptor } from 'protractor';
import { passwords } from './../MY-PASSWORDS';

xdescribe('telebot3000 App (to PBX Endpoint)', () => {

    const ICON_IN_TALK = 'phone_in_talk';
    const ICON_ENDED = 'call_end';
    const ICON_RINGING = 'ring_volume';

    const WEBPHONE_DDI = '202';
    const WEBPHONE2_DDI = '201';

    let browser2, element2;

    beforeEach(async () => {



        // We will no take ngZone in consideration ;)
        browser.ignoreSynchronization = true;
        browser.waitForAngularEnabled(false);
        await browser.get('/config');

        browser2 = await browser.forkNewDriverInstance(true);
        browser2.ignoreSynchronization = true;
        browser2.waitForAngularEnabled(false);

        element2 = browser2.driver.findElement;


        // Go to config page
        // Browser1
        element(by.css('input[formControlName=wsuri]')).sendKeys('wss://oasis-dev.irontec.com:10081');
        element(by.css('input[formControlName=sipuri]')).sendKeys('webphone@oasis-dev.irontec.com');
        element(by.css('input[formControlName=password]')).sendKeys(passwords['webphone'].pwd);

        element(by.css('.mat-expansion-panel-header')).click();
        await browser.sleep(1000);
        element(by.css('textarea[formControlName=stuns]')).sendKeys('stun:stun.l.google.com:19302\nstun:stun1.l.google.com:19302');
        element(by.css('textarea[formControlName=azurekeys]')).sendKeys(passwords['webphone'].keys.join('\n'));

        element(by.css('button.connect')).click();

        // Browser2
        await browser2.get('/config');

        browser2.$('input[formControlName=wsuri]').sendKeys('wss://oasis-dev.irontec.com:10081');
        browser2.$('input[formControlName=sipuri]').sendKeys('webphone2@oasis-dev.irontec.com');
        browser2.$('input[formControlName=password]').sendKeys(passwords['webphone2'].pwd);

        browser2.$('.mat-expansion-panel-header').click();
        await browser2.sleep(1000);
        browser2.$('textarea[formControlName=stuns]').sendKeys('stun:stun.l.google.com:19302\nstun:stun1.l.google.com:19302');
        browser2.$('textarea[formControlName=azurekeys]').sendKeys(passwords['webphone2'].keys.join('\n'));

        browser2.$('button.connect').click();
        await browser2.sleep(2000);

    });

    describe('Basic conversation between 2 endpoints', () => {
        xit('both browser should connect to remote endpoint', async () => {
            expect(
                await element(by.css('mat-icon.ok')).isDisplayed()
            ).toBeTruthy();

            expect(
                await element2(by.css('mat-icon.ok')).isDisplayed()
            ).toBeTruthy();
        });

        it('webphone2 should get incoming call when webphone dials 201, and understand "congrio rojo"', async () => {

            browser.waitForAngularEnabled(false);
            browser2.waitForAngularEnabled(false);

            // Webphone goes to phone page
            element(by.css('.mat-toolbar-row button.mat-icon-button')).click();
            browser.sleep(750);
            // 2. click first options
            element(by.css('.navigationMenu button[routerlink=phone]')).click();
            // 3. wait for route to settle
            browser.sleep(750);

            // 1. dial number
            await element(by.css('div.target input')).sendKeys(WEBPHONE2_DDI);
            // 2. Do the call
            await element(by.css('button.caller')).click();

            // wait for 5 seconds
            browser.sleep(2000);

            const statusIcon = await browser2.$('.statusIcon').getText();
            expect(statusIcon).toEqual(ICON_RINGING);

            // Answer call
            browser2.$('button.answer').click();

            // wait 1 second
            browser.sleep(1500);
            element(by.css('button.callDetails')).click();
            browser2.$('button.callDetails').click();

            // go to call-details in both softphones
            browser.sleep(800);

            browser2.$('button.toggleSpeaker').click();
            element(by.css('button.toggleSpeaker')).click();

            browser2.$('button.toggleMic').click();
            element(by.css('button.toggleMic')).click();

            element(by.css('input.sentence')).sendKeys('congrio rojo. congrio rojo. congrio rojo');
            browser.sleep(4000);
            element(by.css('button.speakIt')).click();
            browser.sleep(12000);

            const listenedText = (await browser2.$$('div.words p').getText()).join(' ');
            expect(
                listenedText.indexOf('congrio') !== -1 && listenedText.indexOf('rojo') !== -1
            ).toBeTruthy();

        });

    });





});
