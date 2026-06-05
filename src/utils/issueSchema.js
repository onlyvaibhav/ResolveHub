/**
 * Issue Document Schema Reference
 * 
 * This file defines the canonical schema for issue documents in Firestore.
 * Used as a reference for creating and validating issue documents.
 * 
 * Collection: issues
 */

/**
 * Creates a new issue document object.
 * @param {Object} params
 * @returns {Object} Issue document ready for Firestore
 */
export const createIssueDocument = ({
  ticketId,
  title,
  description,
  category,
  imageUrl,
  userId,
  userName,
  userEmail,
}) => {
  const now = new Date();

  return {
    // Core fields
    ticketId,
    title,
    description,
    category,
    imageUrl,
    status: 'Pending',

    // User reference
    userId,
    userName,
    userEmail,

    // Searchable lowercase fields for query optimization
    titleLower: title.toLowerCase(),
    emailLower: userEmail.toLowerCase(),

    // Status history tracking
    statusHistory: [
      {
        status: 'Pending',
        changedAt: now,
        changedBy: userId,
        note: 'Issue created',
      },
    ],

    // Admin remarks
    remarks: [],

    // Timestamps
    createdAt: now,
    updatedAt: now,
  };
};

/**
 * Creates a status history entry.
 * @param {Object} params
 * @returns {Object} Status history entry
 */
export const createStatusHistoryEntry = ({ status, changedBy, note = '' }) => ({
  status,
  changedAt: new Date(),
  changedBy,
  note,
});

/**
 * Creates a remark entry.
 * @param {Object} params
 * @returns {Object} Remark entry
 */
export const createRemarkEntry = ({ text, addedBy, addedByName }) => ({
  text,
  addedBy,
  addedByName,
  addedAt: new Date(),
});

/**
 * Issue status constants
 */
export const ISSUE_STATUSES = [
  'Pending',
  'Under Review',
  'In Progress',
  'Resolved',
  'Closed',
];

/**
 * Issue categories
 */
export const ISSUE_CATEGORIES = [
  'Bug',
  'Feature Request',
  'Improvement',
  'Support',
  'Other',
];

/**
 * Image upload constraints
 */
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
