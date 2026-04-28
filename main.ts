import { Library, Book, Magazine, DigitalBook, Member } from "./src/index.js";

const lib = new Library("Perpustakaan UDINUS");

// ── Alur 1: Setup ─────────────────────────────────────────────────────────────
console.log("=== Alur 1: Menyiapkan Sistem ===\n");

lib.addItem(new Book("BK-001", "Clean Code", 2008, "Robert C. Martin", 3));
lib.addItem(new Book("BK-002", "The Pragmatic Programmer", 1999, "David Thomas", 1));
lib.addItem(new Magazine("MG-001", "National Geographic", 2024, "NGS", 202));
lib.addItem(new DigitalBook("DG-001", "TypeScript Deep Dive", 2019, "Basarat Ali", "https://basarat.gitbook.io/typescript"));

lib.registerMember(new Member("MB-001", "Andi Saputra", "andi@students.udinus.ac.id"));
lib.registerMember(new Member("MB-002", "Budi Santoso", "budi@students.udinus.ac.id"));
lib.registerMember(new Member("MB-003", "Citra Dewi", "citra@students.udinus.ac.id"));

// Duplikat ID harus ditolak
try {
  lib.addItem(new Book("BK-001", "Duplikat", 2020, "Author", 1));
} catch (e) {
  console.log("✓ Duplikat item ditolak:", (e as Error).message);
}

try {
  lib.registerMember(new Member("MB-001", "Duplikat", "dup@test.com"));
} catch (e) {
  console.log("✓ Duplikat anggota ditolak:", (e as Error).message);
}

const summary = lib.getCatalogSummary();
console.log(`\nKatalog: ${summary.total} item total`);
summary.byCategory.forEach((count, cat) => console.log(`  ${cat}: ${count}`));

// ── Alur 2: Peminjaman Berhasil ───────────────────────────────────────────────
console.log("\n=== Alur 2: Peminjaman Berhasil ===\n");

const loan1 = lib.borrowItem("MB-001", "BK-001");
console.log(`✓ ${loan1.loanId}: Andi meminjam Clean Code`);

const loan2 = lib.borrowItem("MB-002", "BK-001");
console.log(`✓ ${loan2.loanId}: Budi meminjam Clean Code`);

const loan3 = lib.borrowItem("MB-003", "MG-001");
console.log(`✓ ${loan3.loanId}: Citra meminjam National Geographic`);

// ── Alur 3: Penolakan ─────────────────────────────────────────────────────────
console.log("\n=== Alur 3: Permintaan Ditolak ===\n");

// 3a: Stok habis - Andi pinjam 1 lagi dulu agar stok jadi 0
lib.borrowItem("MB-001", "BK-002"); // Andi pinjam BK-002 (stok 1 → 0)
try {
  lib.borrowItem("MB-002", "BK-002");
} catch (e) {
  console.log("✓ 3a Stok habis:", (e as Error).message);
}

// 3b: Batas pinjam - gunakan item lain di library terpisah agar demonstrasi tetap valid
const limitLib = new Library("Test Batas Pinjam");
limitLib.addItem(new Book("BK-A", "Refactoring", 2018, "Martin Fowler", 1));
limitLib.addItem(new Book("BK-B", "Domain-Driven Design", 2003, "Eric Evans", 1));
limitLib.addItem(new Book("BK-C", "Design Patterns", 1994, "GoF", 1));
limitLib.addItem(new Book("BK-D", "Working Effectively with Legacy Code", 2004, "Michael Feathers", 1));
limitLib.registerMember(new Member("MB-A", "Andi Limit", "andi.limit@test.com"));
limitLib.borrowItem("MB-A", "BK-A");
limitLib.borrowItem("MB-A", "BK-B");
limitLib.borrowItem("MB-A", "BK-C");
try {
  limitLib.borrowItem("MB-A", "BK-D");
} catch (e) {
  console.log("✓ 3b Batas pinjam:", (e as Error).message);
}

