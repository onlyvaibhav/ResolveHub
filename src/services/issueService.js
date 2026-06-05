import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  arrayUnion,
  limit
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { isCloudinaryConfigured, uploadImage } from './cloudinaryService';
import { compressImage } from '../utils/imageUtils';

const ISSUES_COLLECTION = 'issues';
const PUBLIC_ISSUES_COLLECTION = 'publicIssues';
const COUNTER_COLLECTION = 'counters';
const ISSUE_COUNTER_DOC = 'issueCounter';
const STATS_COLLECTION = 'stats';
const SYSTEM_STATS_DOC = 'systemStats';
const CATEGORIES_COLLECTION = 'categories';

/**
 * Initializes default system stats, issue counter, and default categories if they do not exist.
 * This should be called by an administrator to avoid permission warnings.
 */
export const initializeSystem = async () => {
  try {
    // 1. Initialize stats document
    const statsRef = doc(db, STATS_COLLECTION, SYSTEM_STATS_DOC);
    try {
      const statsSnap = await getDoc(statsRef);
      if (!statsSnap.exists()) {
        await setDoc(statsRef, {
          totalIssues: 0,
          pending: 0,
          underReview: 0,
          inProgress: 0,
          resolved: 0,
          closed: 0,
        });
        console.log('[ResolveHub] System stats initialized.');
      }
    } catch (err) {
      console.warn('[ResolveHub] Skip stats init due to permissions/connectivity.');
    }

    // 2. Initialize ticket counter
    const counterRef = doc(db, COUNTER_COLLECTION, ISSUE_COUNTER_DOC);
    try {
      const counterSnap = await getDoc(counterRef);
      if (!counterSnap.exists()) {
        await setDoc(counterRef, {
          current: 1000,
          createdAt: new Date(),
        });
        console.log('[ResolveHub] Issue counter initialized.');
      }
    } catch (err) {
      console.warn('[ResolveHub] Skip counter init due to permissions/connectivity.');
    }

    // 3. Initialize categories
    try {
      const categoriesSnap = await getDocs(query(collection(db, CATEGORIES_COLLECTION), limit(1)));
      if (categoriesSnap.empty) {
        const defaultCategories = ['Bug', 'Feature Request', 'Improvement', 'Support', 'Other'];
        for (const cat of defaultCategories) {
          await setDoc(doc(db, CATEGORIES_COLLECTION, cat), {
            name: cat,
            active: true,
            createdAt: new Date(),
          });
        }
        console.log('[ResolveHub] Default categories seeded.');
      }
    } catch (err) {
      console.warn('[ResolveHub] Skip categories seeding due to permissions/connectivity.');
    }
  } catch (error) {
    console.error('[ResolveHub] Error during system initialization:', error);
  }
};

/**
 * Creates a new issue.
 * Operates in a transaction to safely read/write counter and system stats,
 * and synchonously creates the publicIssues lookup record.
 */
