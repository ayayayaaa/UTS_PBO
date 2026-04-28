import { describe, it, expect, beforeEach } from "vitest";
import { Library, Book, Magazine, DigitalBook, Member, LoanRecord } from "../src/index.js";

let lib: Library;
let andi: Member;
let budi: Member;
let citra: Member;
let cleanCode: Book;
let pragmatic: Book;
let natGeo: Magazine;
let tsDeepDive: DigitalBook;

beforeEach(() => {
  lib = new Library("Perpustakaan UDINUS");
  andi = new Member("MB-001", "Andi Saputra", "andi@students.udinus.ac.id");
  budi = new Member("MB-002", "Budi Santoso", "budi@students.udinus.ac.id");
  citra = new Member("MB-003", "Citra Dewi", "citra@students.udinus.ac.id");
  cleanCode = new Book("BK-001", "Clean Code", 2008, "Robert C. Martin", 3);
  pragmatic = new Book("BK-002", "The Pragmatic Programmer", 1999, "David Thomas", 1);
  natGeo = new Magazine("MG-001", "National Geographic", 2024, "NGS", 202);
  tsDeepDive = new DigitalBook("DG-001", "TypeScript Deep Dive", 2019, "Basarat Ali", "https://basarat.gitbook.io/typescript");

  lib.addItem(cleanCode);
  lib.addItem(pragmatic);
  lib.addItem(natGeo);
  lib.addItem(tsDeepDive);
  lib.registerMember(andi);
  lib.registerMember(budi);
  lib.registerMember(citra);
});

// ── Alur 1: Manajemen Koleksi & Anggota ─────────────────────────────────────
describe("Alur 1: Manajemen Koleksi & Anggota", () => {
  it("menyimpan item yang ditambahkan", () => {
    expect(lib.findItem("BK-001").getTitle()).toBe("Clean Code");
    expect(lib.findItem("MG-001").getTitle()).toBe("National Geographic");
    expect(lib.findItem("DG-001").getTitle()).toBe("TypeScript Deep Dive");
  });

  it("menyimpan anggota yang didaftarkan", () => {
    expect(lib.findMember("MB-001").getName()).toBe("Andi Saputra");
  });

  it("menolak item dengan ID duplikat", () => {
    expect(() => lib.addItem(new Book("BK-001", "Dup", 2020, "X", 1))).toThrow();
  });

  it("menolak anggota dengan ID duplikat", () => {
    expect(() => lib.registerMember(new Member("MB-001", "Dup", "dup@test.com"))).toThrow();
  });

  it("getCatalogSummary mengembalikan total dan breakdown yang benar", () => {
    const summary = lib.getCatalogSummary();
    expect(summary.total).toBe(4);
    expect(summary.byCategory.get("book")).toBe(2);
    expect(summary.byCategory.get("magazine")).toBe(1);
    expect(summary.byCategory.get("digital")).toBe(1);
  });

  it("findItem throw jika ID tidak ditemukan", () => {
    expect(() => lib.findItem("BK-999")).toThrow(/BK-999/);
  });

  it("findMember throw jika ID tidak ditemukan", () => {
    expect(() => lib.findMember("MB-999")).toThrow(/MB-999/);
  });
});

// ── Alur 2: Peminjaman Berhasil ──────────────────────────────────────────────
describe("Alur 2: Peminjaman Berhasil", () => {
  it("menghasilkan loanId berurutan LN-0001, LN-0002, dst", () => {
    const l1 = lib.borrowItem("MB-001", "BK-001");
    const l2 = lib.borrowItem("MB-002", "BK-001");
    const l3 = lib.borrowItem("MB-003", "MG-001");
    expect(l1.loanId).toBe("LN-0001");
    expect(l2.loanId).toBe("LN-0002");
    expect(l3.loanId).toBe("LN-0003");
  });

  it("mengurangi stok buku setiap peminjaman", () => {
    const book = lib.findItem("BK-001") as Book;
    expect(book.getAvailableCopies()).toBe(3);
    lib.borrowItem("MB-001", "BK-001");
    expect(book.getAvailableCopies()).toBe(2);
    lib.borrowItem("MB-002", "BK-001");
    expect(book.getAvailableCopies()).toBe(1);
  });

  it("mencatat anggota sebagai peminjam aktif", () => {
    lib.borrowItem("MB-001", "BK-001");
    expect(lib.findMember("MB-001").hasActiveLoan("BK-001")).toBe(true);
  });

  it("mengembalikan LoanRecord yang berisi data benar", () => {
    const record = lib.borrowItem("MB-001", "BK-001");
    expect(record).toBeInstanceOf(LoanRecord);
    expect(record.memberId).toBe("MB-001");
    expect(record.itemId).toBe("BK-001");
    expect(record.isReturned()).toBe(false);
  });

  it("majalah bisa dipinjam saat tersedia", () => {
    const record = lib.borrowItem("MB-001", "MG-001");
    expect(record.loanId).toBe("LN-0001");
    expect(natGeo.isAvailable()).toBe(false);
  });

  it("borrowItem dengan borrowDate custom menyimpan tanggal pinjam yang diberikan", () => {
    const customDate = new Date("2026-01-10T00:00:00.000Z");
    const record = lib.borrowItem("MB-001", "BK-001", customDate);
    expect(record.borrowDate).toBe(customDate);
  });
});

