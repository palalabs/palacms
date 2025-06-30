/// <reference path="../pb_data/types.d.ts" />
migrate(
	(app) => {
		const collection = app.findCollectionByNameOrId('pbc_496957621')

		// update field
		collection.fields.addAt(
			4,
			new Field({
				hidden: false,
				id: 'select2699804679',
				maxSelect: 1,
				name: 'zone',
				presentable: false,
				required: true,
				system: false,
				type: 'select',
				values: ['header', 'body', 'footer']
			})
		)

		return app.save(collection)
	},
	(app) => {
		const collection = app.findCollectionByNameOrId('pbc_496957621')

		// update field
		collection.fields.addAt(
			4,
			new Field({
				hidden: false,
				id: 'select2699804679',
				maxSelect: 1,
				name: 'zone',
				presentable: false,
				required: false,
				system: false,
				type: 'select',
				values: ['header', 'body', 'footer']
			})
		)

		return app.save(collection)
	}
)
