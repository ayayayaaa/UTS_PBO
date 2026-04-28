import type { ItemCategory } from "../types/index.js";

export abstract class LibraryItem {
  public readonly itemId: string;
  protected title: string;
  protected year: number;

  constructor(itemId: string, title: string, year: number) {
  if (new.target === LibraryItem) {
    throw new Error("LibraryItem adalah abstract class dan tidak bisa diinstansiasi langsung.");
  }
  this.itemId = itemId;
  this.title = title;
  this.year = year;
  Object.defineProperty(this, "itemId", {
    value: itemId,
    writable: false,
    configurable: false,
  });
}

  getTitle(): string {
    return this.title;
  }

  getYear(): number {
    return this.year;
  }

  abstract getCategory(): ItemCategory;
  abstract getDescription(): string;

  toString(): string {
    return `[${this.getCategory()}] ${this.itemId} - ${this.title} (${this.year})`;
  }
}