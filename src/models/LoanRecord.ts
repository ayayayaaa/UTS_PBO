export class LoanRecord {
  public readonly loanId: string;
  public readonly memberId: string;
  public readonly itemId: string;
  public readonly borrowDate: Date;
  private returnDate: Date | null = null;

  constructor(
    loanId: string,
    memberId: string,
    itemId: string,
    borrowDate: Date = new Date()
  ) {
    this.loanId = loanId;
    this.memberId = memberId;
    this.itemId = itemId;
    this.borrowDate = borrowDate;
  }

  isReturned(): boolean {
    return this.returnDate !== null;
  }

  markReturned(date: Date = new Date()): void {
    if (this.isReturned()) {
      throw new Error(`Pinjaman ${this.loanId} sudah dikembalikan sebelumnya.`);
    }
    this.returnDate = date;
  }

  getDaysOverdue(dueDays: number): number {
    const checkDate = this.returnDate ?? new Date();
    const diffMs = checkDate.getTime() - this.borrowDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const overdue = diffDays - dueDays;
    return Math.max(0, overdue);
  }

  getFine(dueDays: number, ratePerDay: number): number {
    return this.getDaysOverdue(dueDays) * ratePerDay;
  }
}