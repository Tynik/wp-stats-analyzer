
export const loadStats = () => ({ type: 'LOAD_STATS' })
export const loadLockfile = () => ({ type: 'LOAD_LOCKFILE' })
export const sortStats = (sortBy: string) => ({ type: 'SORT_STATS', sortBy })
