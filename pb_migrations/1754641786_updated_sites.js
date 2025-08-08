/// <reference path="../pb_data/types.d.ts" />
migrate(
	(app) => {
		const collection = app.findCollectionByNameOrId('pbc_2001081480')

		// update collection data
		const authorizeServerMembersRule = '@request.auth.serverRole != ""'
		const authorizeSiteMembersRule = '@collection.site_role_assignments.user.id = @request.auth.id && @collection.site_role_assignments.site.id = id'
		unmarshal(
			{
				createRule: authorizeServerMembersRule,
				deleteRule: authorizeServerMembersRule,
				listRule: `(${authorizeServerMembersRule}) || (${authorizeSiteMembersRule})`,
				updateRule: authorizeServerMembersRule,
				viewRule: `(${authorizeServerMembersRule}) || (${authorizeSiteMembersRule})`
			},
			collection
		)

		return app.save(collection)
	},
	(app) => {
		const collection = app.findCollectionByNameOrId('pbc_2001081480')

		// update collection data
		unmarshal(
			{
				createRule: '@request.auth.id = group.owner.id',
				deleteRule: '@request.auth.id = group.owner.id',
				listRule: '@request.auth.id = group.owner.id',
				updateRule: '@request.auth.id = group.owner.id',
				viewRule: '@request.auth.id = group.owner.id'
			},
			collection
		)

		return app.save(collection)
	}
)
