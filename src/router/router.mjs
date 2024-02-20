import express from 'express'

import Controler from '../controler/controler.mjs'
const router = express.Router()

const initApiRouter = (app) => {
    router.get('/', Controler.getHomePage)
    router.get('/postData', Controler.postData)
    // router.post('/getCoin', Controler.getCoin)
    router.get('/done', (req, res) => { res.send('done') })
    return app.use('/', router)
}

export default initApiRouter