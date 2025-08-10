/// <reference path="../pb_data/types.d.ts" />
migrate(
	(app) => {
		const collection = app.findCollectionByNameOrId('pbc_496957621')

		// update collection data
		const authorizeServerMembersRule = '@request.auth.serverRole != ""'
		const authorizeSiteMembersRule = '@collection.site_role_assignments.user.id = @request.auth.id && @collection.site_role_assignments.site.id = page_type.site.id'
		const authorizeRule = `(${authorizeServerMembersRule}) || (${authorizeSiteMembersRule})`
		const validateRule = 'symbol.site.id = page_type.site.id'
		unmarshal(
			{
				createRule: `(${validateRule}) && (${authorizeRule})`,
				deleteRule: authorizeRule,
				listRule: authorizeRule,
				updateRule: `(${validateRule}) && (${authorizeRule})`,
				viewRule: authorizeRule
			},
			collection
		)

		return app.save(collection)
	},
	(app) => {
		const collection = app.findCollectionByNameOrId('pbc_496957621')

		// update collection data
		unmarshal(
			{
				createRule: '@request.auth.id = page_type.site.group.owner.id && symbol.site.id = page_type.site.id',
				deleteRule: '@request.auth.id = page_type.site.group.owner.id && symbol.site.id = page_type.site.id',
				listRule: '@request.auth.id = page_type.site.group.owner.id && symbol.site.id = page_type.site.id',
				updateRule: '@request.auth.id = page_type.site.group.owner.id && symbol.site.id = page_type.site.id',
				viewRule: '@request.auth.id = page_type.site.group.owner.id && symbol.site.id = page_type.site.id'
			},
			collection
		)

		return app.save(collection)
	}
)
