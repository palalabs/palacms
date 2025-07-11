/// <reference path="../pb_data/types.d.ts" />
migrate(
	(app) => {
		const collection = app.findCollectionByNameOrId('pbc_2001081480')

		// update collection data
		unmarshal(
			{
				indexes: ['CREATE UNIQUE INDEX `idx_ivHryyog5w` ON `sites` (\n  `name`,\n  `group`\n)', 'CREATE UNIQUE INDEX `idx_r0T0jyPOdd` ON `sites` (`host`)']
			},
			collection
		)

		// add field
		collection.fields.addAt(
			3,
			new Field({
				autogeneratePattern: '',
				hidden: false,
				id: 'text3475444733',
				max: 0,
				min: 0,
				name: 'host',
				pattern: '',
				presentable: false,
				primaryKey: false,
				required: true,
				system: false,
				type: 'text'
			})
		)

		return app.save(collection)
	},
	(app) => {
		const collection = app.findCollectionByNameOrId('pbc_2001081480')

		// update collection data
		unmarshal(
			{
				indexes: ['CREATE UNIQUE INDEX `idx_ivHryyog5w` ON `sites` (\n  `name`,\n  `group`\n)']
			},
			collection
		)

		// remove field
		collection.fields.removeById('text3475444733')

		return app.save(collection)
	}
)
