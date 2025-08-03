/// <reference path="../pb_data/types.d.ts" />
migrate(
	(app) => {
		const collection = app.findCollectionByNameOrId('pbc_2147490902')

		// update collection data
		unmarshal(
			{
				indexes: []
			},
			collection
		)

		// add field
		collection.fields.addAt(
			4,
			new Field({
				cascadeDelete: false,
				collectionId: 'pbc_2147490902',
				hidden: false,
				id: 'relation1032740943',
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
		const collection = app.findCollectionByNameOrId('pbc_2147490902')

		// update collection data
		unmarshal(
			{
				indexes: ['CREATE UNIQUE INDEX `idx_VZ8zvbu4HP` ON `page_entries` (\n  `field`,\n  `locale`,\n  `page`\n)']
			},
			collection
		)

		// remove field
		collection.fields.removeById('relation1032740943')

		return app.save(collection)
	}
)
