/// <reference path="../pb_data/types.d.ts" />
migrate(
	(app) => {
		const collection = app.findCollectionByNameOrId('pbc_3945946014')

		// update collection data
		unmarshal(
			{
				createRule: "@request.auth.id = site.group.owner.id && page_type.site.id = site.id && (parent = '' || parent.site.id = site.id)",
				deleteRule: "@request.auth.id = site.group.owner.id && page_type.site.id = site.id && (parent = '' || parent.site.id = site.id)",
				listRule: "@request.auth.id = site.group.owner.id && page_type.site.id = site.id && (parent = '' || parent.site.id = site.id)",
				updateRule: "@request.auth.id = site.group.owner.id && page_type.site.id = site.id && (parent = '' || parent.site.id = site.id)",
				viewRule: "@request.auth.id = site.group.owner.id && page_type.site.id = site.id && (parent = '' || parent.site.id = site.id)"
			},
			collection
		)

		// add field
		collection.fields.addAt(
			4,
			new Field({
				cascadeDelete: true,
				collectionId: 'pbc_3945946014',
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
		const collection = app.findCollectionByNameOrId('pbc_3945946014')

		// update collection data
		unmarshal(
			{
				createRule: '@request.auth.id = site.group.owner.id && page_type.site.id = site.id',
				deleteRule: '@request.auth.id = site.group.owner.id && page_type.site.id = site.id',
				indexes: [],
				listRule: '@request.auth.id = site.group.owner.id && page_type.site.id = site.id',
				updateRule: '@request.auth.id = site.group.owner.id && page_type.site.id = site.id',
				viewRule: '@request.auth.id = site.group.owner.id && page_type.site.id = site.id'
			},
			collection
		)

		// remove field
		collection.fields.removeById('relation1032740943')

		return app.save(collection)
	}
)