export const createIssue = async (data, imageFile, user, onProgress) => {
  let imageUrl = null;
  let imageType = 'none';
  let imageData = null;

  // Process image if provided
  if (imageFile) {
    if (isCloudinaryConfigured()) {
      try {
        imageUrl = await uploadImage(imageFile, onProgress);
        imageType = 'cloudinary';
      } catch (error) {
        console.warn('[ResolveHub] Cloudinary upload failed, using Base64 compression:', error);
        imageData = await compressImage(imageFile);
        imageType = 'base64';
      }
    } else {
      imageData = await compressImage(imageFile);
      imageType = 'base64';
    }
  }

  const counterRef = doc(db, COUNTER_COLLECTION, ISSUE_COUNTER_DOC);
  const statsRef = doc(db, STATS_COLLECTION, SYSTEM_STATS_DOC);
  const issuesColRef = collection(db, ISSUES_COLLECTION);

  const result = await runTransaction(db, async (transaction) => {
    // 1. Read ticket counter (default to 1000 if not yet seeded)
    const counterDoc = await transaction.get(counterRef);
    let currentVal = 1000;
    if (counterDoc.exists()) {
      currentVal = counterDoc.data().current;
    }
    const nextVal = currentVal + 1;
    const ticketId = `ISS-${nextVal}`;

    // 2. Read statistics (default to all zeroes if not yet seeded)
    const statsDoc = await transaction.get(statsRef);
    let stats = { totalIssues: 0, pending: 0, underReview: 0, inProgress: 0, resolved: 0, closed: 0 };
    if (statsDoc.exists()) {
      stats = statsDoc.data();
    }

    const issueRef = doc(issuesColRef);
    const publicRef = doc(db, PUBLIC_ISSUES_COLLECTION, ticketId);

    const now = new Date();

    const issuePayload = {
      ticketId,
      title: data.title,
      titleLower: data.title.toLowerCase(),
      description: data.description,
      category: data.category,
      priority: data.priority || 'Medium',
      imageUrl,
      imageType,
      ...(imageData ? { imageData } : {}),
      status: 'Pending',
      userId: user.uid,
      userName: user.name,
      userEmail: user.email,
      emailLower: user.email.toLowerCase(),
      createdAt: now,
      updatedAt: now,
      isDeleted: false,
      deletedAt: null,
      remarks: [],
      statusHistory: [
        {
          status: 'Pending',
          note: 'Issue reported',
          updatedAt: now,
          updatedBy: user.uid,
        }
      ]
    };

    const publicPayload = {
      ticketId,
      title: data.title,
      status: 'Pending',
      priority: data.priority || 'Medium',
      createdAt: now,
      updatedAt: now,
    };

    // Write operations using set with merge true to handle cases where counter/stats docs don't exist
    transaction.set(issueRef, issuePayload);
    transaction.set(publicRef, publicPayload);
    transaction.set(counterRef, { current: nextVal }, { merge: true });
    transaction.set(statsRef, {
      totalIssues: (stats.totalIssues || 0) + 1,
      pending: (stats.pending || 0) + 1,
    }, { merge: true });

    return ticketId;
  });

  return result;
};

/**
 * Updates the status of an issue, logs to status history, and syncs public tracking + statistics.
 */
export const updateIssueStatus = async (issueDocId, oldStatus, newStatus, userId, note = '') => {
  const issueRef = doc(db, ISSUES_COLLECTION, issueDocId);
  const statsRef = doc(db, STATS_COLLECTION, SYSTEM_STATS_DOC);

  await runTransaction(db, async (transaction) => {
    const issueDoc = await transaction.get(issueRef);
    if (!issueDoc.exists()) {
      throw new Error('Issue not found.');
    }
    const issueData = issueDoc.data();
    const ticketId = issueData.ticketId;

    const statsDoc = await transaction.get(statsRef);
    let stats = { totalIssues: 0, pending: 0, underReview: 0, inProgress: 0, resolved: 0, closed: 0 };
    if (statsDoc.exists()) {
      stats = statsDoc.data();
    }

    const now = new Date();
    const historyLog = {
      status: newStatus,
      note: note || `Status changed from ${oldStatus} to ${newStatus}`,
      updatedAt: now,
      updatedBy: userId,
    };

    transaction.update(issueRef, {
      status: newStatus,
      updatedAt: now,
      statusHistory: arrayUnion(historyLog),
    });

    const publicRef = doc(db, PUBLIC_ISSUES_COLLECTION, ticketId);
    transaction.set(publicRef, {
      status: newStatus,
      updatedAt: now,
    }, { merge: true });

    const statusFieldMap = {
      'Pending': 'pending',
      'Under Review': 'underReview',
      'In Progress': 'inProgress',
      'Resolved': 'resolved',
      'Closed': 'closed',
    };

    const oldField = statusFieldMap[oldStatus];
    const newField = statusFieldMap[newStatus];

    const statsUpdate = {};
    if (oldField) {
      statsUpdate[oldField] = Math.max(0, (stats[oldField] || 0) - 1);
    }
    if (newField) {
      statsUpdate[newField] = (stats[newField] || 0) + 1;
    }

    if (Object.keys(statsUpdate).length > 0) {
      transaction.set(statsRef, statsUpdate, { merge: true });
    }
  });
};

/**
 * Appends an official remark from an administrator to an issue.
 */
export const addAdminRemark = async (issueDocId, text, adminId, adminName) => {
  const issueRef = doc(db, ISSUES_COLLECTION, issueDocId);
  const now = new Date();

  await updateDoc(issueRef, {
    updatedAt: now,
    remarks: arrayUnion({
      text,
      createdBy: adminName || adminId,
      createdAt: now,
    }),
  });
};

/**
 * Soft deletes an issue.
 */
