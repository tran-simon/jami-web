import { Router } from 'express'

class JamiRestApi {
    constructor(jami) {
        this.jami = jami
    }

    getRouter() {
        const router = Router({mergeParams: true})
        //router.use(express.json());

        // Accounts
        router.get('/accounts', async (req, res) => {
            console.log("Get account list")
            let accounts = this.jami.getAccountList()
            if (req.user.accountFilter)
                accounts = accounts.filter(account => req.user.accountFilter(account.getId()))
            res.json(await Promise.all(accounts.map(async account => await account.getSummary())))
        })

        const checkCanCreateAccounts = (req, res, next) => {
            console.log(`checkCanCreateAccounts ${req.params.accountId} for ${req.user.id}`)
            if (req.user && !req.user.accountFilter) {
                return next();
            }
            res.status(403).end()
        }

        router.post('/accounts', checkCanCreateAccounts, async (req, res) => {
            console.log("Create new account")
            console.log(req.body)
            try {
                res.json({ accountId: await this.jami.addAccount(req.body) })
            } catch (e) {
                res.status(400).json({ error: e })
            }
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

        accountRouter.get('/', async (req, res) => {
            console.log(`Get account ${req.params.accountId}`)
            const account = this.jami.getAccount(req.params.accountId)
            if (account) {
                account.defaultModerators = this.jami.getDefaultModerators(account.getId())
                const obj = await account.getObject()
                console.log(obj)
                res.json(obj)
            } else
                res.status(404).end()
        })

        accountRouter.post('/', async (req, res) => {
            console.log(`Set account details ${req.params.accountId}`)
            const account = this.jami.getAccount(req.params.accountId)
            if (account) {
                console.log(req.body)
                const newDetails = account.updateDetails(req.body)
                this.jami.setAccountDetails(account.getId(), newDetails)
                res.status(200).end()
            } else
                res.status(404).end()
        })

        // Contacts
        accountRouter.get('/contacts', (req, res) => {
            console.log(`Get account ${req.params.accountId}`)
            const account = this.jami.getAccount(req.params.accountId)
            if (account)
                res.json(account.getContacts())
            else
                res.status(404).end()
        })

        // Default modertors
        accountRouter.put('/defaultModerators/:contactId', async (req, res) => {
            console.log(`Adding default moderator ${req.params.contactId} to account ${req.params.accountId}`)
            this.jami.addDefaultModerator(req.params.accountId, req.params.contactId)
            res.status(200).end()
        })
        accountRouter.delete('/defaultModerators/:contactId', async (req, res) => {
            console.log(`Removing default moderator to account ${req.params.accountId}`)
            this.jami.removeDefaultModerator(req.params.accountId, req.params.contactId)
            res.status(200).end()
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

        accountRouter.get('/conversations/:conversationId/messages', async (req, res) => {
            console.log(`Get messages for conversation ${req.params.conversationId} for account ${req.params.accountId}`)
            try {
                const messages = await this.jami.loadMessages(req.params.accountId, req.params.conversationId)
                res.json(messages).end()
            } catch (e) {
                res.status(400).json({ error: e.message })
            }
        })

        // Nameserver
        const nsRouter = Router({mergeParams: true})
        accountRouter.use('/ns', nsRouter) // use account nameserver
        router.use('/ns', nsRouter) // use default nameserver

        nsRouter.get(['/name/:nameQuery'], (req, res, next) => {
            console.log(`Name lookup ${req.params.nameQuery}`)
            this.jami.lookupName(req.params.accountId || '', req.params.nameQuery)
                .then(result => {
                    if (result.state == 0)
                        res.json(result)
                    else if (result.state == 1)
                        res.status(400).json({})
                    else
                        res.status(404).json({})
                }).catch(e => {
                    res.status(404).json({})
                })
        })
        nsRouter.get(['/addr/:addrQuery'], (req, res, next) => {
            console.log(`Address lookup ${req.params.addrQuery}`)
            this.jami.lookupAddress(req.params.accountId || '', req.params.addrQuery)
                .then(result => {
                    if (result.state == 0)
                        res.json(result)
                    else if (result.state == 1)
                        res.status(400).json({})
                    else
                        res.status(404).json({})
                }).catch(e => {
                    res.status(404).json({})
                })
        })


        return router
    }
}

export default JamiRestApi
