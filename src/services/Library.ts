import { LibraryItem } from "../models/LibraryItem.js";
import { Member } from "../models/Member.js";
import { LoanRecord } from "../models/LoanRecord.js";
import type { Borrowable } from "../interfaces/Borrowable.js";
import type { ItemCategory, CatalogSummary, MemberStats } from "../types/index.js";

function isBorrowable(item: LibraryItem): item is LibraryItem & Borrowable {
  return (
    typeof (item as unknown as Borrowable).isAvailable === "function" &&
    typeof (item as unknown as Borrowable).borrow === "function" &&
    typeof (item as unknown as Borrowable).returnItem === "function" &&
    typeof (item as unknown as Borrowable).getBorrowCount === "function"
  );
}

export class Library {
  public name: string;
  private members: Map<string, Member> = new Map();
  private items: Map<string, LibraryItem> = new Map();
  private loanHistory: LoanRecord[] = [];
  private loanCounter: number = 0;

  constructor(name: string) {
    this.name = name;
  }

  addItem(item: LibraryItem): void {
    if (this.items.has(item.itemId)) {
      throw new Error(`Item dengan ID '${item.itemId}' sudah ada.`);
    }
    this.items.set(item.itemId, item);
  }

  registerMember(member: Member): void {
    if (this.members.has(member.memberId)) {
      throw new Error(`Anggota dengan ID '${member.memberId}' sudah terdaftar.`);
    }
    this.members.set(member.memberId, member);
  }

  findItem(itemId: string): LibraryItem {
    const item = this.items.get(itemId);
    if (!item) throw new Error(`Item dengan ID '${itemId}' tidak ditemukan.`);
    return item;
  }

  findMember(memberId: string): Member {
    const member = this.members.get(memberId);
    if (!member) throw new Error(`Anggota dengan ID '${memberId}' tidak ditemukan.`);
    return member;
  }

  getCatalogSummary(): CatalogSummary {
    const byCategory = new Map<ItemCategory, number>();
    this.items.forEach((item) => {
      const cat = item.getCategory();
      byCategory.set(cat, (byCategory.get(cat) ?? 0) + 1);
    });
    return { total: this.items.size, byCategory };
  }

  borrowItem(memberId: string, itemId: string, borrowDate?: Date): LoanRecord {
  const member = this.findMember(memberId);
  const item = this.findItem(itemId);

  if (!member.canBorrow()) {
    throw new Error(
      `Tidak dapat meminjam, batas pinjam aktif (${Member.MAX_LOANS} item) sudah tercapai.`
    );
  }
  if (!isBorrowable(item)) {
    throw new Error(
      `Item ini tidak dapat dipinjam. Buku digital dapat diakses langsung tanpa peminjaman.`
    );
  }
  if (!item.isAvailable()) {
    throw new Error(`Item tidak tersedia, stok habis.`);
  }

  item.borrow();
  member.addLoan(itemId);

  this.loanCounter++;
  const loanId = `LN-${String(this.loanCounter).padStart(4, "0")}`;
  const record = new LoanRecord(loanId, memberId, itemId, borrowDate);
  this.loanHistory.push(record);
  return record;
}

  returnItem(memberId: string, itemId: string): LoanRecord {
    const member = this.findMember(memberId);
    const item = this.findItem(itemId);

    if (!member.hasActiveLoan(itemId)) {
      throw new Error(`Anggota ini tidak memiliki pinjaman aktif untuk item tersebut.`);
    }

    const record = this.loanHistory
      .filter((r) => r.memberId === memberId && r.itemId === itemId && !r.isReturned())
      .at(-1);

    if (!record) {
      throw new Error(`Record pinjaman tidak ditemukan.`);
    }

    record.markReturned();
    member.removeLoan(itemId);

    if (isBorrowable(item)) {
      item.returnItem();
    }

    return record;
  }

  searchItems(keyword: string): LibraryItem[] {
    const lower = keyword.toLowerCase();
    return Array.from(this.items.values()).filter((item) =>
      item.getTitle().toLowerCase().includes(lower)
    );
  }

  filterByCategory(category: ItemCategory): LibraryItem[] {
    return Array.from(this.items.values()).filter(
      (item) => item.getCategory() === category
    );
  }

  sortByYear(descending: boolean = false): LibraryItem[] {
    const copy = Array.from(this.items.values());
    return copy.sort((a, b) =>
      descending ? b.getYear() - a.getYear() : a.getYear() - b.getYear()
    );
  }

  getActiveLoans(): LoanRecord[] {
    return this.loanHistory.filter((r) => !r.isReturned());
  }

  getOverdueLoans(dueDays: number): LoanRecord[] {
    return this.getActiveLoans().filter((r) => r.getDaysOverdue(dueDays) > 0);
  }

  getMemberStats(memberId: string): MemberStats {
    const member = this.findMember(memberId);
    const memberLoans = this.loanHistory.filter((r) => r.memberId === memberId);
    const activeLoans = memberLoans.filter((r) => !r.isReturned());
    const totalFine = activeLoans.reduce(
      (sum, r) => sum + r.getFine(7, 1000),
      0
    );
    return {
      memberId,
      name: member.getName(),
      totalBorrowed: memberLoans.length,
      activeLoans: activeLoans.length,
      totalFine,
    };
  }

  getMostBorrowedItems(topN: number): LibraryItem[] {
    return Array.from(this.items.values())
      .filter(isBorrowable)
      .sort((a, b) => b.getBorrowCount() - a.getBorrowCount())
      .slice(0, topN);
  }

  getTotalFines(dueDays: number, ratePerDay: number): number {
    return this.getOverdueLoans(dueDays).reduce(
      (sum, r) => sum + r.getFine(dueDays, ratePerDay),
      0
    );
  }
}