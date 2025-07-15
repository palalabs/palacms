/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4273630883") // site_fields

  // add parent field
  collection.fields.addAt(7, new Field({
    "cascadeDelete": true,
    "collectionId": "pbc_4273630883",
    "hidden": false,
    "id": "relation_parent_field",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "parent",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // add index field
  collection.fields.addAt(8, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "number_index_field",
    "max": null,
    "min": 0,
    "name": "index",
    "onlyInt": true,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4273630883")

  // remove parent field
  collection.fields.removeById("relation_parent_field")

  // remove index field
  collection.fields.removeById("number_index_field")

  return app.save(collection)
})