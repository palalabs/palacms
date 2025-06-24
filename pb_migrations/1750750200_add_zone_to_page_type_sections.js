/// <reference path="../pb_data/types.d.ts" />
migrate(
	(app) => {
		// Empty migration - zone field will be added manually through admin UI
		return null
	},
	(app) => {
		// Empty rollback
		return null
	}
)