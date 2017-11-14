import { browser, by, element, Ptor } from 'protractor';
import { passwords } from './../MY-PASSWORDS';

fdescribe('telebot3000 App (to PBX Endpoint)', () => {

  const ICON_IN_TALK = 'phone_in_talk';
  const ICON_ENDED = 'call_end';
  const ICON_RINGING = 'ring_volume';

  const WEBPHONE_DDI = '202';
  const WEBPHONE2_DDI = '201';

  let browser2, element2, by2;

  beforeEach(async () => {


    await browser.get('/config');

    // We will no take ngZone in consideration ;)

    browser2 = browser.forkNewDriverInstance();

    browser.waitForAngularEnabled(false);
    browser2.waitForAngularEnabled(false);


    element2 = browser2.element;
    by2 = browser2.by;

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
        await browser2.$('mat-icon.ok').isDisplayed()
      ).toBeTruthy();
    });

    it('webphone2 should get incoming call when webphone dials 201', async () => {

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
      browser.sleep(10000);

      const statusIcon = await browser2.$('.statusIcon').getText();
      expect(statusIcon).toEqual(ICON_RINGING);

      // Answer call
      browser2.$('button.answer').click();

      // wait 1 second
      browser.sleep(1000);

      // go to call-details in both softphones

      browser2.$('button.call-details').click();
      element(by.css('button.call-details')).click();


      browser.sleep(1000);

      browser2.$('button.toggleSpeaker').click();
      element(by.css('button.toggleSpeaker')).click();

      browser2.$('button.toggleMic').click();
      element(by.css('button.toggleMic')).click();

      browser.sleep(10000);



    });

  });


  xdescribe('Irontec PBX should hangup on 666 DTMF', () => {

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

      // we press 3 times '6' DTMF button
      element(by.css('.dtmfMenu button[value="6"]')).click();
      browser.sleep(400);
      element(by.css('.dtmfMenu button[value="6"]')).click();
      browser.sleep(400);
      element(by.css('.dtmfMenu button[value="6"]')).click();


      // We expect the call to be ended in the next second
      browser.sleep(1000);
      expect(await element(by.css('.statusIcon')).getText()).toEqual(ICON_ENDED);


      browser.sleep(3000);


    });
  });



});
