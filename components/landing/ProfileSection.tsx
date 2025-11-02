'use client';

interface ProfileSectionProps {
  name?: string;
  role?: string;
  avatar?: string;
}

export default function ProfileSection({ name, role, avatar }: ProfileSectionProps) {
  return (
    <div className="flex items-center gap-3 p-4 bg-white rounded-lg shadow">
      {avatar && (
        <img
          src={avatar}
          alt={name || 'User'}
          className="w-12 h-12 rounded-full"
        />
      )}
      <div>
        {name && <div className="font-semibold">{name}</div>}
        {role && <div className="text-sm text-gray-600">{role}</div>}
      </div>
    </div>
  );
}
