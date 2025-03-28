var jsData = require('js-data');

const baseTun = require('../tuner/api/base-tun-object');

var ItemDef = {}

ItemDef.icid = "itemdef-activity-class-id";
ItemDef.activityNames = {
    create: 'itemdef.create',
    update: 'itemdef.update',
    delete: 'itemdef.delete'
};
ItemDef.activityNameToStatusMapping = {
    'itemdef.create': 'Created',
    'itemdef.update': 'Updated',
    'itemdef.delete': 'Deleted'
}

ItemDef.extraProperties = {
    class: { type: 'string' },
    pid: { type: 'string' },
    make: { type: 'string' },
    model: { type: 'string' },
    spec: { type: 'string' },
    peripherals: { type: 'string' }
};
ItemDef.dataStoreSchemaDef = baseTun.createSchema(ItemDef.extraProperties);

ItemDef.dataStoreDef = {
    name: ItemDef.icid,
    table: 'item_defs',
    schema: new jsData.Schema(ItemDef.dataStoreSchemaDef)
}

module.exports = ItemDef;