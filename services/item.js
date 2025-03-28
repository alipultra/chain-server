var jsData = require('js-data');

const baseTun = require('../tuner/api/base-tun-object');
const itemDef = require('./itemdef');

var Item = {}

Item.icid = "warehouse-activity-chain";
Item.activityNames = {
    create  : 'warehouse.item.create',
    store   : 'warehouse.item.store',
    qc      : 'warehouse.item.qc',
    relegate: 'warehouse.item.relegate',
    repair  : 'warehouse.item.repair',
    shrink  : 'warehouse.item.shrink'
};
Item.activityNameToStatusMapping = {
    'warehouse.item.create'  : 'Created',
    'warehouse.item.store'   : 'In Store',
    'warehouse.item.qc'      : 'QC',
    'warehouse.item.relegate': 'Relegated',
    'warehouse.item.repair'  : 'In Repair',
    'warehouse.item.shrink'  : 'Shrunk'
}

Item.extraProperties = {
    definitionId : { type: 'string'},
    serial       : { type: 'string'},
    owner        : { type: 'string'},
    location     : { type: 'string'},
    currentHolder: { type: 'string'},
    reference    : { type: 'string'},
    remarks      : { type: 'string'},
    definition   : { 
        type: 'object',
        properties: itemDef.extraProperties
    }
};
Item.dataStoreSchemaDef = baseTun.createSchema(Item.extraProperties);

Item.dataStoreDef = {
    name: Item.icid,
    table: 'items',
    schema: new jsData.Schema(Item.dataStoreSchemaDef),
    relations: {
        belongsTo: {}
    }
}
Item.dataStoreDef.relations.belongsTo[itemDef.icid] = {
    foreignKey: 'definitionId',
    localField: 'definition'
}

module.exports = Item;