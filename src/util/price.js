function getPrice(isStudent, normalPrice, studentDiscount) {
    if (isStudent && studentDiscount && studentDiscount !== 0 && studentDiscount !== '0' && studentDiscount !== '0.0' && studentDiscount !== '0.00') {
        return studentDiscount;
    }
    return normalPrice;
}

export default {
    getPrice,
};
