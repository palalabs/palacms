/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1111325129")

  // add field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "select2699804679",
    "maxSelect": 1,
    "name": "zone",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "header",
      "content",
      "footer"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1111325129")

  // remove field
  collection.fields.removeById("select2699804679")

  return app.save(collection)
})
