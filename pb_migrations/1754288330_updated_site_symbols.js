/// <reference path="../pb_data/types.d.ts" />
migrate(
	(app) => {
		const collection = app.findCollectionByNameOrId('pbc_1322267247')

		// add field
		collection.fields.addAt(
			6,
			new Field({
				hidden: false,
				id: 'file911310099',
				maxSelect: 1,
				maxSize: 0,
				mimeTypes: [],
				name: 'compiled_js',
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
		const collection = app.findCollectionByNameOrId('pbc_1322267247')

		// remove field
		collection.fields.removeById('file911310099')

		return app.save(collection)
	}
)
