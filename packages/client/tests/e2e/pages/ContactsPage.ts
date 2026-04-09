import { type Page, type Locator } from '@playwright/test';

export class ContactsPage {
  readonly page: Page;
  readonly contactList: Locator;
  readonly contactItems: Locator;
  readonly createButton: Locator;
  readonly contactForm: Locator;
  readonly contactFormSubmit: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly companyInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.contactList = page.getByTestId('contact-list');
    this.contactItems = page.getByTestId('contact-list-item');
    this.createButton = page.getByTestId('create-contact-btn');
    this.contactForm = page.getByTestId('contact-form');
    this.contactFormSubmit = page.getByTestId('contact-form-submit');
    this.nameInput = page.getByLabel(/name/i).first();
    this.emailInput = page.getByLabel(/email/i).first();
    this.phoneInput = page.getByLabel(/phone/i).first();
    this.companyInput = page.getByLabel(/company/i).first();
  }

  async goto() {
    await this.page.goto('/app/contacts');
  }

  async createContact(data: { name: string; email: string; phone?: string; company?: string }) {
    await this.createButton.click();
    await this.contactForm.waitFor({ state: 'visible' });
    await this.nameInput.fill(data.name);
    await this.emailInput.fill(data.email);
    if (data.phone) await this.phoneInput.fill(data.phone);
    if (data.company) await this.companyInput.fill(data.company);
    await this.contactFormSubmit.click();
  }

  async clickContact(name: string) {
    await this.contactItems.filter({ hasText: name }).first().click();
  }

  contactByName(name: string): Locator {
    return this.contactItems.filter({ hasText: name });
  }
}
