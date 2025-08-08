/// <reference path="../pb_data/types.d.ts" />
migrate(
	(app) => {
		const collection = app.findCollectionByNameOrId('pbc_149684058')

		// update collection data
		const authorizeServerMembersRule = '@request.auth.serverRole != ""'
		const authorizeSiteMembersRule = '@collection.site_role_assignments.user.id = @request.auth.id && @collection.site_role_assignments.site.id = symbol.site.id'
		const authorizeRule = `(${authorizeServerMembersRule}) || (${authorizeSiteMembersRule})`
		unmarshal(
			{
				createRule: authorizeRule,
				deleteRule: authorizeRule,
				listRule: authorizeRule,
				updateRule: authorizeRule,
				viewRule: authorizeRule
			},
			collection
		)

		return app.save(collection)
	},
	(app) => {
		const collection = app.findCollectionByNameOrId('pbc_149684058')

		// update collection data
		unmarshal(
			{
				createRule: '@request.auth.id = symbol.site.group.owner.id',
				deleteRule: '@request.auth.id = symbol.site.group.owner.id',
				listRule: '@request.auth.id = symbol.site.group.owner.id',
				updateRule: '@request.auth.id = symbol.site.group.owner.id',
				viewRule: '@request.auth.id = symbol.site.group.owner.id'
			},
			collection
		)

		return app.save(collection)
	}
)
