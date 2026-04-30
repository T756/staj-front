export function getDisplayName(user) {
  if (!user) return '';

  const profile = user.profile || {};
  const firstName = profile.first_name || user.first_name || '';
  const lastName = profile.last_name || user.last_name || '';
  const fullName = `${firstName} ${lastName}`.trim();

  return fullName || user.email || '';
}

export function isEmployer(user) {
  if (!user) return false;
  if (typeof user.is_employer === 'boolean') return user.is_employer;
  return user.role === 'EMPLOYER';
}

export function isJobSeeker(user) {
  if (!user) return false;
  if (typeof user.is_employer === 'boolean') return !user.is_employer;
  return user.role === 'JOB_SEEKER';
}
