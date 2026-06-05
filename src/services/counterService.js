import { doc, getDoc, setDoc, runTransaction } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const COUNTER_COLLECTION = 'counters';
const ISSUE_COUNTER_DOC = 'issueCounter';

/**
 * Initializes the issue counter document if it doesn't exist.
 * Sets the starting value to 1000 so first ticket is ISS-1001.
 */
export const initializeIssueCounter = async () => {
  const counterRef = doc(db, COUNTER_COLLECTION, ISSUE_COUNTER_DOC);
  const counterSnap = await getDoc(counterRef);

  if (!counterSnap.exists()) {
    await setDoc(counterRef, {
      currentValue: 1000,
      prefix: 'ISS',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
};

/**
 * Generates the next unique ticket ID using a Firestore transaction.
 * Ensures atomicity even with concurrent requests.
 * @returns {Promise<string>} The next ticket ID (e.g., "ISS-1001")
 */
export const generateTicketId = async () => {
  const counterRef = doc(db, COUNTER_COLLECTION, ISSUE_COUNTER_DOC);

  const newTicketId = await runTransaction(db, async (transaction) => {
    const counterDoc = await transaction.get(counterRef);

    if (!counterDoc.exists()) {
      // Auto-initialize if missing
      transaction.set(counterRef, {
        currentValue: 1001,
        prefix: 'ISS',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return 'ISS-1001';
    }

    const data = counterDoc.data();
    const nextValue = data.currentValue + 1;

    transaction.update(counterRef, {
      currentValue: nextValue,
      updatedAt: new Date(),
    });

    return `${data.prefix}-${nextValue}`;
  });

  return newTicketId;
};
