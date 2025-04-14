class BaseService {
    constructor(tunService, dataStore, chainEvtCallbackFn) {
        this.tunService = tunService;
        this.dataStore = dataStore;
        this.chainEvtCallbackFn = chainEvtCallbackFn;
        this.storeCommands = {
            update: 'update',
            create: 'create',
            destroy: 'destroy'
        }
        this.recentGoResult = {};
    }
    async init() {
        const issues = await this.tunService.getChain();
        const filtered = await this.initIssueModifier(issues);
        var promises = [];
        for (let i = 0; i < filtered.length; i++) {
            const issue = filtered[i];
            promises.push(this.dataStore.store.create(this.tunService.chainId, issue));
        }
        await Promise.all(promises);
        this.tunService.startSubscription(this.onChainEvent.bind(this));
    }
    async initIssueModifier(issues) {
        return issues;
    }
    async findAll(token, query, opts) {
        var safeOpts = opts;
        if (!safeOpts) safeOpts = {};
        if (await this.tunService.checkChainAccess(token)) {
            let issues = await this.dataStore.store.findAll(this.tunService.chainId, query, safeOpts);
            return issues.filter(n => n.id);
        }
        else {
            return { error: true, reason: 'invalid token' }
        }
    }
    async find(token, id, opts) {
        var safeOpts = opts;
        if (!safeOpts) safeOpts = {};
        if (await this.tunService.checkChainAccess(token)) {
            let issue = await this.dataStore.store.find(this.tunService.chainId, id, safeOpts);
            return issue;
        }
        else {
            return { error: true, reason: 'invalid token' }
        }
    }
    async onChainEvent(chainId, interpretedBlock) {
        console.log('BaseService.onChainEvent:', chainId, interpretedBlock);
        const self = this;
        const updateId = this.getIssueUpdateId(interpretedBlock);
        // delay in order to give this.go time to process
        // we do not update db based on changes that are caused by this.go
        // only the ones caused by other direct tun clients
        // we do however pass the event to our clients
        setTimeout(async () => {
            let issue = null;
            if (self.recentGoResult[updateId]) {
                delete self.recentGoResult[updateId];
            }
            else {
                await this.processUpdatedIssue(interpretedBlock);
            }
            this.chainEvtCallbackFn(chainId, interpretedBlock);
        }, 300);
    }
}

module.exports = BaseService;