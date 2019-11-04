describe('Sample Test', () => {

    const auth = {
        auth: {
            username: 'admin',
            password: 'admin'
        }
    };

    it('opens Venia homepage', () => {
        cy.visit('/content/venia.html', { ...auth });

        cy.contains('This page redirects to');
        cy.get('a').should('have.attr', 'href', '/content/venia/us/en.html');
    });
});