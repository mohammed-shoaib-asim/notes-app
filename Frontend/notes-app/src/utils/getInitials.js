export const getInitials = (name) => {
    if (!name) return "";
    const words = name.trim().split(/\s+/);  // trims and splits on one or more spaces
    let initials = "";
    for (let i = 0; i < Math.min(words.length, 2); i++) {
        initials += words[i][0];
    }
    return initials.toUpperCase();
};
