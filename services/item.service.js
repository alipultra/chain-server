var BaseTunService = require('../tuner/api/base-tun.service');
var BaseService = require('../tuner/api/base.service');
const item = require('./item');

class ItemTunService extends BaseTunService {
    constructor(connector, userService) {
        super(connector, item.icid, userService);
    }

    async interpretBlock(block) {
        var blockInt = await super.interpretBlock(block, item.activityNameToStatusMapping);
        if (block.definitionId) blockInt.definitionId = block.definitionId;
        if (block.serial) blockInt.serial = block.serial;
        if (block.owner) blockInt.owner = block.owner;
        if (block.location) blockInt.location = block.location;
        if (block.currentHolder) blockInt.currentHolder = block.currentHolder;
        if (block.reference) blockInt.reference = block.reference;
        if (block.remarks) blockInt.remarks = block.remarks;
        return blockInt;
    }
}

class ItemService extends BaseService {
    constructor(tunConnector, dataStore, userService, chainEvtCallbackFn) {
        var tunService = new ItemTunService(tunConnector, userService);
        super(tunService, dataStore, chainEvtCallbackFn);
    }
}

module.exports = ItemService;