import { AppPage } from './app.po';

xdescribe('telebot3000 App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();

  });
});
