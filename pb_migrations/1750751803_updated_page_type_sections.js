/// <reference path="../pb_data/types.d.ts" />
migrate(
	(app) => {
		const collection = app.findCollectionByNameOrId('pbc_496957621')

		// update collection data
		unmarshal(
			{
				indexes: ['CREATE UNIQUE INDEX `idx_18mJGVnXFu` ON `page_type_sections` (\n  `page_type`,\n  `index`,\n  `zone`\n)']
			},
			collection
		)

		// add field
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

		// update collection data
		unmarshal(
			{
				indexes: ['CREATE UNIQUE INDEX `idx_18mJGVnXFu` ON `page_type_sections` (\n  `page_type`,\n  `index`\n)']
			},
			collection
		)

		// remove field
		collection.fields.removeById('select2699804679')

		return app.save(collection)
	}
)
