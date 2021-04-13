const express = require('express')

class JamiRestApi {
    constructor(jami) {
        this.jami = jami
    }

    getRouter() {
        const router = express.Router({mergeParams: true})
        router.use(express.json());

        // Accounts
        router.get(['/accounts'], (req, res, next) => {
            console.log("Get account list")
            res.json(this.jami.getAccountList().map(account => account.getSummary()))
        })

        const accountRouter = express.Router({mergeParams: true})
        router.use('/accounts/:accountId', accountRouter)

        accountRouter.get(['/'], (req, res, next) => {
            console.log(`Get account ${req.params.accountId}`)
            const account = this.jami.getAccount(req.params.accountId)
            if (account)
                res.json(account.getObject())
            else
                res.sendStatus(404)
        })

        // Contacts
        accountRouter.get(['/contacts'], (req, res, next) => {
            console.log(`Get account ${req.params.accountId}`)
            const account = this.jami.getAccount(req.params.accountId)
            if (account)
                res.json(account.getContacts())
            else
                res.sendStatus(404)
        })

        // Conversations
        accountRouter.get('/conversations', (req, res, next) => {
            console.log(`Get conversations for account ${req.params.accountId}`)
            const account = this.jami.getAccount(req.params.accountId)
            if (!account)
                res.sendStatus(404)
            const conversations = account.getConversations()
            res.json(Object.keys(conversations).map(conversationId => conversations[conversationId].getObject({
                memberFilter: member => member.contact.getUri() !== account.getUri()
            })))
            //res.json(account.getConversations())
        })

        accountRouter.post('/conversations', (req, res, next) => {
            console.log(`Create conversations for account, contact ${req.params.accountId}`)
            console.log(req.body)
            const account = this.jami.getAccount(req.params.accountId)
            if (!account)
                res.sendStatus(404)
            if (req.body.members.length === 1) {
                const details = this.jami.addContact(req.params.accountId, req.body.members[0])
                res.json(details)
            } else
                res.sendStatus(400)
        })

        accountRouter.get('/conversations/:conversationId', (req, res, next) => {
            console.log(`Get conversation ${req.params.conversationId} for account ${req.params.accountId}`)
            const account = this.jami.getAccount(req.params.accountId)
            if (!account)
                res.sendStatus(404)
            const conversation = account.getConversation(req.params.conversationId)
            if (!conversation)
                res.sendStatus(404)
            else {
                res.json(conversation.getObject({
                    memberFilter: member => member.contact.getUri() !== account.getUri()
                }))
            }
        })

        // Nameserver
        const nsRouter = express.Router({mergeParams: true})
        accountRouter.use('/ns', nsRouter)

        nsRouter.get(['/name/:nameQuery'], (req, res, next) => {
            console.log(`Name lookup ${req.params.nameQuery}`)
            this.jami.lookupName(req.params.accountId, req.params.nameQuery)
                .then(result => {
                    if (result.state == 0)
                        res.json(result)
                    else if (result.state == 1)
                        res.sendStatus(400)
                    else
                        res.sendStatus(404)
                }).catch(e => {
                    res.sendStatus(404)
                })
        })
        nsRouter.get(['/addr/:addrQuery'], (req, res, next) => {
            console.log(`Address lookup ${req.params.addrQuery}`)
            this.jami.lookupAddress(req.params.accountId, req.params.addrQuery)
                .then(result => {
                    if (result.state == 0)
                        res.json(result)
                    else if (result.state == 1)
                        res.sendStatus(400)
                    else
                        res.sendStatus(404)
                }).catch(e => {
                    res.sendStatus(404)
                })
        })

        return router
    }
}

module.exports = JamiRestApi
