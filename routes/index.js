import { Router } from 'express';
const router = Router();
import { join } from 'path';

/* GET React App */
router.get(['/app', '/app/*'], (req, res, next) => {
  res.sendFile(join(__dirname, '../public', 'index.html'));
});

export default router;
