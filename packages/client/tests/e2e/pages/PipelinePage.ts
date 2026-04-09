import { type Page, type Locator } from '@playwright/test';

export class PipelinePage {
  readonly page: Page;
  readonly createDealButton: Locator;
  readonly dealCards: Locator;

  constructor(page: Page) {
    this.page = page;
    this.createDealButton = page.getByTestId('create-deal-btn');
    this.dealCards = page.getByTestId('deal-card');
  }

  async goto() {
    await this.page.goto('/app/pipeline');
  }

  column(stage: string): Locator {
    return this.page.getByTestId(`pipeline-column-${stage}`);
  }

  dealsInColumn(stage: string): Locator {
    return this.column(stage).getByTestId('deal-card');
  }
}
