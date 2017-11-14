import { browser, by, element, Ptor } from 'protractor';
import { passwords } from './../MY-PASSWORDS';

describe('telebot3000 App (to PBX Endpoint)', () => {

  const ICON_IN_TALK = 'phone_in_talk';
  const ICON_ENDED = 'call_end';

  beforeEach(async () => {

    // We will no take ngZone in consideration ;)
    browser.waitForAngularEnabled(false);

    // Go to config page
    await browser.get('/config');

    element(by.css('input[formControlName=wsuri]')).sendKeys('wss://oasis-dev.irontec.com:10081');
    element(by.css('input[formControlName=sipuri]')).sendKeys('webphone@oasis-dev.irontec.com');
    element(by.css('input[formControlName=password]')).sendKeys(passwords['webphone'].pwd);

    element(by.css('.mat-expansion-panel-header')).click();
    await browser.sleep(1000);
    element(by.css('textarea[formControlName=stuns]')).sendKeys('stun:stun.l.google.com:19302\nstun:stun1.l.google.com:19302');
    element(by.css('textarea[formControlName=azurekeys]')).sendKeys(passwords['webphone'].keys.join('\n'));



    element(by.css('button.connect')).click();
    await browser.sleep(2000);

  });

  describe('Basic connection to oasis-dev endpoint', () => {
    it('should connect to remote endpoint', async () => {

      expect(
        await element(by.css('mat-icon.ok')).isDisplayed()
      ).toBeTruthy();
    });
  });

  describe('Irontec PBX should hangup on 666 DTMF', () => {

    const irontecDDI = '944048182';

    it('should *not* hangup when 66 is dialed (within the next 1000ms)', async () => {

      // We go to the dial screen:
      // 1. show navigation menu
      element(by.css('.mat-toolbar-row button.mat-icon-button')).click();
      browser.sleep(750);
      // 2. click first options
      element(by.css('.navigationMenu button[routerlink=phone]')).click();
      // 3. wait for route to settle
      browser.sleep(750);


      // 1. dial number
      await element(by.css('div.target input')).sendKeys(irontecDDI);
      // 2. Do the call

      await element(by.css('button.caller')).click();

      browser.sleep(1500);

      // We wait (at most) 1 seconds to have the callItem element
      const currentCallingNumber = await element(by.css('h4.ddi')).getText();
      expect(currentCallingNumber).toContain(irontecDDI);

      // We wait for 2 seconds so Irontec PBX answers us
      browser.sleep(2000);

      const statusIcon = await element(by.css('.statusIcon')).getText();
      expect(statusIcon).toEqual(ICON_IN_TALK);

      // click on the details button
      element(by.css('button.call-details')).click();

      // show dtmf menu
      element(by.css('.dtmf button')).click();
      // wait for menu to show up
      browser.sleep(750);

      // we press 3 times '5' DTMF button
      element(by.css('.dtmfMenu button[value="6"]')).click();
      browser.sleep(400);
      element(by.css('.dtmfMenu button[value="6"]')).click();


      // We expect the call to be alive in the next second
      await browser.sleep(3000);
      expect(await element(by.css('.statusIcon')).getText()).toEqual(ICON_IN_TALK);

    });

    it('should hangup when 666 is dialed (within the next 1000ms)', async () => {

      // We go to the dial screen:
      // 1. show navigation menu
      element(by.css('.mat-toolbar-row button.mat-icon-button')).click();
      browser.sleep(750);
      // 2. click first options
      element(by.css('.navigationMenu button[routerlink=phone]')).click();
      // 3. wait for route to settle
      browser.sleep(750);


      // 1. dial number
      element(by.css('div.target input')).sendKeys(irontecDDI);
      // 2. Do the call
      element(by.css('button.caller')).click();

      await browser.sleep(3000);

      // We wait (at most) 1 seconds to have the callItem element
      const currentCallingNumber = await element(by.css('h4.ddi')).getText();
      expect(currentCallingNumber).toContain(irontecDDI);

      // We wait for 2 seconds so Irontec PBX answers us
      browser.sleep(2000);

      const statusIcon = await element(by.css('.statusIcon')).getText();
      expect(statusIcon).toEqual(ICON_IN_TALK);

      // click on the details button
      element(by.css('button.call-details')).click();

      // show dtmf menu
      element(by.css('.dtmf button')).click();
      // wait for menu to show up
      browser.sleep(750);

      // we press 3 times '5' DTMF button
      element(by.css('.dtmfMenu button[value="6"]')).click();
      browser.sleep(400);
      element(by.css('.dtmfMenu button[value="6"]')).click();
      browser.sleep(400);
      element(by.css('.dtmfMenu button[value="6"]')).click();


      // We expect the call to be ended in the next second
      browser.sleep(1000);
      expect(await element(by.css('.statusIcon')).getText()).toEqual(ICON_ENDED);

    });
  });


});
