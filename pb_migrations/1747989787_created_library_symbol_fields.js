/// <reference path="../pb_data/types.d.ts" />
migrate(
	(app) => {
		const collection = new Collection({
			createRule: '@request.auth.id = symbol.group.owner.id',
			deleteRule: '@request.auth.id = symbol.group.owner.id',
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
					id: 'text2324736937',
					max: 0,
					min: 0,
					name: 'key',
					pattern: '',
					presentable: false,
					primaryKey: false,
					required: true,
					system: false,
					type: 'text'
				},
				{
					autogeneratePattern: '',
					hidden: false,
					id: 'text245846248',
					max: 0,
					min: 0,
					name: 'label',
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
					id: 'text2363381545',
					max: 0,
					min: 0,
					name: 'type',
					pattern: '',
					presentable: false,
					primaryKey: false,
					required: true,
					system: false,
					type: 'text'
				},
				{
					cascadeDelete: true,
					collectionId: 'pbc_3406698535',
					hidden: false,
					id: 'relation1193979506',
					maxSelect: 1,
					minSelect: 0,
					name: 'symbol',
					presentable: false,
					required: true,
					system: false,
					type: 'relation'
				},
				{
					hidden: false,
					id: 'json3565825916',
					maxSize: 0,
					name: 'config',
					presentable: false,
					required: false,
					system: false,
					type: 'json'
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
			id: 'pbc_1105483583',
			indexes: ['CREATE UNIQUE INDEX `idx_jOU36yKglP` ON `library_symbol_fields` (\n  `key`,\n  `symbol`\n)'],
			listRule: '@request.auth.id = symbol.group.owner.id',
			name: 'library_symbol_fields',
			system: false,
			type: 'base',
			updateRule: '@request.auth.id = symbol.group.owner.id',
			viewRule: '@request.auth.id = symbol.group.owner.id'
		})

		return app.save(collection)
	},
	(app) => {
		const collection = app.findCollectionByNameOrId('pbc_1105483583')

		return app.delete(collection)
	}
)
