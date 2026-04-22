import { CATEGORIES, QUESTIONS } from '~~/server/constants/questions'

export default defineEventHandler(() => {
  return { categories: CATEGORIES, questions: QUESTIONS }
})
