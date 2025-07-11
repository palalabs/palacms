/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
	const settings = app.settings()
	settings.meta.appName = 'PalaCMS'
	app.save(settings)

	let superuserCreated = false
	const superuserEmail = $os.getenv('PALA_SUPERUSER_EMAIL')
	const superuserPassword = $os.getenv('PALA_SUPERUSER_PASSWORD')
	if (superuserEmail && superuserPassword) {
		const collection = app.findCollectionByNameOrId('_superusers')
		const record = new Record(collection)
		record.set('email', 'admin@palacms.internal')
		record.set('password', 'test1234')
		app.save(record)
		superuserCreated = true
	}

	let userCreated = false
	const userEmail = $os.getenv('PALA_USER_EMAIL')
	const userPassword = $os.getenv('PALA_USER_PASSWORD')
	if (userEmail && userPassword) {
		const collection = app.findCollectionByNameOrId('users')
		const record = new Record(collection)
		record.set('email', 'user@palacms.internal')
		record.set('password', 'test1234')
		app.save(record)
		userCreated = true
	}

	if (!superuserCreated || !userCreated) {
		throw new Error('No initial user(s) created')
	}
})
