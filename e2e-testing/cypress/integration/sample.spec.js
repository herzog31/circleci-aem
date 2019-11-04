describe('Sample Test', () => {

    const auth = {
        auth: {
            username: 'admin',
            password: 'admin'
        }
    };

    it('open Venia homepage', () => {
        cy.visit('http://localhost:4502/content/venia.html', { ...auth });

        cy.contains('This page redirects to');
        cy.get('a').should('contain', 'English');
    });
});