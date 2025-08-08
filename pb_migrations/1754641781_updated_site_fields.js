/// <reference path="../pb_data/types.d.ts" />
migrate(
	(app) => {
		const collection = app.findCollectionByNameOrId('pbc_4273630883')

		// update collection data
		const authorizeServerMembersRule = '@request.auth.serverRole != ""'
		const authorizeSiteMembersRule = '@collection.site_role_assignments.user.id = @request.auth.id && @collection.site_role_assignments.site.id = site.id'
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
		const collection = app.findCollectionByNameOrId('pbc_4273630883')

		// update collection data
		unmarshal(
			{
				createRule: '@request.auth.id = site.group.owner.id',
				deleteRule: '@request.auth.id = site.group.owner.id',
				listRule: '@request.auth.id = site.group.owner.id',
				updateRule: '@request.auth.id = site.group.owner.id',
				viewRule: '@request.auth.id = site.group.owner.id'
			},
			collection
		)

		return app.save(collection)
	}
)
