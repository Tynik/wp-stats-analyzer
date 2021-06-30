interface State {
  loading: boolean
  sortStatsBy: string
  stats: Record<string, any>
  lockfile: Record<string, any>
}

const initialState: State = {
  loading: false,
  sortStatsBy: 'size',
  stats: null,
  lockfile: null
}

export const rootReducer = (state: State = initialState, action): State => {
  switch (action.type) {
    case 'LOAD_STATS':
      return { ...state, loading: true }

    case 'SORT_STATS':
      return { ...state, sortStatsBy: action.sortBy }

    case 'LOAD_STATS_SUCCEEDED':
      return { ...state, loading: false, stats: action.data }

    case 'LOAD_LOCKFILE_SUCCEEDED':
      return { ...state, lockfile: action.data }

    case 'LOAD_LOCKFILE_FAILED':
      return { ...state }
  }
  return state
}
