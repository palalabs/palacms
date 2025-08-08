/// <reference path="../pb_data/types.d.ts" />
migrate(
	(app) => {
		const collection = app.findCollectionByNameOrId('pbc_1111325129')

		// update collection data
		const authorizeServerMembersRule = '@request.auth.serverRole != ""'
		const authorizeSiteMembersRule = '@collection.site_role_assignments.user.id = @request.auth.id && @collection.site_role_assignments.site.id = symbol.site.id'
		const authorizeRule = `(${authorizeServerMembersRule}) || (${authorizeSiteMembersRule})`
		const validateRule = 'symbol.site.id = page.site.id'
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
		const collection = app.findCollectionByNameOrId('pbc_1111325129')

		// update collection data
		unmarshal(
			{
				createRule: '@request.auth.id = page.site.group.owner.id && symbol.site.id = page.site.id',
				deleteRule: '@request.auth.id = page.site.group.owner.id && symbol.site.id = page.site.id',
				listRule: '@request.auth.id = page.site.group.owner.id && symbol.site.id = page.site.id',
				updateRule: '@request.auth.id = page.site.group.owner.id && symbol.site.id = page.site.id',
				viewRule: '@request.auth.id = page.site.group.owner.id && symbol.site.id = page.site.id'
			},
			collection
		)

		return app.save(collection)
	}
)
