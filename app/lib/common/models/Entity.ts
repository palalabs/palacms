import { z } from 'zod'

export const ENTITY_TYPE = Symbol('ENTITY_TYPE')

export const Entity = <T extends string, Type extends z.ZodTypeAny>(entityType: T, type: Type) =>
	Object.assign(type, { [ENTITY_TYPE]: entityType }).transform<z.TypeOf<Type> & { [ENTITY_TYPE]: T }>((entity) => Object.assign(entity, { [ENTITY_TYPE]: entityType }))

export type Entity<T extends string = string> = z.infer<ReturnType<typeof Entity<T, z.ZodUnknown>>>
