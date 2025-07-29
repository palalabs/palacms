/// <reference path="../pb_data/types.d.ts" />
migrate(
	(app) => {
		const collection = app.findCollectionByNameOrId('pbc_2001081480')

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
		const collection = app.findCollectionByNameOrId('pbc_2001081480')

		// update collection data
		unmarshal(
			{
				createRule: '@request.auth.id = group.owner.id',
				deleteRule: '@request.auth.id = group.owner.id',
				listRule: '@request.auth.id = group.owner.id',
				updateRule: '@request.auth.id = group.owner.id',
				viewRule: '@request.auth.id = group.owner.id'
			},
			collection
		)

		return app.save(collection)
	}
)
