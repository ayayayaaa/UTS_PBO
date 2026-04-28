import { LibraryItem } from "./LibraryItem.js";
import type { Borrowable } from "../interfaces/Borrowable.js";
import type { ItemCategory } from "../types/index.js";

export class Book extends LibraryItem implements Borrowable {
  private author: string;
  private totalCopies: number;
  private availableCopies: number;
  private borrowCount: number = 0;

  constructor(
    itemId: string,
    title: string,
    year: number,
    author: string,
    totalCopies: number
  ) {
    super(itemId, title, year);
    this.author = author;
    this.totalCopies = totalCopies;
    this.availableCopies = totalCopies;
  }

  getAuthor(): string {
    return this.author;
  }

  getAvailableCopies(): number {
    return this.availableCopies;
  }

  isAvailable(): boolean {
    return this.availableCopies > 0;
  }

  borrow(): boolean {
    if (!this.isAvailable()) return false;
    this.availableCopies--;
    this.borrowCount++;
    return true;
  }

  returnItem(): void {
  if (this.availableCopies < this.totalCopies) {
    this.availableCopies++;
  }
}

  getBorrowCount(): number {
    return this.borrowCount;
  }

  getCategory(): ItemCategory {
    return "book";
  }

  getDescription(): string {
    return `${this.title} by ${this.author} (${this.availableCopies}/${this.totalCopies} tersedia)`;
  }
}