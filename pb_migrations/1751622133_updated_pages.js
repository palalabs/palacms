/// <reference path="../pb_data/types.d.ts" />
migrate(
	(app) => {
		const collection = app.findCollectionByNameOrId('pbc_3945946014')

		// add field
		collection.fields.addAt(
			3,
			new Field({
				hidden: false,
				id: 'file898862634',
				maxSelect: 1,
				maxSize: 0,
				mimeTypes: ['text/html'],
				name: 'compiled_html',
				presentable: false,
				protected: false,
				required: false,
				system: false,
				thumbs: [],
				type: 'file'
			})
		)

		return app.save(collection)
	},
	(app) => {
		const collection = app.findCollectionByNameOrId('pbc_3945946014')

		// remove field
		collection.fields.removeById('file898862634')

		return app.save(collection)
	}
)
