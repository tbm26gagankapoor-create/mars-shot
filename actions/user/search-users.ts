"use server";

/**
 * Stub: returns empty results so UserSearchCombobox compiles.
 */
export async function searchUsers(params: {
  search: string;
  skip: number;
  take: number;
}): Promise<{
  users: { id: string; name: string | null; avatar: string | null }[];
  hasMore: boolean;
}> {
  return { users: [], hasMore: false };
}
