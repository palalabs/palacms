/// <reference path="../pb_data/types.d.ts" />
migrate(
	(app) => {
		const collection = app.findCollectionByNameOrId('pbc_149684058')

		// add parent field
		collection.fields.addAt(
			7,
			new Field({
				cascadeDelete: true,
				collectionId: 'pbc_149684058',
				hidden: false,
				id: 'relation1234567890',
				maxSelect: 1,
				minSelect: 0,
				name: 'parent',
				presentable: false,
				required: false,
				system: false,
				type: 'relation'
			})
		)

		return app.save(collection)
	},
	(app) => {
		const collection = app.findCollectionByNameOrId('pbc_149684058')

		// remove parent field
		collection.fields.removeById('relation1234567890')

		return app.save(collection)
	}
)
