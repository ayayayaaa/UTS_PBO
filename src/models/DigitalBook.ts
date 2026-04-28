import { LibraryItem } from "./LibraryItem.js";
import type { ItemCategory } from "../types/index.js";

export class DigitalBook extends LibraryItem {
  private author: string;
  public readonly fileUrl: string;

  constructor(
    itemId: string,
    title: string,
    year: number,
    author: string,
    fileUrl: string
  ) {
    super(itemId, title, year);
    this.author = author;
    this.fileUrl = fileUrl;
  }

  getAuthor(): string {
    return this.author;
  }

  getCategory(): ItemCategory {
    return "digital";
  }

  getDescription(): string {
    return `${this.title} by ${this.author} - ${this.fileUrl}`;
  }
}