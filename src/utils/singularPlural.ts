export const toPlural = (str: string) => {
    if (str.endsWith('y')) {
        return str.slice(0, -1) + 'ies';
    } else if (str.endsWith('f')) {
        return str.slice(0, -1) + 'ves';
    } else {
        return str + 's';
    }
};

export const toSingular = (str: string) => {
    if (str.endsWith('ies')) {
        return str.slice(0, -3) + 'y';
    } else if (str.endsWith('ves')) {
        return str.slice(0, -3) + 'f';
    } else {
        return str.slice(0, -1);
    }
};
