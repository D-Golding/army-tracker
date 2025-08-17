const {onCall} = require('firebase-functions/v2/https');
const {setGlobalOptions} = require('firebase-functions/v2');
const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp();

// Set global options
setGlobalOptions({
  maxInstances: 10,
  region: 'us-central1'
});

// Delete user account immediately
exports.deleteUserAccountImmediate = onCall(async (request) => {
  const {uid} = request.data;

  // Verify the user is authenticated and requesting their own deletion
  if (!request.auth || request.auth.uid !== uid) {
    throw new Error('Unauthorized: You can only delete your own account');
  }

  try {
    console.log(`Starting immediate deletion for user: ${uid}`);

    // Delete Firestore data
    await deleteUserFirestoreData(uid);

    // Delete Storage files
    await deleteUserStorageFiles(uid);

    // Delete Firebase Auth user (this must be last)
    await admin.auth().deleteUser(uid);

    console.log(`Successfully deleted user: ${uid}`);
    return {success: true, message: 'Account deleted successfully'};

  } catch (error) {
    console.error(`Error deleting user ${uid}:`, error);
    throw new Error(`Failed to delete account: ${error.message}`);
  }
});

// Schedule user deletion
exports.scheduleUserDeletion = onCall(async (request) => {
  const {uid, scheduledDate} = request.data;

  // Verify the user is authenticated and requesting their own deletion
  if (!request.auth || request.auth.uid !== uid) {
    throw new Error('Unauthorized: You can only schedule deletion of your own account');
  }

  try {
    console.log(`Scheduling deletion for user: ${uid} on ${scheduledDate}`);

    // Update user document with deletion schedule
    await admin.firestore().doc(`users/${uid}`).update({
      scheduledForDeletion: true,
      deletionDate: admin.firestore.Timestamp.fromDate(new Date(scheduledDate)),
      deletionScheduledAt: admin.firestore.FieldValue.serverTimestamp(),
      accountStatus: 'scheduled_for_deletion'
    });

    console.log(`Successfully scheduled deletion for user: ${uid}`);
    return {success: true, message: 'Deletion scheduled successfully'};

  } catch (error) {
    console.error(`Error scheduling deletion for user ${uid}:`, error);
    throw new Error(`Failed to schedule deletion: ${error.message}`);
  }
});

// Helper function to delete all Firestore data for a user
async function deleteUserFirestoreData(uid) {
  const db = admin.firestore();

  try {
    // Delete subcollections first
    const subcollections = ['paints', 'projects'];

    for (const subcollection of subcollections) {
      const subcollectionRef = db.collection('users').doc(uid).collection(subcollection);
      const snapshot = await subcollectionRef.get();

      // Delete all documents in this subcollection
      const batch = db.batch();
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      if (snapshot.docs.length > 0) {
        await batch.commit();
        console.log(`Deleted ${snapshot.docs.length} documents from ${subcollection}`);
      }
    }

    // Delete main user document last
    await db.doc(`users/${uid}`).delete();
    console.log(`Deleted main user document for ${uid}`);

  } catch (error) {
    console.error(`Error deleting Firestore data for ${uid}:`, error);
    throw error;
  }
}

// Helper function to delete all Storage files for a user
async function deleteUserStorageFiles(uid) {
  const bucket = admin.storage().bucket();

  try {
    // Delete files from project-photos that belong to this user
    const [projectFiles] = await bucket.getFiles({
      prefix: `project-photos/${uid}/`
    });

    for (const file of projectFiles) {
      await file.delete();
      console.log(`Deleted file: ${file.name}`);
    }

    // Delete files from user-banners that belong to this user
    const [bannerFiles] = await bucket.getFiles({
      prefix: `user-banners/${uid}/`
    });

    for (const file of bannerFiles) {
      await file.delete();
      console.log(`Deleted file: ${file.name}`);
    }

    console.log(`Deleted all storage files for user ${uid}`);

  } catch (error) {
    console.error(`Error deleting storage files for ${uid}:`, error);
    // Don't throw here - storage deletion failures shouldn't stop account deletion
  }
}