/// <reference path="../pb_data/types.d.ts" />
migrate(
	(app) => {
		const collection = new Collection({
			createRule: '@request.auth.id = site.group.owner.id && page_type.site.id = site.id',
			deleteRule: '@request.auth.id = site.group.owner.id && page_type.site.id = site.id',
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
					id: 'text2560465762',
					max: 0,
					min: 0,
					name: 'slug',
					pattern: '',
					presentable: false,
					primaryKey: false,
					required: false,
					system: false,
					type: 'text'
				},
				{
					cascadeDelete: false,
					collectionId: 'pbc_3238086262',
					hidden: false,
					id: 'relation186272755',
					maxSelect: 1,
					minSelect: 0,
					name: 'page_type',
					presentable: false,
					required: true,
					system: false,
					type: 'relation'
				},
				{
					cascadeDelete: true,
					collectionId: 'pbc_2001081480',
					hidden: false,
					id: 'relation1766001124',
					maxSelect: 1,
					minSelect: 0,
					name: 'site',
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
			id: 'pbc_3945946014',
			indexes: [],
			listRule: '@request.auth.id = site.group.owner.id && page_type.site.id = site.id',
			name: 'pages',
			system: false,
			type: 'base',
			updateRule: '@request.auth.id = site.group.owner.id && page_type.site.id = site.id',
			viewRule: '@request.auth.id = site.group.owner.id && page_type.site.id = site.id'
		})

		return app.save(collection)
	},
	(app) => {
		const collection = app.findCollectionByNameOrId('pbc_3945946014')

		return app.delete(collection)
	}
)
