const hooks = ['beforeValidate', 'afterValidate']

const syncMethods = [
    'addScope',
    'belongsTo',
    'belongsToMany',
    'build',
    'getTableName',
    'hasMany',
    'hasOne',
    'init',
    'removeAttribute',
    'schema',
    'scope',
    'unscoped',
]

const asyncMethods = [
    'aggregate',
    'bulkCreate',
    'count',
    'create',
    'decrement',
    'describe',
    'destroy',
    'drop',
    'findAll',
    'findAndCountAll',
    'findByPk',
    'findCreateFind',
    'findOne',
    'findOrBuild',
    'findOrCreate',
    'increment',
    'max',
    'min',
    'restore',
    'sum',
    'sync',
    'truncate',
    'update',
    'upsert',
]

export const mockSequelize = {
    define: (modelName, modelSchema, metaData = {}) => {
        const model = function () {}
        model.modelName = modelName

        const attachHook = (name) => (hook) => {
            if (!model.prototype.hooks) model.prototype.hooks = metaData.hooks || {}
            model.prototype.hooks[name] = hook
        }

        const attachProp = (key) => {
            model.prototype[key] = modelSchema[key]
        }

        const addStatic = (key) => {
            model[key] = function () {}
        }

        hooks.forEach((hook) => {
            model[hook] = attachHook(hook)
        })

        model.addHook = (hookType, name, hook) => {
            return typeof name === 'function' ? attachHook(hookType)(name) : attachHook(hookType)(hook)
        }


        model.hook = model.addHook

        syncMethods.forEach(addStatic)
        asyncMethods.forEach(addStatic)

        model.isHierarchy = function () {}

        model.prototype.update = function () {}
        model.prototype.reload = function () {}
        model.prototype.set = function () {}
        Object.keys(modelSchema).forEach(attachProp)

        model.prototype.indexes = metaData.indexes
        model.prototype.scopes = metaData.scopes
        model.prototype.validate = metaData.validate

        return model
    },
    sync: function () {},
}
