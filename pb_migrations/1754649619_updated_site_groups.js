/// <reference path="../pb_data/types.d.ts" />
migrate(
	(app) => {
		const collection = app.findCollectionByNameOrId('pbc_1192439887')

		// update collection data
		unmarshal(
			{
				indexes: ['CREATE UNIQUE INDEX `idx_q2lOPpX7Th` ON `site_groups` (`name`)']
			},
			collection
		)

		// remove field
		collection.fields.removeById('relation3479234172')

		return app.save(collection)
	},
	(app) => {
		const collection = app.findCollectionByNameOrId('pbc_1192439887')

		// update collection data
		unmarshal(
			{
				indexes: ['CREATE UNIQUE INDEX `idx_q2lOPpX7Th` ON `site_groups` (\n  `name`,\n  `owner`\n)']
			},
			collection
		)

		// add field
		collection.fields.addAt(
			2,
			new Field({
				cascadeDelete: true,
				collectionId: '_pb_users_auth_',
				hidden: false,
				id: 'relation3479234172',
				maxSelect: 1,
				minSelect: 0,
				name: 'owner',
				presentable: false,
				required: true,
				system: false,
				type: 'relation'
			})
		)

		return app.save(collection)
	}
)
