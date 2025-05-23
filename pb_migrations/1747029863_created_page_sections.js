/// <reference path="../pb_data/types.d.ts" />
migrate(
	(app) => {
		const collection = new Collection({
			createRule: '@request.auth.id = page.site.group.owner.id && site_symbol.site.id = page.site.id',
			deleteRule: '@request.auth.id = page.site.group.owner.id && site_symbol.site.id = page.site.id',
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
					collectionId: 'pbc_3945946014',
					hidden: false,
					id: 'relation336246304',
					maxSelect: 1,
					minSelect: 0,
					name: 'page',
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
					name: 'site_symbol',
					presentable: false,
					required: true,
					system: false,
					type: 'relation'
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
			id: 'pbc_1111325129',
			indexes: ['CREATE INDEX `idx_17WMSNScHZ` ON `page_sections` (\n  `page`,\n  `index`\n)'],
			listRule: '@request.auth.id = page.site.group.owner.id && site_symbol.site.id = page.site.id',
			name: 'page_sections',
			system: false,
			type: 'base',
			updateRule: '@request.auth.id = page.site.group.owner.id && site_symbol.site.id = page.site.id',
			viewRule: '@request.auth.id = page.site.group.owner.id && site_symbol.site.id = page.site.id'
		})

		return app.save(collection)
	},
	(app) => {
		const collection = app.findCollectionByNameOrId('pbc_1111325129')

		return app.delete(collection)
	}
)
