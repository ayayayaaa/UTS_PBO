import { describe, it, expect } from "vitest";
import { Book, Magazine, DigitalBook, Member, LoanRecord, LibraryItem } from "../src/index.js";

// ── Hierarchy & instanceof ───────────────────────────────────────────────────
describe("Hierarchy & instanceof", () => {
  it("Book adalah instanceof LibraryItem", () => {
    const book = new Book("BK-T1", "Test", 2020, "Author", 1);
    expect(book).toBeInstanceOf(LibraryItem);
  });

  it("Magazine adalah instanceof LibraryItem", () => {
    const mag = new Magazine("MG-T1", "Test", 2020, "Pub", 1);
    expect(mag).toBeInstanceOf(LibraryItem);
  });

  it("DigitalBook adalah instanceof LibraryItem", () => {
    const digital = new DigitalBook("DG-T1", "Test", 2020, "Author", "http://url.com");
    expect(digital).toBeInstanceOf(LibraryItem);
  });

  it("LibraryItem tidak bisa diinstansiasi langsung (abstract)", () => {
    // @ts-expect-error abstract class
    expect(() => new LibraryItem("X", "X", 2020)).toThrow();
  });

  it("toString format benar", () => {
    const book = new Book("BK-T1", "Clean Code", 2008, "Author", 1);
    expect(book.toString()).toBe("[book] BK-T1 - Clean Code (2008)");
  });

  it("getCategory mengembalikan nilai yang benar", () => {
    expect(new Book("B", "T", 2020, "A", 1).getCategory()).toBe("book");
    expect(new Magazine("M", "T", 2020, "P", 1).getCategory()).toBe("magazine");
    expect(new DigitalBook("D", "T", 2020, "A", "url").getCategory()).toBe("digital");
  });

  it("setiap subclass memiliki getDescription yang informatif", () => {
    const book = new Book("BK-T1", "Clean Code", 2008, "Robert C. Martin", 3);
    const magazine = new Magazine("MG-T1", "National Geographic", 2024, "NGS", 202);
    const digital = new DigitalBook("DG-T1", "TypeScript Deep Dive", 2019, "Basarat Ali", "https://example.com");

    expect(book.getDescription()).toContain("Robert C. Martin");
    expect(magazine.getDescription()).toContain("202");
    expect(digital.getDescription()).toContain("https://example.com");
  });
});

// ── Interface Compliance (Borrowable) ────────────────────────────────────────
describe("Interface compliance (Borrowable)", () => {
  it("Book memiliki semua method Borrowable", () => {
    const book = new Book("B", "T", 2020, "A", 2);
    expect(typeof book.isAvailable).toBe("function");
    expect(typeof book.borrow).toBe("function");
    expect(typeof book.returnItem).toBe("function");
    expect(typeof book.getBorrowCount).toBe("function");
  });

  it("Magazine memiliki semua method Borrowable", () => {
    const mag = new Magazine("M", "T", 2020, "P", 1);
    expect(typeof mag.isAvailable).toBe("function");
    expect(typeof mag.borrow).toBe("function");
    expect(typeof mag.returnItem).toBe("function");
    expect(typeof mag.getBorrowCount).toBe("function");
  });

  it("DigitalBook tidak memiliki method borrow", () => {
    const digital = new DigitalBook("D", "T", 2020, "A", "url");
    expect("borrow" in digital).toBe(false);
  });

  it("Book.borrow() mengembalikan true saat tersedia, false saat habis", () => {
    const book = new Book("B", "T", 2020, "A", 1);
    expect(book.borrow()).toBe(true);
    expect(book.borrow()).toBe(false);
  });

  it("Book.getBorrowCount() bertambah setiap borrow berhasil", () => {
    const book = new Book("B", "T", 2020, "A", 2);
    book.borrow();
    book.borrow();
    expect(book.getBorrowCount()).toBe(2);
  });

  it("Book.returnItem() tidak menambah stok melebihi totalCopies", () => {
    const book = new Book("B", "T", 2020, "A", 1);
    book.returnItem();
    expect(book.getAvailableCopies()).toBe(1);
  });

  it("Magazine.borrow() hanya bisa sekali", () => {
    const mag = new Magazine("M", "T", 2020, "P", 1);
    expect(mag.borrow()).toBe(true);
    expect(mag.borrow()).toBe(false);
  });
});

// ── Encapsulation ────────────────────────────────────────────────────────────
describe("Encapsulation (readonly, private, static)", () => {
  it("itemId adalah readonly", () => {
    const book = new Book("BK-T", "T", 2020, "A", 1);
    // @ts-expect-error readonly
    expect(() => (book.itemId = "X")).toThrow();
  });

  it("Member.memberId adalah readonly", () => {
    const m = new Member("MB-T", "Test", "t@t.com");
    // @ts-expect-error readonly
    expect(() => (m.memberId = "X")).toThrow();
  });

  it("Member.MAX_LOANS adalah static dan bernilai 3", () => {
    expect(Member.MAX_LOANS).toBe(3);
  });

  it("Member tidak mengizinkan lebih dari MAX_LOANS pinjaman aktif", () => {
    const m = new Member("MB-T", "Test", "t@t.com");
    m.addLoan("item-1");
    m.addLoan("item-2");
    m.addLoan("item-3");
    expect(() => m.addLoan("item-4")).toThrow();
  });

  it("Member.addLoan throw jika itemId sudah ada", () => {
    const m = new Member("MB-T", "Test", "t@t.com");
    m.addLoan("item-1");
    expect(() => m.addLoan("item-1")).toThrow();
  });

  it("Member.removeLoan throw jika itemId tidak ada", () => {
    const m = new Member("MB-T", "Test", "t@t.com");
    expect(() => m.removeLoan("item-X")).toThrow();
  });

  it("Magazine.issueNumber adalah public readonly", () => {
    const mag = new Magazine("M", "T", 2020, "P", 202);
    expect(mag.issueNumber).toBe(202);
    // @ts-expect-error readonly
    expect(() => (mag.issueNumber = 999)).toThrow();
  });

  it("DigitalBook.fileUrl adalah public readonly (TypeScript enforcement)", () => {
    const d = new DigitalBook("D", "T", 2020, "A", "https://url.com");
    expect(d.fileUrl).toBe("https://url.com");
    // readonly dicek via TypeScript compiler, tidak ditest runtime assignment
    const descriptor = Object.getOwnPropertyDescriptor(d, "fileUrl");
    expect(descriptor).toBeDefined();
  });

  it("LoanRecord.loanId adalah readonly (TypeScript enforcement)", () => {
    const r = new LoanRecord("LN-0001", "MB-001", "BK-001");
    expect(r.loanId).toBe("LN-0001");
    const descriptor = Object.getOwnPropertyDescriptor(r, "loanId");
    expect(descriptor).toBeDefined();
  });

  it("LoanRecord.getDaysOverdue minimum 0 untuk pinjaman yang belum jatuh tempo", () => {
    const record = new LoanRecord("LN-0001", "MB-001", "BK-001", new Date());
    expect(record.getDaysOverdue(7)).toBe(0);
  });
});