// 3c: Buku digital tidak bisa dipinjam
try {
  lib.borrowItem("MB-002", "DG-001");
} catch (e) {
  console.log("✓ 3c Buku digital:", (e as Error).message);
}

// 3d: ID tidak ditemukan
try {
  lib.borrowItem("MB-999", "BK-001");
} catch (e) {
  console.log("✓ 3d Member not found:", (e as Error).message);
}
try {
  lib.borrowItem("MB-002", "BK-999");
} catch (e) {
  console.log("✓ 3d Item not found:", (e as Error).message);
}

// ── Alur 4: Pengembalian & Denda ──────────────────────────────────────────────
console.log("\n=== Alur 4: Pengembalian & Denda ===\n");

// Andi kembalikan Clean Code
lib.returnItem("MB-001", "BK-001");
console.log("✓ Andi mengembalikan Clean Code");

// Budi coba kembalikan majalah milik Citra
try {
  lib.returnItem("MB-002", "MG-001");
} catch (e) {
  console.log("✓ Return bukan miliknya:", (e as Error).message);
}

// Citra terlambat 3 hari (pinjam 10 hari lalu, batas 7 hari)
const tenDaysAgo = new Date();
tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

// Simulasi: buat pinjaman baru dengan tanggal mundur
const lateLib = new Library("Test Denda");
lateLib.addItem(new Magazine("MG-TEST", "Test Mag", 2024, "Pub", 1));
lateLib.registerMember(new Member("MB-TEST", "Citra Test", "citra@test.com"));
const lateLoan = lateLib.borrowItem("MB-TEST", "MG-TEST", tenDaysAgo);
const fine = lateLoan.getFine(7, 1000);
console.log(`✓ Denda Citra (10 hari, batas 7): Rp ${fine.toLocaleString("id-ID")}`);

// ── Alur 5: Pencarian ─────────────────────────────────────────────────────────
console.log("\n=== Alur 5: Pencarian Koleksi ===\n");

const searchResult = lib.searchItems("code");
console.log(`Pencarian "code": ${searchResult.map((i) => i.getTitle()).join(", ")}`);

const digitalItems = lib.filterByCategory("digital");
console.log(`Filter digital: ${digitalItems.map((i) => i.getTitle()).join(", ")}`);

const sorted = lib.sortByYear(true);
console.log("Urut tahun (desc):", sorted.map((i) => `${i.getTitle()} (${i.getYear()})`).join(", "));

// ── Alur 6: Laporan ───────────────────────────────────────────────────────────
console.log("\n=== Alur 6: Laporan Bulanan ===\n");

const overdueLib = new Library("Test Laporan");
overdueLib.addItem(new Book("BK-L1", "Overdue Book", 2020, "Author", 2));
overdueLib.registerMember(new Member("MB-L1", "Test User", "test@test.com"));
const eightDaysAgo = new Date();
eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);
overdueLib.borrowItem("MB-L1", "BK-L1", eightDaysAgo);

const overdueLoans = overdueLib.getOverdueLoans(7);
console.log(`Pinjaman terlambat: ${overdueLoans.length} item`);

const totalFines = overdueLib.getTotalFines(7, 1000);
console.log(`Total denda beredar: Rp ${totalFines.toLocaleString("id-ID")}`);

const stats = lib.getMemberStats("MB-001");
console.log(`\nStatistik Andi:`);
console.log(`  Total pernah dipinjam : ${stats.totalBorrowed}`);
console.log(`  Aktif saat ini        : ${stats.activeLoans}`);
console.log(`  Total denda           : Rp ${stats.totalFine.toLocaleString("id-ID")}`);

const topItems = lib.getMostBorrowedItems(3);
console.log(`\nTop 3 paling sering dipinjam:`);
topItems.forEach((item, i) => console.log(`  ${i + 1}. ${item.getTitle()}`));
