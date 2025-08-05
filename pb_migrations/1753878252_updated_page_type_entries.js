/// <reference path="../pb_data/types.d.ts" />
migrate(
	(app) => {
		const collection = app.findCollectionByNameOrId('pbc_638150767')

		// update collection data
		unmarshal(
			{
				indexes: []
			},
			collection
		)

		// add field
		collection.fields.addAt(
			3,
			new Field({
				cascadeDelete: false,
				collectionId: 'pbc_638150767',
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

		// add field
		collection.fields.addAt(
			4,
			new Field({
				hidden: false,
				id: 'number2155046657',
				max: null,
				min: 0,
				name: 'index',
				onlyInt: true,
				presentable: false,
				required: false,
				system: false,
				type: 'number'
			})
		)

		return app.save(collection)
	},
	(app) => {
		const collection = app.findCollectionByNameOrId('pbc_638150767')

		// update collection data
		unmarshal(
			{
				indexes: ['CREATE UNIQUE INDEX `idx_pgGoOJxC2q` ON `page_type_entries` (\n  `field`,\n  `locale`\n)']
			},
			collection
		)

		// remove field
		collection.fields.removeById('relation1032740943')

		// remove field
		collection.fields.removeById('number2155046657')

		return app.save(collection)
	}
)
