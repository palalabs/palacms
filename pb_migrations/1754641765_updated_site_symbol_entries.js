/// <reference path="../pb_data/types.d.ts" />
migrate(
	(app) => {
		const collection = app.findCollectionByNameOrId('pbc_1163071009')

		// add field
		collection.fields.addAt(
			3,
			new Field({
				cascadeDelete: false,
				collectionId: 'pbc_1163071009',
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
				onlyInt: false,
				presentable: false,
				required: false,
				system: false,
				type: 'number'
			})
		)

		// update field
		collection.fields.addAt(
			2,
			new Field({
				cascadeDelete: true,
				collectionId: 'pbc_149684058',
				hidden: false,
				id: 'relation1542800728',
				maxSelect: 1,
				minSelect: 0,
				name: 'field',
				presentable: false,
				required: false,
				system: false,
				type: 'relation'
			})
		)

		return app.save(collection)
	},
	(app) => {
		const collection = app.findCollectionByNameOrId('pbc_1163071009')

		// remove field
		collection.fields.removeById('relation1032740943')

		// remove field
		collection.fields.removeById('number2155046657')

		// update field
		collection.fields.addAt(
			2,
			new Field({
				cascadeDelete: true,
				collectionId: 'pbc_149684058',
				hidden: false,
				id: 'relation1542800728',
				maxSelect: 1,
				minSelect: 0,
				name: 'field',
				presentable: false,
				required: true,
				system: false,
				type: 'relation'
			})
		)

		return app.save(collection)
	}
)
