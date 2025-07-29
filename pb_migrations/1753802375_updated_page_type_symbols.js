/// <reference path="../pb_data/types.d.ts" />
migrate(
	(app) => {
		const collection = app.findCollectionByNameOrId('pbc_3564279343')

		// update collection data
		unmarshal(
			{
				createRule: '@request.auth.id != "" && symbol.site.id = page_type.site.id',
				deleteRule: '@request.auth.id != "" && symbol.site.id = page_type.site.id',
				listRule: '@request.auth.id != "" && symbol.site.id = page_type.site.id',
				updateRule: '@request.auth.id != "" && symbol.site.id = page_type.site.id',
				viewRule: '@request.auth.id != "" && symbol.site.id = page_type.site.id'
			},
			collection
		)

		return app.save(collection)
	},
	(app) => {
		const collection = app.findCollectionByNameOrId('pbc_3564279343')

		// update collection data
		unmarshal(
			{
				createRule: '@request.auth.id = page_type.site.group.owner.id && symbol.site.id = page_type.site.id',
				deleteRule: '@request.auth.id = page_type.site.group.owner.id && symbol.site.id = page_type.site.id',
				listRule: '@request.auth.id = page_type.site.group.owner.id && symbol.site.id = page_type.site.id',
				updateRule: '@request.auth.id = page_type.site.group.owner.id && symbol.site.id = page_type.site.id',
				viewRule: '@request.auth.id = page_type.site.group.owner.id && symbol.site.id = page_type.site.id'
			},
			collection
		)

		return app.save(collection)
	}
)
