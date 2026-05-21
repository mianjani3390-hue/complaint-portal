import { useEffect, useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { saveLocalAvatar, useAuth } from '../../contexts/AuthContext';
import {
  card,
  btnPrimary,
  btnSecondary,
  input,
  label,
  alertError,
  alertSuccess,
} from '../../lib/ui';

const AVATAR_BUCKET = 'profile-pictures';
const MAX_AVATAR_SIZE_MB = 3;

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read the selected image.'));
    reader.readAsDataURL(file);
  });
}

function shouldFallbackToInlineAvatar(error) {
  const message = error?.message?.toLowerCase() || '';
  const statusCode = String(error?.statusCode || error?.status || '');

  return (
    statusCode === '400' ||
    statusCode === '403' ||
    message.includes('bucket') ||
    message.includes('row-level security') ||
    message.includes('policy') ||
    message.includes('permission') ||
    message.includes('not found')
  );
}

function isInlineAvatar(value) {
  return value?.startsWith('data:image/');
}

function isMissingAvatarColumn(error) {
  return (
    error?.code === 'PGRST204' ||
    error?.message?.toLowerCase().includes('avatar_url') ||
    error?.message?.toLowerCase().includes('schema cache')
  );
}

export default function Settings() {
  const { profile, refreshProfile, session } = useAuth();
  const avatarInputRef = useRef(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [avatarPreviewFailed, setAvatarPreviewFailed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const profileAvatar = profile?.avatar_url || '';
    setAvatarPreview(profileAvatar);
    setAvatarPreviewFailed(false);
  }, [profile?.avatar_url]);

  const handleAvatarFileChange = (e) => {
    const file = e.target.files?.[0];
    setError('');
    setMessage('');

    if (!file) {
      setAvatarFile(null);
      setAvatarPreview(profile?.avatar_url || '');
      setAvatarPreviewFailed(false);
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      e.target.value = '';
      return;
    }

    if (file.size > MAX_AVATAR_SIZE_MB * 1024 * 1024) {
      setError(`Profile picture must be ${MAX_AVATAR_SIZE_MB}MB or smaller.`);
      e.target.value = '';
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarPreviewFailed(false);
  };

  const handleAvatarSave = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setSavingAvatar(true);

    try {
      const userId = profile?.id || session?.user?.id;
      if (!userId) throw new Error('Please sign in again before updating your profile picture.');
      if (!avatarFile) throw new Error('Please choose a profile picture first.');

      let nextAvatarUrl = profile?.avatar_url || '';
      let savedInline = false;

      const safeName = avatarFile.name.replace(/[^a-z0-9.-]/gi, '-').toLowerCase();
      const filePath = `${userId}/${Date.now()}-${safeName}`;
      const { error: uploadError } = await supabase.storage
        .from(AVATAR_BUCKET)
        .upload(filePath, avatarFile, {
          cacheControl: '3600',
          contentType: avatarFile.type,
          upsert: false,
        });

      if (uploadError) {
        if (!shouldFallbackToInlineAvatar(uploadError)) throw uploadError;

        nextAvatarUrl = await fileToDataUrl(avatarFile);
        savedInline = true;
      } else {
        const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(filePath);
        nextAvatarUrl = data.publicUrl;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: nextAvatarUrl || null })
        .eq('id', userId);

      if (updateError) {
        if (!isMissingAvatarColumn(updateError)) throw updateError;

        saveLocalAvatar(userId, nextAvatarUrl);
      } else if (isInlineAvatar(nextAvatarUrl)) {
        saveLocalAvatar(userId, nextAvatarUrl);
      } else {
        saveLocalAvatar(userId, '');
      }

      setAvatarFile(null);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
      setAvatarPreview(nextAvatarUrl);
      setAvatarPreviewFailed(false);
      setMessage(
        savedInline
          ? 'Profile picture updated successfully.'
          : 'Profile picture uploaded successfully.'
      );
      await refreshProfile();
    } catch (err) {
      setError(err.message || 'Could not update profile picture.');
    } finally {
      setSavingAvatar(false);
    }
  };

  const handleAvatarRemove = async () => {
    setMessage('');
    setError('');
    setSavingAvatar(true);

    try {
      const userId = profile?.id || session?.user?.id;
      if (!userId) throw new Error('Please sign in again before removing your profile picture.');

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', userId);

      if (updateError && !isMissingAvatarColumn(updateError)) throw updateError;

      const { error: metadataError } = await supabase.auth.updateUser({
        data: { avatar_url: null },
      });
      if (metadataError) console.error('Could not clear auth avatar metadata:', metadataError);

      saveLocalAvatar(userId, '');
      setAvatarFile(null);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
      setAvatarPreview('');
      setAvatarPreviewFailed(false);
      setMessage('Profile picture removed successfully.');
      await refreshProfile();
    } catch (err) {
      setError(err.message || 'Could not remove profile picture.');
    } finally {
      setSavingAvatar(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: profile.email,
      password: currentPassword,
    });

    if (signInError) {
      setError('Current password is incorrect.');
      setSubmitting(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    if (updateError) setError(updateError.message);
    else {
      setMessage('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      await refreshProfile();
    }
    setSubmitting(false);
  };

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div className={`${card} p-8`}>
        <h2 className="text-lg font-semibold text-blue-900">Account</h2>
        <p className="mt-2 text-sm text-slate-500">
          Signed in as <strong>{profile?.email}</strong> ({profile?.role?.replace('_', ' ')})
        </p>

        <form onSubmit={handleAvatarSave} className="mt-6 flex flex-col gap-5">
          {error && (
            <p className={alertError} role="alert">
              {error}
            </p>
          )}
          {message && (
            <p className={alertSuccess} role="status">
              {message}
            </p>
          )}

          <div className="flex items-center gap-4">
            {avatarPreview && !avatarPreviewFailed ? (
              <img
                src={avatarPreview}
                alt="Profile"
                className="h-20 w-20 rounded-full border border-blue-100 bg-white object-cover"
                onError={() => setAvatarPreviewFailed(true)}
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-2xl font-semibold text-blue-800">
                {(profile?.full_name || profile?.email || 'A')[0].toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-medium text-slate-800">{profile?.full_name || 'Admin'}</p>
              <p className="text-sm text-slate-500">Update your profile picture</p>
            </div>
          </div>

          <div>
            <label htmlFor="avatarFile" className={label}>
              Upload from device
            </label>
            <input
              id="avatarFile"
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="w-full rounded-full border border-blue-200 bg-white px-4 py-3 text-sm outline-none transition-colors file:mr-4 file:rounded-full file:border-0 file:bg-blue-100 file:px-4 file:py-2 file:font-semibold file:text-blue-700 hover:file:bg-blue-200 focus:border-blue-500"
              onChange={handleAvatarFileChange}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={savingAvatar} className={btnPrimary}>
              {savingAvatar ? 'Saving...' : 'Save profile picture'}
            </button>
            <button
              type="button"
              disabled={savingAvatar}
              className={btnSecondary}
              onClick={handleAvatarRemove}
            >
              {savingAvatar ? 'Removing...' : 'Remove picture'}
            </button>
          </div>
        </form>
      </div>

      <div className={`${card} p-8`}>
        <h2 className="text-lg font-semibold text-blue-900">Change password</h2>
        <form onSubmit={handlePasswordChange} className="mt-6 flex flex-col gap-5">
          <div>
            <label htmlFor="currentPassword" className={label}>
              Current password
            </label>
            <input
              id="currentPassword"
              type="password"
              required
              className={input}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="newPassword" className={label}>
              New password
            </label>
            <input
              id="newPassword"
              type="password"
              required
              minLength={6}
              className={input}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className={label}>
              Confirm new password
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              className={input}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <button type="submit" disabled={submitting} className={btnPrimary}>
            {submitting ? 'Updating...' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  );
}
