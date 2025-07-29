/// <reference path="../pb_data/types.d.ts" />
migrate(
	(app) => {
		const collection = app.findCollectionByNameOrId('pbc_149684058')

		// update collection data
		unmarshal(
			{
				createRule: '@request.auth.id != ""',
				deleteRule: '@request.auth.id != ""',
				listRule: '@request.auth.id != ""',
				updateRule: '@request.auth.id != ""',
				viewRule: '@request.auth.id != ""'
			},
			collection
		)

		return app.save(collection)
	},
	(app) => {
		const collection = app.findCollectionByNameOrId('pbc_149684058')

		// update collection data
		unmarshal(
			{
				createRule: '@request.auth.id = symbol.site.group.owner.id',
				deleteRule: '@request.auth.id = symbol.site.group.owner.id',
				listRule: '@request.auth.id = symbol.site.group.owner.id',
				updateRule: '@request.auth.id = symbol.site.group.owner.id',
				viewRule: '@request.auth.id = symbol.site.group.owner.id'
			},
			collection
		)

		return app.save(collection)
	}
)
