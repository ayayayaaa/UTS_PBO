export interface Borrowable {
  isAvailable(): boolean;
  borrow(): boolean;
  returnItem(): void;
  getBorrowCount(): number;
}