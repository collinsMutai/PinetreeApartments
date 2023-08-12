exports.get500 = (req, res, next) => {
    res.status(500).render('500', {
        path: '/500',
        pageTitle: 'Server Error',
        isAuthenticated: req.session.isLoggedIn
    })
}