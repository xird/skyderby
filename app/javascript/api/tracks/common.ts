import { parseISO } from 'date-fns'
import { cachePlaces, PlaceRecord } from 'api/places'
import { cacheSuits, SuitRecord } from 'api/suits'
import { cacheProfiles, ProfileRecord } from 'api/profiles'
import { cacheCountries, CountryRecord } from 'api/countries'
import { cacheManufacturers, ManufacturerRecord } from 'api/manufacturer'
import queryClient from 'components/queryClient'
import { Serialized } from 'api/helpers'

const allowedActivities = ['base', 'skydive', 'speed_skydiving'] as const
const allowedVisibilities = ['public_track', 'unlisted_track', 'private_track'] as const
export type TrackActivity = typeof allowedActivities[number]
export type TrackVisibility = typeof allowedVisibilities[number]

export interface TrackJumpRange {
  from: number
  to: number
}

export type SerializedTrackRecord = Serialized<TrackRecord>

export interface BaseTrackRecord {
  id: number
  kind: TrackActivity
  visibility: TrackVisibility
  comment: string
  profileId: number | null
  suitId: number | null
  placeId: number | null
  location: string | null
  pilotName: string | null
  missingSuitName: string | null
  recordedAt: Date
  createdAt: Date
  updatedAt: Date
}

export interface TrackRecord extends BaseTrackRecord {
  jumpRange: TrackJumpRange
  hasVideo: boolean
  trackFile?: {
    filename: string
    downloadUrl: string
  }
  permissions: {
    canEdit: boolean
    canEditOwnership: boolean
    canDownload: boolean
  }
}

interface BestResults {
  distance: number | null
  speed: number | null
  time: number | null
}

export type TrackIndexRecord = BaseTrackRecord & BestResults

export type TrackVariables = Partial<{
  kind: TrackActivity
  visibility: TrackVisibility
  jumpRange: TrackJumpRange
  suitId: number | null
  placeId: number | null
  location: string | null
  missingSuitName: string | null
  comment: string
}>

export interface TrackRelations {
  countries: CountryRecord[]
  places: PlaceRecord[]
  suits: SuitRecord[]
  manufacturers: ManufacturerRecord[]
  profiles: ProfileRecord[]
}

export interface TracksIndex<T> {
  items: T[]
  currentPage: number
  totalPages: number
  relations: TrackRelations
}

export interface IndexParams {
  activity?: TrackActivity
  filters?: TrackFilters
  search?: string
  page?: number
  perPage?: number
  sortBy?: SortByValue
}

export type IndexQueryKey = ['tracks', IndexParams]
export type InfiniteIndexQueryKey = ['infiniteTracks', IndexParams]
export type RecordQueryKey = ['tracks', number]

export const allowedFilters = ['profileId', 'suitId', 'placeId', 'year'] as const
export const allowedSortByValues = [
  'id asc',
  'id desc',
  'recorded_at asc',
  'recorded_at desc',
  'speed asc',
  'speed desc',
  'distance asc',
  'distance desc',
  'time asc',
  'time desc'
] as const

export type FilterKey = typeof allowedFilters[number]
export type FilterTuple = readonly [FilterKey, string | number]
export type SortByValue = typeof allowedSortByValues[number]
export type TrackFilters = FilterTuple[] | { [key in FilterKey]?: string | number }

export const isAllowedActivity = (activity: string | null): activity is TrackActivity => {
  if (!activity) return false
  return allowedActivities.includes(activity as TrackActivity)
}

export const isAllowedSort = (sortBy: string | null): sortBy is SortByValue => {
  if (!sortBy) return false
  return allowedSortByValues.includes(sortBy as SortByValue)
}

export const collectionEndpoint = '/api/v1/tracks'
export const elementEndpoint = (id: number) => `${collectionEndpoint}/${id}`
export const recordQueryKey = (id: number): RecordQueryKey => ['tracks', id]

export const cacheRelations = (relations: TrackRelations): void => {
  cachePlaces(relations.places, queryClient)
  cacheSuits(relations.suits, queryClient)
  cacheProfiles(relations.profiles, queryClient)
  cacheCountries(relations.countries, queryClient)
  cacheManufacturers(relations.manufacturers, queryClient)
}

export const deserialize = <
  TIn extends { createdAt: string; updatedAt: string; recordedAt: string }
>(
  track: TIn
) => ({
  ...track,
  createdAt: parseISO(track.createdAt),
  updatedAt: parseISO(track.updatedAt),
  recordedAt: parseISO(track.recordedAt)
})
