import { Router } from 'express'
const router = Router()
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/* GET React App */
router.get(['/app', '/app/*'], (req, res, next) => {
    res.sendFile(join(__dirname, '../public', 'index.html'))
})

export default router
