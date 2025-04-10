var jsData = require('js-data');
var rAdapter = require('js-data-rethinkdb');

class DataStore {
    constructor(rethinkOpts, mapperDefs) {
        this.adapter = new rAdapter.RethinkDBAdapter({ rOpts: rethinkOpts });
        this.store = new jsData.Container();
        this.store.registerAdapter('rethink', this.adapter, { 'default': true });
        this.mapperDefs = mapperDefs;
        mapperDefs.forEach(mapperDef => {
            this.store.defineMapper(mapperDef.name, {
                table: mapperDef.table,
                schema: mapperDef.schema,
                relations: mapperDef.relations
            });
        });
    }

    clear() {
        var promises = [];
        this.mapperDefs.forEach(mapperDef => {
            promises.push(this.store.destroyAll(mapperDef.name, {}));
        });
        return Promise.all(promises);
    }

}

module.exports = DataStore;
