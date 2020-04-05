describe('fake ci test', () => {
    it('must fail', () => {
        throw new Error('Make CI fail on purpose');
    });
});
