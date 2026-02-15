/**
 * Transform server relative/relationship data into @kintales/tree-view format.
 *
 * Server relative: { id, fullName, birthYear, deathYear, avatarUrl, ... }
 * Tree-view Person: { id, name, birthYear?, deathYear?, photo? }
 *
 * Server relationship: { personAId, personBId, relationshipType, marriageYear, divorceYear }
 * Tree-view Relationship: { from, to, type, marriageYear?, divorceYear? }
 */

/**
 * Map server relatives to tree-view Person objects.
 * @param {Array} relatives - Server relative objects
 * @returns {Array} Tree-view Person objects
 */
export function mapRelativesToPeople(relatives) {
  return relatives.map((rel) => ({
    id: rel.id,
    name: rel.fullName,
    birthYear: rel.birthYear ?? undefined,
    deathYear: rel.deathYear ?? undefined,
    photo: rel.avatarUrl ?? undefined,
  }));
}

/**
 * Map server relationships to tree-view Relationship objects.
 *
 * Direction conventions:
 *   "parent"  — personA is parent of personB → from=A, to=B (tree-view: parent→child) ✓
 *   "child"   — personA is child of personB  → REVERSED: from=B, to=A, type="parent"
 *   "spouse"  — symmetric, direction irrelevant
 *   "sibling" — symmetric, direction irrelevant
 *   Others (step_parent, step_child, step_sibling, adopted, guardian) — pass through as-is
 *
 * The add-relative form (Phase 2.1) creates relationships where the new relative
 * is personA and the selected existing relative is personB.
 *
 * @param {Array} serverRelationships - Server relationship objects
 * @returns {Array} Tree-view Relationship objects
 */
export function mapRelationshipsToTreeFormat(serverRelationships) {
  return serverRelationships.map((rel) => {
    if (rel.relationshipType === 'child') {
      return {
        from: rel.personBId,
        to: rel.personAId,
        type: 'parent',
        marriageYear: rel.marriageYear ?? undefined,
        divorceYear: rel.divorceYear ?? undefined,
      };
    }

    return {
      from: rel.personAId,
      to: rel.personBId,
      type: rel.relationshipType,
      marriageYear: rel.marriageYear ?? undefined,
      divorceYear: rel.divorceYear ?? undefined,
    };
  });
}
