class BaseTunService {
    constructor(connector, chainId, userService) {
        this.connector = connector;
        this.chainId = chainId;
        this.userService = userService;
    }

    async checkChainAccess(userToken) {
        return await this.connector.checkChainAccess(userToken, this.chainId);
    }

    async getChain() {
        const res = await this.connector.serverGetChain(this.chainId);
        if (!res.error) {
            let issuePromises = [];
            for (const iid in res.chain) {
                if (res.chain.hasOwnProperty(iid)) {
                    const issueChain = res.chain[iid];
                    issuePromises.push(this.interpretChain(issueChain, this.interpretBlock));
                }
            }
            var issues = await Promise.all(issuePromises);
            return issues.filter(n => n);
        }
        else {
            console.log('BaseTunService.getChain error:', res.reason);
            return [];
        }
    }

    async getChainItem(itemId) {
        const res = await this.connector.serverGetIssueChain(this.chainId, itemId);
        if (!res.error) {
            const issue = await this.interpretChain(res.chain, this.interpretBlock);
            return issue;
        }
        else {
            console.log('BaseTunService.getChainItem error:', res.reason);
            return null;
        }
    }

    async go(itemId, next, data, userToken) {
        const newBlock = await this.connector.go(userToken, this.chainId, itemId, next, data);
        const issue = await this.interpretBlock(newBlock);
        return issue;
    }

    async interpretChain(orderedChain) {
        var issue = {
            history: []
        };
        for (let i = 0; i < orderedChain.length; i++) {
            const block = orderedChain[i];
            const blockInt = await this.interpretBlock(block);
            if (i < orderedChain.length - 1) {
                issue.history.push(blockInt);
            }
            else {
                issue = Object.assign(issue, blockInt)
            }
        }
        return issue;
    }

    async interpretBlock(block, activityNameToStatusMap) {
        var blockInt = {};
        blockInt.id = block.header.iid;
        blockInt.status = activityNameToStatusMap[block.header.actName];
        blockInt.user = block.header.user;
        const userData = await this.userService.get(blockInt.user.userid).catch(err => {
            console.log('BaseTunService.interpretBlock: user fetch error;', err);
        })
        blockInt.user.username = userData.fullName;
        blockInt.date = block.header.timestamp;
        return blockInt;
    }

    startSubscription(evtCallbackFn) {
        this.evtCallbackFn = evtCallbackFn;
        return this.connector.serverSubscribeChain(this.chainId, this.onChainEvent.bind(this));
    }

    async onChainEvent(block) {
        if (block.header.icid === this.chainId) { // because we are subscribing to multiple chain via one connector
            const interpretedBlock = await this.interpretBlock(block);
            if (this.evtCallbackFn) return this.evtCallbackFn(this.chainId, interpretedBlock);
        }
    }
}

module.exports = BaseTunService;