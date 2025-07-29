/// <reference path="../pb_data/types.d.ts" />
migrate(
	(app) => {
		const collection = app.findCollectionByNameOrId('pbc_4273630883')

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
		const collection = app.findCollectionByNameOrId('pbc_4273630883')

		// update collection data
		unmarshal(
			{
				createRule: '@request.auth.id = site.group.owner.id',
				deleteRule: '@request.auth.id = site.group.owner.id',
				listRule: '@request.auth.id = site.group.owner.id',
				updateRule: '@request.auth.id = site.group.owner.id',
				viewRule: '@request.auth.id = site.group.owner.id'
			},
			collection
		)

		return app.save(collection)
	}
)
