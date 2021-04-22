import { Router } from 'express'

class JamiRestApi {
    constructor(jami) {
        this.jami = jami
    }

    getRouter() {
        const router = Router({mergeParams: true})
        //router.use(express.json());

        // Accounts
        router.get(['/accounts'], (req, res, next) => {
            console.log("Get account list")
            let accounts = this.jami.getAccountList()
            if (req.user.accountFilter)
                accounts = accounts.filter(account => req.user.accountFilter(account.getId()))
            res.json(accounts.map(account => account.getSummary()))
        })

        const checkAccount = (req, res, next) => {
            console.log(`checkAccount ${req.params.accountId} for ${req.user.id}`)
            if (req.user && (!req.user.accountFilter || req.user.accountFilter(req.params.accountId))) {
                return next();
            }
            res.status(403).end()
        }

        const accountRouter = Router({mergeParams: true})
        router.use('/accounts/:accountId', checkAccount, accountRouter)

        accountRouter.get(['/'], (req, res, next) => {
            console.log(`Get account ${req.params.accountId}`)
            const account = this.jami.getAccount(req.params.accountId)
            account.defaultModerators = this.jami.getDefaultModerators(account.getId())
            if (account)
                res.json(account.getObject())
            else
                res.status(404).end()
        })

        // Contacts
        accountRouter.get(['/contacts'], (req, res, next) => {
            console.log(`Get account ${req.params.accountId}`)
            const account = this.jami.getAccount(req.params.accountId)
            if (account)
                res.json(account.getContacts())
            else
                res.status(404).end()
        })

        // Conversations
        accountRouter.get('/conversations', async (req, res, next) => {
            console.log(`Get conversations for account ${req.params.accountId}`)
            const account = this.jami.getAccount(req.params.accountId)
            if (!account)
                return res.sendStatus(404)
            const conversations = account.getConversations()
            res.json(await Promise.all(Object.keys(conversations).map(async conversationId => await conversations[conversationId].getObject({
                memberFilter: member => member.contact.getUri() !== account.getUri()
            }))))
            //res.json(account.getConversations())
        })

        accountRouter.post('/conversations', (req, res) => {
            console.log(`Create conversations for account, contact ${req.params.accountId}`)
            console.log(req.body)
            const account = this.jami.getAccount(req.params.accountId)
            if (!account)
                return res.sendStatus(404)
            if (req.body.members.length === 1) {
                const details = this.jami.addContact(req.params.accountId, req.body.members[0])
                res.json(details)
            } else
                res.status(400).end()
        })

        accountRouter.post('/conversations/:conversationId', async (req, res) => {
            console.log(`Sending message to ${req.params.conversationId} for account ${req.params.accountId}`)
            this.jami.sendMessage(req.params.accountId, req.params.conversationId, req.body.message)
            res.status(200).end()
        })

        accountRouter.get('/conversations/:conversationId', async (req, res) => {
            console.log(`Get conversation ${req.params.conversationId} for account ${req.params.accountId}`)
            const account = this.jami.getAccount(req.params.accountId)
            if (!account)
                return res.sendStatus(404)
            const conversation = account.getConversation(req.params.conversationId)
            if (!conversation)
                res.status(404).end()
            else {
                res.json(await conversation.getObject({
                    memberFilter: member => member.contact.getUri() !== account.getUri()
                }))
            }
        })

        // Nameserver
        const nsRouter = Router({mergeParams: true})
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

export default JamiRestApi
