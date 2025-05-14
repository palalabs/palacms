/// <reference path="../pb_data/types.d.ts" />
migrate(
	(app) => {
		const collection = new Collection({
			createRule: '@request.auth.id = page_type.site.group.owner.id && symbol.site.id = page_type.site.id',
			deleteRule: '@request.auth.id = page_type.site.group.owner.id && symbol.site.id = page_type.site.id',
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
					cascadeDelete: true,
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
					collectionId: 'pbc_1322267247',
					hidden: false,
					id: 'relation3972544249',
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
			id: 'pbc_3564279343',
			indexes: ['CREATE UNIQUE INDEX `idx_6lGEJ55d9O` ON `page_type_symbols` (\n  `page_type`,\n  `symbol`\n)'],
			listRule: '@request.auth.id = page_type.site.group.owner.id && symbol.site.id = page_type.site.id',
			name: 'page_type_symbols',
			system: false,
			type: 'base',
			updateRule: '@request.auth.id = page_type.site.group.owner.id && symbol.site.id = page_type.site.id',
			viewRule: '@request.auth.id = page_type.site.group.owner.id && symbol.site.id = page_type.site.id'
		})

		return app.save(collection)
	},
	(app) => {
		const collection = app.findCollectionByNameOrId('pbc_3564279343')

		return app.delete(collection)
	}
)
