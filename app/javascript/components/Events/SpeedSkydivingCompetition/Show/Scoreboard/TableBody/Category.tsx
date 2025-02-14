import React, { useState } from 'react'
import cx from 'clsx'

import {
  useEditCategoryMutation,
  useDeleteCategoryMutation,
  useChangePositionMutation
} from 'api/speedSkydivingCompetitions'
import CategoryForm from 'components/CategoryForm'
import PencilIcon from 'icons/pencil'
import ChevronUpIcon from 'icons/chevron-up'
import ChevronDownIcon from 'icons/chevron-down'
import TimesIcon from 'icons/times'
import styles from './styles.module.scss'

import type {
  SpeedSkydivingCompetition,
  Category as CategoryRecord
} from 'api/speedSkydivingCompetitions'
import RequestErrorToast from 'components/RequestErrorToast'
import toast from 'react-hot-toast'
import { AxiosError } from 'axios'

type CategoryProps = {
  event: SpeedSkydivingCompetition
  category: CategoryRecord
  colSpan: number
}

const mutationOptions = {
  onError: (error: AxiosError<Record<string, string[]>>) => {
    toast.error(<RequestErrorToast response={error.response} />)
  }
}

const Category = ({ event, category, colSpan }: CategoryProps): JSX.Element => {
  const [categoryFormShown, setCategoryFormShown] = useState(false)
  const editMutation = useEditCategoryMutation(event.id, category.id, {
    onSuccess: () => setCategoryFormShown(false)
  })
  const deleteMutation = useDeleteCategoryMutation()
  const positionMutation = useChangePositionMutation()

  const handleDelete = () =>
    deleteMutation.mutate({ eventId: event.id, id: category.id }, mutationOptions)
  const moveUp = () =>
    positionMutation.mutate(
      { eventId: event.id, id: category.id, direction: 'up' },
      mutationOptions
    )
  const moveDown = () =>
    positionMutation.mutate(
      { eventId: event.id, id: category.id, direction: 'down' },
      mutationOptions
    )

  return (
    <tr>
      <td colSpan={colSpan} className={styles.categoryCell}>
        <span>{category.name}</span>
        {event.permissions.canEdit && (
          <div className={styles.actions}>
            <button
              className={styles.actionButton}
              onClick={() => setCategoryFormShown(true)}
            >
              <PencilIcon />
            </button>
            <button className={styles.actionButton} onClick={handleDelete}>
              <TimesIcon />
            </button>
            <button
              className={cx(styles.actionButton, styles.positionButton)}
              onClick={moveUp}
            >
              <ChevronUpIcon />
            </button>
            <button
              className={cx(styles.actionButton, styles.positionButton)}
              onClick={moveDown}
            >
              <ChevronDownIcon />
            </button>

            {categoryFormShown && (
              <CategoryForm
                onHide={() => setCategoryFormShown(false)}
                mutation={editMutation}
                initialValues={category}
              />
            )}
          </div>
        )}
      </td>
    </tr>
  )
}

export default Category
