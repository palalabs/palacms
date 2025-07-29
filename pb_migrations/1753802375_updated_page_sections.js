/// <reference path="../pb_data/types.d.ts" />
migrate(
	(app) => {
		const collection = app.findCollectionByNameOrId('pbc_1111325129')

		// update collection data
		unmarshal(
			{
				createRule: '@request.auth.id != "" && symbol.site.id = page.site.id',
				deleteRule: '@request.auth.id != "" && symbol.site.id = page.site.id',
				listRule: '@request.auth.id != "" && symbol.site.id = page.site.id',
				updateRule: '@request.auth.id != "" && symbol.site.id = page.site.id',
				viewRule: '@request.auth.id != "" && symbol.site.id = page.site.id'
			},
			collection
		)

		return app.save(collection)
	},
	(app) => {
		const collection = app.findCollectionByNameOrId('pbc_1111325129')

		// update collection data
		unmarshal(
			{
				createRule: '@request.auth.id = page.site.group.owner.id && symbol.site.id = page.site.id',
				deleteRule: '@request.auth.id = page.site.group.owner.id && symbol.site.id = page.site.id',
				listRule: '@request.auth.id = page.site.group.owner.id && symbol.site.id = page.site.id',
				updateRule: '@request.auth.id = page.site.group.owner.id && symbol.site.id = page.site.id',
				viewRule: '@request.auth.id = page.site.group.owner.id && symbol.site.id = page.site.id'
			},
			collection
		)

		return app.save(collection)
	}
)
