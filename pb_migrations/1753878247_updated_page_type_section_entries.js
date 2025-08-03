/// <reference path="../pb_data/types.d.ts" />
migrate(
	(app) => {
		const collection = app.findCollectionByNameOrId('pbc_3303549340')

		// update collection data
		unmarshal(
			{
				indexes: []
			},
			collection
		)

		// update field
		collection.fields.addAt(
			5,
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
		const collection = app.findCollectionByNameOrId('pbc_3303549340')

		// update collection data
		unmarshal(
			{
				indexes: ['CREATE UNIQUE INDEX `idx_iN1Hji8J4T` ON `page_type_section_entries` (\n  `section`,\n  `locale`,\n  `field`\n)']
			},
			collection
		)

		// update field
		collection.fields.addAt(
			5,
			new Field({
				hidden: false,
				id: 'number2155046657',
				max: null,
				min: 0,
				name: 'index',
				onlyInt: false,
				presentable: false,
				required: false,
				system: false,
				type: 'number'
			})
		)

		return app.save(collection)
	}
)
