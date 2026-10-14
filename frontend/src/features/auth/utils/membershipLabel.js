const tiers = ['FREE', 'MIDDLE', 'ENHANCE'];

export function getHighestMembershipLabel(profile) {
    const level = Math.max(0, ...[profile?.membershipType, profile?.interviewMembershipType]
        .map(value => tiers.indexOf(String(value || '').trim().toUpperCase())));
    const tier = tiers[level];
    return tier.charAt(0) + tier.slice(1).toLowerCase();
}
