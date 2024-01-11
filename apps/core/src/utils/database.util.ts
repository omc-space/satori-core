import {
  CollectionRefTypes,
  NOTE_COLLECTION_NAME,
  POST_COLLECTION_NAME,
} from '~/constants/db.constant'

export const normalizeRefType = (type: keyof typeof CollectionRefTypes) => {
  return (
    ({
      Post: POST_COLLECTION_NAME,
      Note: NOTE_COLLECTION_NAME,
    }[type] as CollectionRefTypes) || (type as CollectionRefTypes)
  )
}
