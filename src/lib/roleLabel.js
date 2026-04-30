// Map the internal role enum to the user-facing label.
// We keep "admin" / "advisor" in the database (the schema, RLS policies,
// and audit-log metadata all reference these strings) but show friendlier
// names in UI surfaces.
export function roleLabel(role) {
  if (role === "admin") return "Firm owner";
  if (role === "advisor") return "Advisor";
  return role || "";
}
