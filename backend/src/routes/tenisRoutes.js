const express = require('express');
const router = express.Router();
const tenisController = require('../controllers/tenisController');

router.get('/', tenisController.getAllTenis);
router.get('/:id', tenisController.getTenisById);
router.post('/', tenisController.createTenis);
router.put('/:id', tenisController.updateTenis);
router.delete('/:id', tenisController.deleteTenis);

module.exports = router;
