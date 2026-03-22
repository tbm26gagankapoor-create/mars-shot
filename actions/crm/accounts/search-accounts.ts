"use server";

/**
 * Stub: returns empty results so AccountSearchCombobox compiles.
 */
export async function searchAccounts(params: {
  search: string;
  skip: number;
  take: number;
}): Promise<{
  accounts: { id: string; name: string }[];
  hasMore: boolean;
}> {
  return { accounts: [], hasMore: false };
}
