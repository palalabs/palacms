import { z } from 'zod'
import { v4 as uuid } from 'uuid'
import { ID } from '../constants'

export const Id = z.string().nonempty().brand(ID)

export type Id = z.infer<typeof Id>

export const newId = () => uuid() as Id
