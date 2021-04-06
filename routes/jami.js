const express = require('express');

class JamiRestApi {
    constructor(jami) {
        this.jami = jami
    }

    getRouter() {
        const router = express.Router({mergeParams: true});

        // Accounts
        router.get(['/accounts'], (req, res, next) => {
            console.log("Request account list")
            res.json(this.jami.getAccountList().map(account => account.getSummary()))
        });

        router.get(['/accounts/:accountId'], (req, res, next) => {
            console.log(`Request account ${req.params.accountId}`)
            const account = this.jami.getAccount(req.params.accountId);
            if (account)
                res.json(account.getObject())
            else
                res.sendStatus(404)
        });

        // Conversations
        const conversationRouter = express.Router({mergeParams: true});
        conversationRouter.get('/', (req, res, next) => {
            console.log(`Request conversations for account ${req.params.accountId}`);
            res.json([]);
        })

        conversationRouter.get('/:conversationId', (req, res, next) => {
            console.log(`Request conversation ${req.params.conversationId} for account ${req.params.accountId}`);
            res.json({});
        })

        router.use('/accounts/:accountId/conversations', conversationRouter);
        return router;
    }
}

module.exports = JamiRestApi;
