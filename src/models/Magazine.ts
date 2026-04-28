import { LibraryItem } from "./LibraryItem.js";
import type { Borrowable } from "../interfaces/Borrowable.js";
import type { ItemCategory } from "../types/index.js";

export class Magazine extends LibraryItem implements Borrowable {
  private publisher: string;
  public readonly issueNumber: number;
  private available: boolean = true;
  private borrowCount: number = 0;

  constructor(
  itemId: string,
  title: string,
  year: number,
  publisher: string,
  issueNumber: number
) {
  super(itemId, title, year);
  this.publisher = publisher;
  this.issueNumber = issueNumber;
  Object.defineProperty(this, "issueNumber", {
    value: issueNumber,
    writable: false,
    configurable: false,
  });
}

  isAvailable(): boolean {
    return this.available;
  }

  borrow(): boolean {
    if (!this.available) return false;
    this.available = false;
    this.borrowCount++;
    return true;
  }

  returnItem(): void {
    this.available = true;
  }

  getBorrowCount(): number {
    return this.borrowCount;
  }

  getCategory(): ItemCategory {
    return "magazine";
  }

  getDescription(): string {
    return `${this.title} edisi ${this.issueNumber} oleh ${this.publisher}`;
  }
}