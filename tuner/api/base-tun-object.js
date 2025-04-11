const moment = require('moment');
const clone  = require('clone');

var BaseTun = {};

BaseTun.schemaDef = {
    $schema: 'http://json-schema.org/draft-04/schema#',
    type: 'object',
    properties: {
        history: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    status: { type: 'string' },
                    user: { 
                        type: 'object', 
                        properties: { 
                            userid: 'string',
                            username: 'string'
                        } 
                    },
                    date: { type: 'number' }
                }
            }
        },
        id: { type: 'string' },
        status: { type: 'string' },
        user: {
            type: 'object',
            properties: {
                userid: 'string',
                username: 'string'
            }
        },
        date: { type: 'number' }
    }
}

BaseTun.createSchema = function(extraProperties) {
    let schema = clone(BaseTun.schemaDef);
    Object.assign(schema.properties, clone(extraProperties));
    Object.assign(schema.properties.history.items.properties, clone(extraProperties));
    return schema;
}

module.exports = BaseTun;