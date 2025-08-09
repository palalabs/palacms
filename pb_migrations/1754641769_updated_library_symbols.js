/// <reference path="../pb_data/types.d.ts" />
migrate(
	(app) => {
		const collection = app.findCollectionByNameOrId('pbc_3406698535')

		// update collection data
		const authorizeRule = '@request.auth.serverRole != ""'
		unmarshal(
			{
				createRule: authorizeRule,
				deleteRule: authorizeRule,
				listRule: authorizeRule,
				updateRule: authorizeRule,
				viewRule: authorizeRule
			},
			collection
		)

		return app.save(collection)
	},
	(app) => {
		const collection = app.findCollectionByNameOrId('pbc_3406698535')

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
