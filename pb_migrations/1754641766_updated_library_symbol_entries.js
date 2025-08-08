/// <reference path="../pb_data/types.d.ts" />
migrate(
	(app) => {
		const collection = app.findCollectionByNameOrId('pbc_2026017886')

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
		const collection = app.findCollectionByNameOrId('pbc_2026017886')

		// update collection data
		unmarshal(
			{
				createRule: '@request.auth.id = field.symbol.group.owner.id',
				deleteRule: '@request.auth.id = field.symbol.group.owner.id',
				listRule: '@request.auth.id = field.symbol.group.owner.id',
				updateRule: '@request.auth.id = field.symbol.group.owner.id',
				viewRule: '@request.auth.id = field.symbol.group.owner.id'
			},
			collection
		)

		return app.save(collection)
	}
)
