
const ensureAuthenticated = require('../Middlewares/Auth');
const router = require('express').Router();


router.get('/', (req, res) => {
    console.log('Products route accessed', req.user );
    res.status(200).json([
        {
            name: "Sample Product",
            price: 100,
            description: "This is a sample product"
        },
        {
            name: "Sample Product 2",
            price: 200,
            description: "This is another sample product"
        }
    ]);
});

module.exports = router;