export const softDeleteIssue = async (issueDocId) => {
  const issueRef = doc(db, ISSUES_COLLECTION, issueDocId);
  const statsRef = doc(db, STATS_COLLECTION, SYSTEM_STATS_DOC);

  await runTransaction(db, async (transaction) => {
    const issueDoc = await transaction.get(issueRef);
    if (!issueDoc.exists()) {
      throw new Error('Issue not found.');
    }
    const issueData = issueDoc.data();
    
    if (issueData.isDeleted) return;

    const ticketId = issueData.ticketId;
    const currentStatus = issueData.status;

    const statsDoc = await transaction.get(statsRef);
    let stats = { totalIssues: 0, pending: 0, underReview: 0, inProgress: 0, resolved: 0, closed: 0 };
    if (statsDoc.exists()) {
      stats = statsDoc.data();
    }

    const now = new Date();
    transaction.update(issueRef, {
      isDeleted: true,
      deletedAt: now,
      updatedAt: now,
    });

    const publicRef = doc(db, PUBLIC_ISSUES_COLLECTION, ticketId);
    transaction.delete(publicRef);

    const statusFieldMap = {
      'Pending': 'pending',
      'Under Review': 'underReview',
      'In Progress': 'inProgress',
      'Resolved': 'resolved',
      'Closed': 'closed',
    };

    const statusField = statusFieldMap[currentStatus];
    const statsUpdate = {
      totalIssues: Math.max(0, (stats.totalIssues || 0) - 1),
    };

    if (statusField) {
      statsUpdate[statusField] = Math.max(0, (stats[statusField] || 0) - 1);
    }

    transaction.set(statsRef, statsUpdate, { merge: true });
  });
};

/**
 * Fetches user issues from Firestore.
 * Performs client-side filtering and sorting to avoid index requirements.
 */
export const fetchUserIssues = (userId, callback) => {
  const q = query(
    collection(db, ISSUES_COLLECTION),
    where('userId', '==', userId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const issues = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((issue) => !issue.isDeleted)
        .sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
          return dateB - dateA;
        });
      callback(issues);
    },
    (error) => {
      console.error('[ResolveHub] Error listening to user issues:', error);
    }
  );
};

/**
 * Fetches all active system issues from Firestore.
 */
export const fetchIssuesList = (callback) => {
  const q = query(
    collection(db, ISSUES_COLLECTION),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const issues = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((issue) => !issue.isDeleted);
      callback(issues);
    },
    (error) => {
      console.error('[ResolveHub] Error listening to issues log:', error);
    }
  );
};

/**
 * Fetches a single issue by its document ID.
 */
export const fetchIssueByIdStream = (id, callback) => {
  return onSnapshot(
    doc(db, ISSUES_COLLECTION, id),
    (docSnap) => {
      if (docSnap.exists()) {
        callback({ id: docSnap.id, ...docSnap.data() });
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error(`[ResolveHub] Error listening to issue ${id}:`, error);
    }
  );
};

/**
 * Searches and retrieves a single public tracking issue by ticketId.
 */
export const fetchPublicIssueByTicketId = async (ticketId) => {
  const publicRef = doc(db, PUBLIC_ISSUES_COLLECTION, ticketId.toUpperCase());
  const docSnap = await getDoc(publicRef);
  if (docSnap.exists()) {
    return docSnap.data();
  }
  return null;
};

/**
 * Retrieves the categories list from categories collection.
 * Falls back to default list if query fails or collection is empty.
 */
export const fetchCategories = async () => {
  const defaultCategories = ['Bug', 'Feature Request', 'Improvement', 'Support', 'Other'];
  try {
    const q = query(collection(db, CATEGORIES_COLLECTION), where('active', '==', true));
    const snap = await getDocs(q);
    if (snap.empty) {
      return defaultCategories;
    }
    return snap.docs.map(doc => doc.id);
  } catch (error) {
    console.warn('[ResolveHub] Error fetching categories from Firestore, using defaults.', error);
    return defaultCategories;
  }
};

/**
 * Streams real-time system stats totals from stats/systemStats.
 */
export const fetchSystemStatsStream = (callback) => {
  return onSnapshot(
    doc(db, STATS_COLLECTION, SYSTEM_STATS_DOC),
    (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data());
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error('[ResolveHub] Error listening to stats:', error);
    }
  );
};
