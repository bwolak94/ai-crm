import { type Page, type Locator } from '@playwright/test';

export class ContactDetailPage {
  readonly page: Page;
  readonly contactForm: Locator;
  readonly contactFormSubmit: Locator;
  readonly deleteButton: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.contactForm = page.getByTestId('contact-form');
    this.contactFormSubmit = page.getByTestId('contact-form-submit');
    this.deleteButton = page.getByTestId('delete-contact-btn');
    this.nameInput = page.getByLabel(/name/i).first();
    this.emailInput = page.getByLabel(/email/i).first();
  }

  async updateName(newName: string) {
    await this.nameInput.clear();
    await this.nameInput.fill(newName);
    await this.contactFormSubmit.click();
  }

  async deleteContact() {
    await this.deleteButton.click();
  }
}