// ── Alur 3: Penolakan ────────────────────────────────────────────────────────
describe("Alur 3: Permintaan Ditolak", () => {
  it("3a: menolak saat stok habis", () => {
    lib.borrowItem("MB-001", "BK-002"); // stok 1 → 0
    expect(() => lib.borrowItem("MB-002", "BK-002")).toThrow(/tersedia|stok/i);
  });

  it("3a: menolak saat majalah sudah dipinjam", () => {
    lib.borrowItem("MB-001", "MG-001");
    expect(() => lib.borrowItem("MB-002", "MG-001")).toThrow(/tersedia|stok/i);
  });

  it("3b: menolak saat anggota sudah di batas pinjam (3)", () => {
    lib.borrowItem("MB-001", "BK-001");
    lib.borrowItem("MB-001", "BK-002");
    lib.borrowItem("MB-001", "MG-001");
    expect(() => lib.borrowItem("MB-001", "DG-001")).toThrow(/batas/i);
  });

  it("3c: menolak peminjaman buku digital", () => {
    expect(() => lib.borrowItem("MB-001", "DG-001")).toThrow(/digital|tidak dapat dipinjam/i);
  });

  it("3d: menolak jika anggota tidak ditemukan", () => {
    expect(() => lib.borrowItem("MB-999", "BK-001")).toThrow(/MB-999/);
  });

  it("3d: menolak jika item tidak ditemukan", () => {
    expect(() => lib.borrowItem("MB-001", "BK-999")).toThrow(/BK-999/);
  });
});

// ── Alur 4: Pengembalian & Denda ─────────────────────────────────────────────
describe("Alur 4: Pengembalian & Denda", () => {
  it("pengembalian berhasil menambah stok dan hapus pinjaman aktif", () => {
    lib.borrowItem("MB-001", "BK-001");
    expect(cleanCode.getAvailableCopies()).toBe(2);
    lib.returnItem("MB-001", "BK-001");
    expect(cleanCode.getAvailableCopies()).toBe(3);
    expect(andi.hasActiveLoan("BK-001")).toBe(false);
  });

  it("pengembalian majalah mengubah status menjadi tersedia", () => {
    lib.borrowItem("MB-001", "MG-001");
    expect(natGeo.isAvailable()).toBe(false);
    lib.returnItem("MB-001", "MG-001");
    expect(natGeo.isAvailable()).toBe(true);
  });

  it("menolak jika anggota bukan peminjam item tersebut", () => {
    lib.borrowItem("MB-003", "MG-001");
    expect(() => lib.returnItem("MB-002", "MG-001")).toThrow(/pinjaman aktif|tidak memiliki/i);
  });

  it("denda 0 jika dikembalikan tepat waktu", () => {
    const record = lib.borrowItem("MB-001", "BK-001");
    expect(record.getFine(7, 1000)).toBe(0);
  });

  it("getDaysOverdue bernilai 0 jika lama pinjam tepat sama dengan dueDays", () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const record = lib.borrowItem("MB-001", "BK-001", sevenDaysAgo);
    expect(record.getDaysOverdue(7)).toBe(0);
  });

  it("menghitung denda dengan benar untuk keterlambatan", () => {
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
    const record = lib.borrowItem("MB-001", "BK-001", tenDaysAgo);
    // terlambat 3 hari (10 - 7), denda = 3 * 1000 = 3000
    expect(record.getFine(7, 1000)).toBe(3000);
  });

  it("denda dihitung dari returnDate jika sudah dikembalikan", () => {
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
    const record = lib.borrowItem("MB-001", "BK-001", tenDaysAgo);
    lib.returnItem("MB-001", "BK-001");
    // setelah dikembalikan, denda harus terkunci (tidak bertambah)
    expect(record.getFine(7, 1000)).toBe(3000);
  });

  it("markReturned throw jika sudah dikembalikan", () => {
    const record = lib.borrowItem("MB-001", "BK-001");
    lib.returnItem("MB-001", "BK-001");
    expect(() => record.markReturned()).toThrow();
  });
});

