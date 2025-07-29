/// <reference path="../pb_data/types.d.ts" />
migrate(
	(app) => {
		const collection = app.findCollectionByNameOrId('pbc_3945946014')

		// update collection data
		unmarshal(
			{
				createRule: '@request.auth.id != "" && page_type.site.id = site.id && (parent = \'\' || parent.site.id = site.id)',
				deleteRule: '@request.auth.id != "" && page_type.site.id = site.id && (parent = \'\' || parent.site.id = site.id)',
				listRule: '@request.auth.id != "" && page_type.site.id = site.id && (parent = \'\' || parent.site.id = site.id)',
				updateRule: '@request.auth.id != "" && page_type.site.id = site.id && (parent = \'\' || parent.site.id = site.id)',
				viewRule: '@request.auth.id != "" && page_type.site.id = site.id && (parent = \'\' || parent.site.id = site.id)'
			},
			collection
		)

		return app.save(collection)
	},
	(app) => {
		const collection = app.findCollectionByNameOrId('pbc_3945946014')

		// update collection data
		unmarshal(
			{
				createRule: "@request.auth.id = site.group.owner.id && page_type.site.id = site.id && (parent = '' || parent.site.id = site.id)",
				deleteRule: "@request.auth.id = site.group.owner.id && page_type.site.id = site.id && (parent = '' || parent.site.id = site.id)",
				listRule: "@request.auth.id = site.group.owner.id && page_type.site.id = site.id && (parent = '' || parent.site.id = site.id)",
				updateRule: "@request.auth.id = site.group.owner.id && page_type.site.id = site.id && (parent = '' || parent.site.id = site.id)",
				viewRule: "@request.auth.id = site.group.owner.id && page_type.site.id = site.id && (parent = '' || parent.site.id = site.id)"
			},
			collection
		)

		return app.save(collection)
	}
)
