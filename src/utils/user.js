export function getDisplayName(user) {
  if (!user) return '';

  const profile = user.profile || {};
  const firstName = profile.first_name || user.first_name || '';
  const lastName = profile.last_name || user.last_name || '';
  const fullName = `${firstName} ${lastName}`.trim();

  return fullName || user.email || '';
}
