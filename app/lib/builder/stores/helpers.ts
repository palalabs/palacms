import { find as _find, chain as _chain, flattenDeep as _flattenDeep } from 'lodash-es'
import * as _ from 'lodash-es'
import type { Field } from '$lib/common/models/Field.js'
import { locales, SITE } from '$lib/common/constants'
import type { Entry } from '$lib/common/models/Entry.js'
import type { z } from 'zod'
import { type Id } from '$lib/common/models/Id'

// TODO

export const get_content = (entity_id: Id, fields: Field[]) => {
	return {}
}

export const get_direct_entries = <T extends Field>(entity_id: Id, field: T) => ({})


export const get_resolved_entries = (entity_id: Id, field: Field): Entry[] => {
	return []
}
