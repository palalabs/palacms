import { find as _find, chain as _chain, flattenDeep as _flattenDeep } from 'lodash-es'
import * as _ from 'lodash-es'
import type { Field } from '$lib/common/models/Field.js'
import { locales, SITE } from '$lib/common/constants'
import type { Entry } from '$lib/common/models/Entry.js'
import type { z } from 'zod'

// TODO

export const get_content = (entity_id: string, fields: Field[]) => {
	return {}
}

export const get_direct_entries = <T extends Field>(entity_id: string, field: T) => ({})


export const get_resolved_entries = (entity_id: string, field: Field): Entry[] => {
	return []
}
