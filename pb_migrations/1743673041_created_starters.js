/// <reference path="../pb_data/types.d.ts" />
migrate(
	(app) => {
		const collection = new Collection({
			createRule: '@request.auth.id = library.owner.id',
			deleteRule: '@request.auth.id = library.owner.id',
			fields: [
				{
					autogeneratePattern: '[a-z0-9]{15}',
					hidden: false,
					id: 'text3208210256',
					max: 15,
					min: 15,
					name: 'id',
					pattern: '^[a-z0-9]+$',
					presentable: false,
					primaryKey: true,
					required: true,
					system: true,
					type: 'text'
				},
				{
					autogeneratePattern: '',
					hidden: false,
					id: 'text1579384326',
					max: 0,
					min: 0,
					name: 'name',
					pattern: '',
					presentable: true,
					primaryKey: false,
					required: true,
					system: false,
					type: 'text'
				},
				{
					autogeneratePattern: '',
					hidden: false,
					id: 'text1843675174',
					max: 0,
					min: 0,
					name: 'description',
					pattern: '',
					presentable: false,
					primaryKey: false,
					required: false,
					system: false,
					type: 'text'
				},
				{
					cascadeDelete: true,
					collectionId: 'pbc_1593226033',
					hidden: false,
					id: 'relation2709559484',
					maxSelect: 1,
					minSelect: 0,
					name: 'library',
					presentable: false,
					required: true,
					system: false,
					type: 'relation'
				},
				{
					hidden: false,
					id: 'json2918445923',
					maxSize: 0,
					name: 'data',
					presentable: false,
					required: true,
					system: false,
					type: 'json'
				},
				{
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
				},
				{
					hidden: false,
					id: 'autodate2990389176',
					name: 'created',
					onCreate: true,
					onUpdate: false,
					presentable: false,
					system: false,
					type: 'autodate'
				},
				{
					hidden: false,
					id: 'autodate3332085495',
					name: 'updated',
					onCreate: true,
					onUpdate: true,
					presentable: false,
					system: false,
					type: 'autodate'
				}
			],
			id: 'pbc_560631705',
			indexes: [],
			listRule: '@request.auth.id = library.owner.id',
			name: 'starters',
			system: false,
			type: 'base',
			updateRule: '@request.auth.id = library.owner.id',
			viewRule: '@request.auth.id = library.owner.id'
		})

		return app.save(collection)
	},
	(app) => {
		const collection = app.findCollectionByNameOrId('pbc_560631705')

		return app.delete(collection)
	}
)
