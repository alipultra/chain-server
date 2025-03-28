var BaseTunService = require('../tuner/api/base-tun.service');
var BaseService = require('../tuner/api/base.service');
const itemdef = require('./itemdef');

class ItemDefTunService extends BaseTunService {
    constructor(connector, userService) {
        super(connector, itemdef.icid, userService);
    }

    async interpretBlock(block) {
        var blockInt = await super.interpretBlock(block, itemdef.activityNameToStatusMapping);
        if (block.class) blockInt.class = block.class;
        if (block.pid) blockInt.pid = block.pid;
        if (block.make) blockInt.make = block.make;
        if (block.model) blockInt.model = block.model;
        if (block.spec) blockInt.spec = block.spec;
        if (block.peripherals) blockInt.peripherals = block.peripherals;
        return blockInt;
    }
}

class ItemDefService extends BaseService {
    constructor(tunConnector, dataStore, userService, chainEvtCallbackFn) {
        var tunService = new ItemDefTunService(tunConnector, userService);
        super(tunService, dataStore, chainEvtCallbackFn);
    }
    async initIssueModifier(issues) {
        var anu = issues.filter(n => n.status.toLowerCase() !== 'deleted');
        return anu;
    }
    async getUpdatedIssueDataStoreCommand(issue) {
        if (issue.status.toLowerCase() === 'created') {
            return this.storeCommands.create;
        }
        else if (issue.status.toLowerCase() === 'deleted') {
            return this.storeCommands.destroy;
        }
        else {
            return this.storeCommands.update;
        }
    }
}

module.exports = ItemDefService;