// ── Alur 5: Pencarian & Filter ───────────────────────────────────────────────
describe("Alur 5: Pencarian & Filter", () => {
  it("searchItems case-insensitive berdasarkan judul", () => {
    const results = lib.searchItems("code");
    expect(results.some((i) => i.getTitle() === "Clean Code")).toBe(true);
  });

  it("searchItems dengan huruf besar menghasilkan hasil sama", () => {
    expect(lib.searchItems("CODE").length).toBe(lib.searchItems("code").length);
  });

  it("searchItems mengembalikan array kosong jika tidak ada yang cocok", () => {
    expect(lib.searchItems("nonexistent keyword")).toEqual([]);
  });

  it("filterByCategory hanya mengembalikan item kategori tersebut", () => {
    const digitals = lib.filterByCategory("digital");
    expect(digitals.length).toBe(1);
    expect(digitals[0]?.getCategory()).toBe("digital");
  });

  it("sortByYear tidak mengubah data asli", () => {
    const before = lib.findItem("BK-001");
    lib.sortByYear(true);
    expect(lib.findItem("BK-001")).toBe(before);
  });

  it("sortByYear descending mengurutkan dengan benar", () => {
    const sorted = lib.sortByYear(true);
    for (let i = 0; i < sorted.length - 1; i++) {
      expect((sorted[i]?.getYear() ?? 0) >= (sorted[i + 1]?.getYear() ?? 0)).toBe(true);
    }
  });

  it("sortByYear ascending mengurutkan dengan benar", () => {
    const sorted = lib.sortByYear(false);
    for (let i = 0; i < sorted.length - 1; i++) {
      expect((sorted[i]?.getYear() ?? 0) <= (sorted[i + 1]?.getYear() ?? 0)).toBe(true);
    }
  });
});

// ── Alur 6: Laporan ──────────────────────────────────────────────────────────
describe("Alur 6: Laporan", () => {
  it("getActiveLoans mengembalikan pinjaman yang belum dikembalikan", () => {
    lib.borrowItem("MB-001", "BK-001");
    lib.borrowItem("MB-002", "BK-001");
    lib.returnItem("MB-001", "BK-001");
    const active = lib.getActiveLoans();
    expect(active.length).toBe(1);
    expect(active[0]?.memberId).toBe("MB-002");
  });

  it("getOverdueLoans mengembalikan pinjaman yang melebihi batas hari", () => {
    const eightDaysAgo = new Date();
    eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);
    lib.borrowItem("MB-001", "BK-001", eightDaysAgo);
    lib.borrowItem("MB-002", "BK-001"); // tidak overdue
    const overdue = lib.getOverdueLoans(7);
    expect(overdue.length).toBe(1);
    expect(overdue[0]?.memberId).toBe("MB-001");
  });

  it("getMemberStats menghitung totalBorrowed termasuk yang sudah dikembalikan", () => {
    lib.borrowItem("MB-001", "BK-001");
    lib.borrowItem("MB-001", "BK-002");
    lib.returnItem("MB-001", "BK-001");
    const stats = lib.getMemberStats("MB-001");
    expect(stats.totalBorrowed).toBe(2);
    expect(stats.activeLoans).toBe(1);
  });

  it("getMemberStats menghitung totalFine hanya dari pinjaman aktif yang overdue", () => {
    const eightDaysAgo = new Date();
    eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);
    lib.borrowItem("MB-001", "BK-001", eightDaysAgo);
    lib.borrowItem("MB-001", "BK-002");
    const stats = lib.getMemberStats("MB-001");
    expect(stats.totalFine).toBe(1000);
  });

  it("getMemberStats throw jika member tidak ditemukan", () => {
    expect(() => lib.getMemberStats("MB-999")).toThrow(/MB-999/);
  });

  it("getMostBorrowedItems mengembalikan top-N berdasarkan borrowCount", () => {
    lib.borrowItem("MB-001", "BK-001");
    lib.borrowItem("MB-002", "BK-001");
    lib.borrowItem("MB-001", "BK-002");
    const top = lib.getMostBorrowedItems(1);
    expect(top.length).toBe(1);
    expect(top[0]?.getTitle()).toBe("Clean Code");
  });

  it("getMostBorrowedItems tidak menyertakan buku digital", () => {
    const top = lib.getMostBorrowedItems(10);
    expect(top.every((i) => i.getCategory() !== "digital")).toBe(true);
  });

  it("getTotalFines menghitung total denda semua pinjaman aktif yang overdue", () => {
    const eightDaysAgo = new Date();
    eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);
    lib.borrowItem("MB-001", "BK-001", eightDaysAgo); // 1 hari overdue
    lib.borrowItem("MB-002", "BK-001", eightDaysAgo); // 1 hari overdue
    const total = lib.getTotalFines(7, 1000);
    expect(total).toBe(2000);
  });

  it("getTotalFines mengabaikan pinjaman yang tidak overdue atau sudah dikembalikan", () => {
    const eightDaysAgo = new Date();
    eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);
    lib.borrowItem("MB-001", "BK-001", eightDaysAgo);
    lib.borrowItem("MB-002", "BK-001");
    lib.returnItem("MB-001", "BK-001");
    expect(lib.getTotalFines(7, 1000)).toBe(0);
  });
});
