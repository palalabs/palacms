/// <reference path="../pb_data/types.d.ts" />
migrate(
	(app) => {
		const collection = new Collection({
			createRule: '@request.auth.id = site_field.site.group.owner.id',
			deleteRule: '@request.auth.id = site_field.site.group.owner.id',
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
					id: 'text1098958488',
					max: 0,
					min: 0,
					name: 'locale',
					pattern: '',
					presentable: false,
					primaryKey: false,
					required: true,
					system: false,
					type: 'text'
				},
				{
					cascadeDelete: true,
					collectionId: 'pbc_4273630883',
					hidden: false,
					id: 'relation1542800728',
					maxSelect: 1,
					minSelect: 0,
					name: 'site_field',
					presentable: false,
					required: true,
					system: false,
					type: 'relation'
				},
				{
					hidden: false,
					id: 'json494360628',
					maxSize: 0,
					name: 'value',
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
			id: 'pbc_298548709',
			indexes: ['CREATE UNIQUE INDEX `idx_1ygdlrWlu8` ON `site_entries` (\n  `site_field`,\n  `locale`\n)'],
			listRule: '@request.auth.id = site_field.site.group.owner.id',
			name: 'site_entries',
			system: false,
			type: 'base',
			updateRule: '@request.auth.id = site_field.site.group.owner.id',
			viewRule: '@request.auth.id = site_field.site.group.owner.id'
		})

		return app.save(collection)
	},
	(app) => {
		const collection = app.findCollectionByNameOrId('pbc_298548709')

		return app.delete(collection)
	}
)
