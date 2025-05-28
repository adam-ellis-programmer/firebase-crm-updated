const { onRequest } = require('firebase-functions/v2/https')
const { getFirestore, FieldValue } = require('firebase-admin/firestore')

const db = getFirestore()

// New HTTP function for tracking email opens
const trackEmailOpen = onRequest(async (req, res) => {
  try {
    // Get the email ID from the query parameter
    const emailId = req.query.id

    if (!emailId) {
      console.log('No email ID provided')
    } else {
      // Update the email record in Firestore with atomic increment
      await db
        .collection('sentEmails')
        .doc(emailId)
        .update({
          read: true,
          readAt: new Date(),
          opened: FieldValue.increment(1), // Increment the opened counter
          lastOpenedAt: new Date(),
        })

      console.log(`Email ${emailId} marked as read and opened counter incremented`)
    }

    // Return a transparent 1x1 pixel GIF
    res.set('Content-Type', 'image/gif')
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    res.set('Pragma', 'no-cache')
    res.set('Expires', '0')
    res.send(
      Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64')
    )
  } catch (error) {
    console.error('Error tracking email open:', error)

    // Still return a pixel even if there's an error
    res.set('Content-Type', 'image/gif')
    res.send(
      Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64')
    )
  }
})

module.exports = {
  trackEmailOpen,
}
