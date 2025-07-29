/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_638150767")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.id != \"\"",
    "deleteRule": "@request.auth.id != \"\"",
    "listRule": "@request.auth.id != \"\"",
    "updateRule": "@request.auth.id != \"\"",
    "viewRule": "@request.auth.id != \"\""
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_638150767")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.id = field.page_type.site.group.owner.id",
    "deleteRule": "@request.auth.id = field.page_type.site.group.owner.id",
    "listRule": "@request.auth.id = field.page_type.site.group.owner.id",
    "updateRule": "@request.auth.id = field.page_type.site.group.owner.id",
    "viewRule": "@request.auth.id = field.page_type.site.group.owner.id"
  }, collection)

  return app.save(collection)
})
