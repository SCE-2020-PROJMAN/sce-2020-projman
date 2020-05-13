function getText(address) {
    let str = `${address.street} ${address.house}`;
    if (address.apartment) {
        str += `/${address.apartment}`;
    }
    str += `, ${address.city}`;
    return str;
}

export default {
    getText,
};
