import { FLAGS_CU_SEARCH_SORT, FLAG_TIMERANGE } from '../../../constants/fields.js'
import { TodoStatus } from './todos.constants.js'

export const todoFields = {
  title: { name: 'title', kind: 'string', flags: { ...FLAGS_CU_SEARCH_SORT } },
  status: {
    name: 'status',
    kind: 'enum',
    enumValues: Object.values(TodoStatus),
    flags: { ...FLAGS_CU_SEARCH_SORT },
  },
  createdAt: {
    name: 'createdAt',
    kind: 'date',
    flags: { sortable: true, ...FLAG_TIMERANGE },
  },
  updatedAt: {
    name: 'updatedAt',
    kind: 'date',
    flags: { sortable: true, ...FLAG_TIMERANGE },
  },
}


