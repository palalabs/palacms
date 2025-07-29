/// <reference path="../pb_data/types.d.ts" />
migrate(
	(app) => {
		const collection = app.findCollectionByNameOrId('pbc_3303549340')

		// update collection data
		unmarshal(
			{
				createRule: '@request.auth.id != "" && field.symbol.id = section.symbol.id',
				deleteRule: '@request.auth.id != "" && field.symbol.id = section.symbol.id',
				listRule: '@request.auth.id != "" && field.symbol.id = section.symbol.id',
				updateRule: '@request.auth.id != "" && field.symbol.id = section.symbol.id',
				viewRule: '@request.auth.id != "" && field.symbol.id = section.symbol.id'
			},
			collection
		)

		return app.save(collection)
	},
	(app) => {
		const collection = app.findCollectionByNameOrId('pbc_3303549340')

		// update collection data
		unmarshal(
			{
				createRule: '@request.auth.id = section.page_type.site.group.owner.id && field.symbol.id = section.symbol.id',
				deleteRule: '@request.auth.id = section.page_type.site.group.owner.id && field.symbol.id = section.symbol.id',
				listRule: '@request.auth.id = section.page_type.site.group.owner.id && field.symbol.id = section.symbol.id',
				updateRule: '@request.auth.id = section.page_type.site.group.owner.id && field.symbol.id = section.symbol.id',
				viewRule: '@request.auth.id = section.page_type.site.group.owner.id && field.symbol.id = section.symbol.id'
			},
			collection
		)

		return app.save(collection)
	}
)
