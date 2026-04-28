export class Member {
  public readonly memberId: string;
  private name: string;
  private email: string;
  private activeLoans: Set<string> = new Set();
  public static readonly MAX_LOANS: number = 3;

  constructor(memberId: string, name: string, email: string) {
  this.memberId = memberId;
  this.name = name;
  this.email = email;
  Object.defineProperty(this, "memberId", {
    value: memberId,
    writable: false,
    configurable: false,
  });
}

  getName(): string {
    return this.name;
  }

  getEmail(): string {
    return this.email;
  }

  canBorrow(): boolean {
    return this.activeLoans.size < Member.MAX_LOANS;
  }

  addLoan(itemId: string): void {
    if (!this.canBorrow()) {
      throw new Error(
        `Tidak dapat meminjam, batas pinjam aktif (${Member.MAX_LOANS} item) sudah tercapai.`
      );
    }
    if (this.activeLoans.has(itemId)) {
      throw new Error(`Anggota sudah memiliki pinjaman aktif untuk item ${itemId}.`);
    }
    this.activeLoans.add(itemId);
  }

  removeLoan(itemId: string): void {
    if (!this.activeLoans.has(itemId)) {
      throw new Error(`Item ${itemId} tidak ada dalam pinjaman aktif anggota ini.`);
    }
    this.activeLoans.delete(itemId);
  }

  hasActiveLoan(itemId: string): boolean {
    return this.activeLoans.has(itemId);
  }

  getActiveLoanCount(): number {
    return this.activeLoans.size;
  }
}