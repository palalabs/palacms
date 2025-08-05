/// <reference path="../pb_data/types.d.ts" />
migrate(
	(app) => {
		const collection = app.findCollectionByNameOrId('pbc_2001081480')

		// add field
		collection.fields.addAt(
			7,
			new Field({
				hidden: false,
				id: 'file3112513328',
				maxSelect: 1,
				maxSize: 0,
				mimeTypes: [],
				name: 'preview',
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
		const collection = app.findCollectionByNameOrId('pbc_2001081480')

		// remove field
		collection.fields.removeById('file3112513328')

		return app.save(collection)
	}
)
