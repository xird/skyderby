import { UseQueryResult } from 'react-query'

import useCategoriesQuery from './useCategoriesQuery'
import { Category } from './common'

const useCategoryQuery = (
  eventId: number,
  categoryId: number
): UseQueryResult<Category | undefined> =>
  useCategoriesQuery<Category | undefined>(eventId, {
    select: data => data.find(category => category.id === categoryId)
  })

export default useCategoryQuery
