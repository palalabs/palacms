/// <reference path="../pb_data/types.d.ts" />
migrate(
	(app) => {
		const collection = app.findCollectionByNameOrId('_pb_users_auth_')

		// add field
		collection.fields.addAt(
			8,
			new Field({
				hidden: false,
				id: 'select3353481431',
				maxSelect: 1,
				name: 'invite',
				presentable: false,
				required: false,
				system: false,
				type: 'select',
				values: ['pending', 'sent']
			})
		)

		return app.save(collection)
	},
	(app) => {
		const collection = app.findCollectionByNameOrId('_pb_users_auth_')

		// remove field
		collection.fields.removeById('select3353481431')

		return app.save(collection)
	}
)
