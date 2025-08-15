/// <reference path="../pb_data/types.d.ts" />

/**
 * @param {core.RecordEvent} e
 */
const sendInvitation = (e) => {
	const { meta } = e.app.settings()
	const token = e.record.newPasswordResetToken()
	
	// Look up the site assignment to get the site name
	const userId = e.record.id
	const assignments = $app.findRecordsByFilter('site_role_assignments', `user = {:userId}`, 'created desc', 1, 0, { userId })
	let siteName = meta.appName
	if (assignments.length > 0) {
		const site = $app.findRecordById('sites', assignments[0].get('site'))
		siteName = site.get('name')
	}
	
	const message = new MailerMessage({
		from: {
			address: meta.senderAddress,
			name: meta.senderName
		},
		to: [{ address: e.record.email() }],
		subject: `You've been invited to collaborate on ${siteName}`,
		html: `<p>You've been invited to collaborate on ${siteName}. Click the link below to create your password.</p>\n<p>\n  <a href="${meta.appURL}/admin/auth?create=${token}" target="_blank" rel="noopener">Create password</a>\n</p>`
	})

	e.app.newMailClient().send(message)
	e.record.set('invite', 'sent')
	e.app.save(e.record)
}

module.exports = { sendInvitation }
