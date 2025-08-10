/// <reference path="../pb_data/types.d.ts" />
migrate(
	(app) => {
		const collection = app.findCollectionByNameOrId('pbc_3303549340')

		// update collection data
		const authorizeServerMembersRule = '@request.auth.serverRole != ""'
		const authorizeSiteMembersRule = '@collection.site_role_assignments.user.id = @request.auth.id && @collection.site_role_assignments.site.id = section.symbol.site.id'
		const authorizeRule = `(${authorizeServerMembersRule}) || (${authorizeSiteMembersRule})`
		const validateRule = 'field.symbol.id = section.symbol.id'
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
		const collection = app.findCollectionByNameOrId('pbc_3303549340')

		// update collection data
		unmarshal(
			{
				createRule: '@request.auth.id = section.page_type.site.group.owner.id && field.symbol.id = section.symbol.id',
				deleteRule: '@request.auth.id = section.page_type.site.group.owner.id && field.symbol.id = section.symbol.id',
				listRule: '@request.auth.id = section.page_type.site.group.owner.id && field.symbol.id = section.symbol.id',
				updateRule: '@request.auth.id = section.page_type.site.group.owner.id && field.symbol.id = section.symbol.id',
				viewRule: '@request.auth.id = section.page_type.site.group.owner.id && field.symbol.id = section.symbol.id'
			},
			collection
		)

		return app.save(collection)
	}
)
