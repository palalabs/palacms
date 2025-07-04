/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_149684058")

  // add field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "number2155046657",
    "max": null,
    "min": 0,
    "name": "index",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_149684058")

  // remove field
  collection.fields.removeById("number2155046657")

  return app.save(collection)
})
