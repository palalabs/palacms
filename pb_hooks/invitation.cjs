/// <reference path="../pb_data/types.d.ts" />

/**
 * @param {core.RecordEvent} e
 */
const sendInvitation = (e) => {
	const { meta } = e.app.settings()
	const token = e.record.newPasswordResetToken()
	const message = new MailerMessage({
		from: {
			address: meta.senderAddress,
			name: meta.senderName
		},
		to: [{ address: e.record.email() }],
		subject: `Set your ${meta.appName} password`,
		html: `<p>Hello,</p>\n<p>You have been invited to ${meta.appName}! Click on the button below to set your password.</p>\n<p>\n  <a class="btn" href="${meta.appURL}/admin/auth?reset=${token}" target="_blank" rel="noopener">Set password</a>\n</p>\n<p>\n  Thanks,<br/>\n  ${meta.appName} team\n</p>`
	})

	e.app.newMailClient().send(message)
	e.record.set('invite', 'sent')
	e.app.save(e.record)
}

module.exports = { sendInvitation }
