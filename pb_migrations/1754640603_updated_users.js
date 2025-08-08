/// <reference path="../pb_data/types.d.ts" />
migrate(
	(app) => {
		const collection = app.findCollectionByNameOrId('_pb_users_auth_')

		// update collection data
		unmarshal(
			{
				createRule: "@request.auth.serverRole != ''",
				deleteRule: "@request.auth.serverRole != '' || id = @request.auth.id",
				listRule: "@request.auth.serverRole != '' || id = @request.auth.id",
				oauth2: {
					mappedFields: {
						avatarURL: ''
					}
				},
				updateRule: "@request.auth.serverRole != '' || id = @request.auth.id",
				viewRule: "@request.auth.serverRole != '' || id = @request.auth.id"
			},
			collection
		)

		// remove field
		collection.fields.removeById('file376926767')

		// add field
		collection.fields.addAt(
			7,
			new Field({
				hidden: false,
				id: 'select1466534506',
				maxSelect: 1,
				name: 'serverRole',
				presentable: false,
				required: false,
				system: false,
				type: 'select',
				values: ['editor', 'developer']
			})
		)

		// update field
		collection.fields.addAt(
			4,
			new Field({
				hidden: true,
				id: 'bool1547992806',
				name: 'emailVisibility',
				presentable: false,
				required: false,
				system: true,
				type: 'bool'
			})
		)

		// update field
		collection.fields.addAt(
			5,
			new Field({
				hidden: true,
				id: 'bool256245529',
				name: 'verified',
				presentable: false,
				required: false,
				system: true,
				type: 'bool'
			})
		)

		return app.save(collection)
	},
	(app) => {
		const collection = app.findCollectionByNameOrId('_pb_users_auth_')

		// update collection data
		unmarshal(
			{
				createRule: null,
				deleteRule: 'id = @request.auth.id',
				listRule: 'id = @request.auth.id',
				oauth2: {
					mappedFields: {
						avatarURL: 'avatar'
					}
				},
				updateRule: 'id = @request.auth.id',
				viewRule: 'id = @request.auth.id'
			},
			collection
		)

		// add field
		collection.fields.addAt(
			7,
			new Field({
				hidden: false,
				id: 'file376926767',
				maxSelect: 1,
				maxSize: 0,
				mimeTypes: ['image/jpeg', 'image/png', 'image/svg+xml', 'image/gif', 'image/webp'],
				name: 'avatar',
				presentable: false,
				protected: false,
				required: false,
				system: false,
				thumbs: null,
				type: 'file'
			})
		)

		// remove field
		collection.fields.removeById('select1466534506')

		// update field
		collection.fields.addAt(
			4,
			new Field({
				hidden: false,
				id: 'bool1547992806',
				name: 'emailVisibility',
				presentable: false,
				required: false,
				system: true,
				type: 'bool'
			})
		)

		// update field
		collection.fields.addAt(
			5,
			new Field({
				hidden: false,
				id: 'bool256245529',
				name: 'verified',
				presentable: false,
				required: false,
				system: true,
				type: 'bool'
			})
		)

		return app.save(collection)
	}
)
