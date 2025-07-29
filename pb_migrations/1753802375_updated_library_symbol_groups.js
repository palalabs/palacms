/// <reference path="../pb_data/types.d.ts" />
migrate(
	(app) => {
		const collection = app.findCollectionByNameOrId('pbc_3479997895')

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
		const collection = app.findCollectionByNameOrId('pbc_3479997895')

		// update collection data
		unmarshal(
			{
				createRule: '@request.auth.id = owner.id',
				deleteRule: '@request.auth.id = owner.id',
				listRule: '@request.auth.id = owner.id',
				updateRule: '@request.auth.id = owner.id',
				viewRule: '@request.auth.id = owner.id'
			},
			collection
		)

		return app.save(collection)
	}
)
