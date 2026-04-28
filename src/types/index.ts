export type ItemCategory = "book" | "magazine" | "digital";

export type MemberStats = {
  memberId: string;
  name: string;
  totalBorrowed: number;
  activeLoans: number;
  totalFine: number;
};

export type CatalogSummary = {
  total: number;
  byCategory: Map<ItemCategory, number>;
};