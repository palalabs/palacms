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
					id: 'text398963028',
					max: 0,
					min: 0,
					name: 'js',
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
					id: 'text2026809048',
					max: 0,
					min: 0,
					name: 'css',
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
					id: 'text410646757',
					max: 0,
					min: 0,
					name: 'html',
					pattern: '',
					presentable: false,
					primaryKey: false,
					required: false,
					system: false,
					type: 'text'
				},
				{
					cascadeDelete: true,
					collectionId: 'pbc_3479997895',
					hidden: false,
					id: 'relation3563057531',
					maxSelect: 1,
					minSelect: 0,
					name: 'group',
					presentable: false,
					required: true,
					system: false,
					type: 'relation'
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
			id: 'pbc_3406698535',
			indexes: ['CREATE UNIQUE INDEX `idx_GYqoayJsVW` ON `library_symbols` (\n  `name`,\n  `group`\n)'],
			listRule: '@request.auth.id = group.owner.id',
			name: 'library_symbols',
			system: false,
			type: 'base',
			updateRule: '@request.auth.id = group.owner.id',
			viewRule: '@request.auth.id = group.owner.id'
		})

		return app.save(collection)
	},
	(app) => {
		const collection = app.findCollectionByNameOrId('pbc_3406698535')

		return app.delete(collection)
	}
)
