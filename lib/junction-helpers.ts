/**
 * Stub for junction table helpers.
 * Original was deleted during migration cleanup; these stubs keep existing
 * code compiling while the real junction-table logic is rebuilt.
 */

export const junctionTableHelpers = {
  /** Return a value suitable for the `watchers` field when adding a watcher */
  addWatcher(_userId: string) {
    // In the real implementation this would create a BoardWatchers record.
    // Stub returns undefined so Prisma ignores the field.
    return undefined as any;
  },

  /** Return a value suitable for the `watchers` field when removing a watcher */
  removeBoardWatcher(_boardId: string, _userId: string) {
    return undefined as any;
  },

  /** Return a Prisma `include` fragment for board watchers with user details */
  includeWatchersWithUsers() {
    return {
      boardWatchers: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      },
    };
  },

  /** Return a Prisma `where` clause to find boards watched by a user */
  watchedByUser(userId: string) {
    return {
      boardWatchers: {
        some: {
          user_id: userId,
        },
      },
    };
  },
};

/** Extract watcher users from a board that includes boardWatchers relation */
export function extractWatcherUsers(board: any) {
  if (!board?.boardWatchers) return [];
  return board.boardWatchers.map((bw: any) => bw.user).filter(Boolean);
}
