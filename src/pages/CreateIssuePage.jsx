import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useIssues } from '../hooks';
import DashboardLayout from '../components/DashboardLayout';
import Loader from '../components/Loader';
import { validateImage } from '../utils/imageUtils';
import {
  HiOutlinePlusCircle,
  HiOutlinePhoto,
  HiOutlineXMark,
  HiOutlineChevronDown
} from 'react-icons/hi2';

const CreateIssuePage = () => {
  const { userData } = useAuth();
  const { createNewIssue, categories, loading: hookLoading } = useIssues();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // States
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'Medium', // Default Priority
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Priority definitions
  const priorities = ['Low', 'Medium', 'High', 'Critical'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate image format and size
    const validationError = validateImage(file);
    if (validationError) {
      setErrors((prev) => ({ ...prev, image: validationError }));
      return;
    }

    setErrors((prev) => ({ ...prev, image: '' }));
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setErrors((prev) => ({ ...prev, image: '' }));
  };

  const validateForm = () => {
    const tempErrors = {};
    if (!formData.title.trim()) tempErrors.title = 'Title is required';
    if (!formData.description.trim()) tempErrors.description = 'Description is required';
    if (!formData.category) tempErrors.category = 'Category is required';
    if (!formData.priority) tempErrors.priority = 'Priority is required';
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setSubmitError('');
    setUploadProgress(0);

    try {
      const result = await createNewIssue(
        formData,
        imageFile,
        userData,
        (progress) => {
          setUploadProgress(progress);
        }
      );

      if (result.success) {
        navigate('/dashboard');
      } else {
        setSubmitError(result.error || 'Failed to submit issue. Please try again.');
      }
    } catch (err) {
      setSubmitError('An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto mb-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white flex items-center gap-2">
            <HiOutlinePlusCircle className="w-7 h-7 text-primary-600 dark:text-primary-400" />
            Report an Issue
          </h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">
            Submit a new ticket with title, details, priority, and optional photo evidence.
          </p>
        </div>

        {/* Form Container */}
        <div className="card p-6 sm:p-8">
          {submitError && (
            <div className="mb-6 p-4 rounded-xl border border-danger-200 dark:border-danger-500/20 bg-danger-50 dark:bg-danger-500/10 text-danger-700 dark:text-danger-400 text-sm">
              {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="label">
                Issue Title <span className="text-danger-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={errors.title ? 'input-error' : 'input'}
                placeholder="Brief summary of the problem"
              />
              {errors.title && (
                <p className="mt-1.5 text-xs text-danger-600 dark:text-danger-400">{errors.title}</p>
              )}
            </div>

            {/* Grid for Category and Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category */}
              <div>
                <label htmlFor="category" className="label">
                  Category <span className="text-danger-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`${errors.category ? 'input-error' : 'input'} appearance-none pr-10`}
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <HiOutlineChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
                </div>
                {errors.category && (
                  <p className="mt-1.5 text-xs text-danger-600 dark:text-danger-400">{errors.category}</p>
                )}
              </div>

              {/* Priority */}
              <div>
                <label htmlFor="priority" className="label">
                  Priority <span className="text-danger-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="input appearance-none pr-10"
                  >
                    {priorities.map((prio) => (
                      <option key={prio} value={prio}>
                        {prio}
                      </option>
                    ))}
                  </select>
                  <HiOutlineChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="label">
                Detailed Description <span className="text-danger-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                rows="6"
                value={formData.description}
                onChange={handleInputChange}
                className={errors.description ? 'input-error' : 'input'}
                placeholder="Describe the issue in detail, including steps to reproduce or location of the problem"
              ></textarea>
              {errors.description && (
                <p className="mt-1.5 text-xs text-danger-600 dark:text-danger-400">{errors.description}</p>
              )}
            </div>

            {/* Image Upload */}
            <div>
              <label className="label">Photo Evidence (Optional)</label>
              
              {!imagePreview ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
                    errors.image
                      ? 'border-danger-300 bg-danger-50/20 dark:border-danger-900/30'
                      : 'border-surface-300 dark:border-surface-700 hover:border-primary-500 dark:hover:border-primary-500 hover:bg-surface-50 dark:hover:bg-surface-800/20'
                  }`}
                >
                  <HiOutlinePhoto className="w-10 h-10 mx-auto text-surface-400 dark:text-surface-500 mb-2" />
                  <p className="text-sm font-semibold text-surface-700 dark:text-surface-300">
                    Click to upload an image
                  </p>
                  <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">
                    PNG, JPG, JPEG, WEBP up to 5MB
                  </p>
                </div>
              ) : (
                <div className="relative rounded-2xl border border-surface-200 dark:border-surface-700 overflow-hidden bg-surface-100 dark:bg-surface-800/50 max-w-md">
                  <img src={imagePreview} alt="Evidence preview" className="w-full h-auto object-cover max-h-64" />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors"
                    aria-label="Remove image"
                  >
                    <HiOutlineXMark className="w-5 h-5" />
                  </button>
                </div>
              )}

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept=".jpg,.jpeg,.png,.webp"
                className="hidden"
              />
              {errors.image && (
                <p className="mt-1.5 text-xs text-danger-600 dark:text-danger-400">{errors.image}</p>
              )}
            </div>

            {/* Submission Progress / Loading */}
            {submitting && imageFile && uploadProgress > 0 && uploadProgress < 100 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-surface-500 dark:text-surface-400">
                  <span>Uploading image evidence...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-surface-100 dark:bg-surface-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Submit Actions */}
            <div className="flex gap-3 pt-4 border-t border-surface-100 dark:border-surface-800">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                disabled={submitting}
                className="btn-ghost flex-1 py-3"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary flex-1 py-3"
              >
                {submitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader size="sm" />
                    <span>Submitting...</span>
                  </div>
                ) : (
                  'Submit Issue'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateIssuePage;
