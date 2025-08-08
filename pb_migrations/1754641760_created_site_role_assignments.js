/// <reference path="../pb_data/types.d.ts" />
migrate(
	(app) => {
		const collection = new Collection({
			createRule: "@request.auth.serverRole != ''",
			deleteRule: "@request.auth.serverRole != ''",
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
					cascadeDelete: true,
					collectionId: '_pb_users_auth_',
					hidden: false,
					id: 'relation2375276105',
					maxSelect: 1,
					minSelect: 0,
					name: 'user',
					presentable: false,
					required: true,
					system: false,
					type: 'relation'
				},
				{
					hidden: false,
					id: 'select1466534506',
					maxSelect: 1,
					name: 'role',
					presentable: false,
					required: true,
					system: false,
					type: 'select',
					values: ['editor', 'developer']
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
			id: 'pbc_2362756690',
			indexes: ['CREATE UNIQUE INDEX `idx_Z47WHtRrTe` ON `site_role_assignments` (\n  `site`,\n  `user`,\n  `role`\n)'],
			listRule: "@request.auth.serverRole != ''",
			name: 'site_role_assignments',
			system: false,
			type: 'base',
			updateRule: "@request.auth.serverRole != ''",
			viewRule: "@request.auth.serverRole != ''"
		})

		return app.save(collection)
	},
	(app) => {
		const collection = app.findCollectionByNameOrId('pbc_2362756690')

		return app.delete(collection)
	}
)
