import { useState, useEffect, useCallback } from 'react';
import {
  createIssue,
  updateIssueStatus,
  addAdminRemark,
  softDeleteIssue,
  fetchUserIssues,
  fetchIssuesList,
  fetchCategories,
  fetchSystemStatsStream
} from '../services';

/**
 * Reusable issues hook.
 * 
 * @param {string|null} userId If provided, streams issues for this specific user.
 * @param {boolean} adminMode If true, streams all active issues in the system.
 * @param {boolean} statsMode If true, streams global system statistics.
 */
export const useIssues = (userId = null, adminMode = false, statsMode = false) => {
  const [issues, setIssues] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch categories on mount
  useEffect(() => {
    let active = true;
    const loadCategories = async () => {
      try {
        const cats = await fetchCategories();
        if (active) {
          setCategories(cats);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    loadCategories();
    return () => {
      active = false;
    };
  }, []);

  // Listen to user issues, admin list, or statistics
  useEffect(() => {
    setLoading(true);
    let unsubscribe = () => {};

    try {
      if (userId && !adminMode) {
        unsubscribe = fetchUserIssues(userId, (data) => {
          setIssues(data);
          setLoading(false);
        });
      } else if (adminMode) {
        unsubscribe = fetchIssuesList((data) => {
          setIssues(data);
          setLoading(false);
        });
      }

      if (statsMode) {
        unsubscribe = fetchSystemStatsStream((data) => {
          setStats(data);
          setLoading(false);
        });
      }

      // If neither is selected, resolve loading
      if (!userId && !adminMode && !statsMode) {
        setLoading(false);
      }
    } catch (err) {
      setError(err.message || 'Failed to stream database records.');
      setLoading(false);
    }

    return () => unsubscribe();
  }, [userId, adminMode, statsMode]);

  // Action: Create ticket
  const createNewIssue = useCallback(async (formData, file, user, onProgress) => {
    setLoading(true);
    setError(null);
    try {
      const ticketId = await createIssue(formData, file, user, onProgress);
      setLoading(false);
      return { success: true, ticketId };
    } catch (err) {
      setError(err.message || 'Failed to report issue.');
      setLoading(false);
      return { success: false, error: err.message };
    }
  }, []);

  // Action: Update status
  const updateStatus = useCallback(async (issueId, oldStatus, newStatus, actorId, note) => {
    setError(null);
    try {
      await updateIssueStatus(issueId, oldStatus, newStatus, actorId, note);
      return { success: true };
    } catch (err) {
      setError(err.message || 'Failed to update status.');
      return { success: false, error: err.message };
    }
  }, []);

  // Action: Add Admin Remark
  const addRemark = useCallback(async (issueId, remarkText, adminId, adminName) => {
    setError(null);
    try {
      await addAdminRemark(issueId, remarkText, adminId, adminName);
      return { success: true };
    } catch (err) {
      setError(err.message || 'Failed to submit remark.');
      return { success: false, error: err.message };
    }
  }, []);

  // Action: Soft delete issue
  const deleteIssue = useCallback(async (issueId) => {
    setError(null);
    try {
      await softDeleteIssue(issueId);
      return { success: true };
    } catch (err) {
      setError(err.message || 'Failed to delete issue.');
      return { success: false, error: err.message };
    }
  }, []);

  return {
    issues,
    categories,
    stats,
    loading,
    error,
    createNewIssue,
    updateStatus,
    addRemark,
    deleteIssue,
  };
};

export default useIssues;
