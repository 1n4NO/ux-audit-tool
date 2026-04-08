export type UserProfile = {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
  lastSignedInAt: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function isUserProfile(value: unknown): value is UserProfile {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.email === "string" &&
    (value.displayName === null || typeof value.displayName === "string") &&
    (value.avatarUrl === null || typeof value.avatarUrl === "string") &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string" &&
    (value.lastSignedInAt === null || typeof value.lastSignedInAt === "string")
  );
}
