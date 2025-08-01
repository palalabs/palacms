/// <reference path="../pb_data/types.d.ts" />
migrate(
	(app) => {
		const collection = new Collection({
			createRule: '@request.auth.id = group.owner.id',
			deleteRule: '@request.auth.id = group.owner.id',
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
					collectionId: 'pbc_1192439887',
					hidden: false,
					id: 'relation1841317061',
					maxSelect: 1,
					minSelect: 0,
					name: 'group',
					presentable: false,
					required: true,
					system: false,
					type: 'relation'
				},
				{
					autogeneratePattern: '',
					hidden: false,
					id: 'text2817783452',
					max: 0,
					min: 0,
					name: 'head',
					pattern: '',
					presentable: false,
					primaryKey: false,
					required: false,
					system: false,
					type: 'text'
				},
				{
					autogeneratePattern: '',
					hidden: false,
					id: 'text3381606803',
					max: 0,
					min: 0,
					name: 'foot',
					pattern: '',
					presentable: false,
					primaryKey: false,
					required: false,
					system: false,
					type: 'text'
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
			id: 'pbc_2001081480',
			indexes: ['CREATE UNIQUE INDEX `idx_ivHryyog5w` ON `sites` (\n  `name`,\n  `group`\n)'],
			listRule: '@request.auth.id = group.owner.id',
			name: 'sites',
			system: false,
			type: 'base',
			updateRule: '@request.auth.id = group.owner.id',
			viewRule: '@request.auth.id = group.owner.id'
		})

		return app.save(collection)
	},
	(app) => {
		const collection = app.findCollectionByNameOrId('pbc_2001081480')

		return app.delete(collection)
	}
)
