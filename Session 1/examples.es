/* CREATING an index */
PUT test_index

/* CREATING a document in the index with field name */
/* Using PUT */
PUT /test_index/_doc/1
{
    "name": "Oreo"
}

/* Using POST */
POST /test_index/_doc/
{
    "name": "Bourbon"
}

/* READING documents */
/* By Id */
GET test_index/_doc/1

/* All documents using _search */
GET test_index/_search

/* UPDATING Documents */
POST test_index/_doc/1/_update
{
    "doc": {
        "stock": 5
    }
}

/* Using scripts */
POST test_index/_doc/1/_update
{
    "script": "ctx._source.stock+=10"
}

/* Using painless scripts */
POST test_index/_doc/1/_update
{
    "script": {
        "lang": "painless",
        "source": "ctx._source.stock-=params.val",
        "params": {
            "val": 5
        }
    }
}

/* Check if update field exists */
POST test_index/_doc/1/_update
{
  "script": {
    "lang": "painless",
    "source": """
              if (ctx._source.stock != null) {
                ctx._source.stock += params.val;
              }
    """,
    "params": {
      "val": 5
    }
  }
}

/* Adding new field without script */
POST test_index/_doc/5
{
    "tags": [
        "technology"
    ]
}

/* Adding an object into a field, here an array */
POST test_index/_doc/5/_update
{
  "script": {
    "lang": "painless",
    "source": "ctx._source.tags.addAll(params.tag)",
    "params": {
      "tag": ["abc"]
    }
  }
}

GET test_index/_doc/5

/* DELETING a document */
POST test_index/_doc/5/_update
{
  "script": {
    "lang": "painless",
    "course": """
              if (ctx._source.tags.contains(params.tag)) {
                ctx.op = 'delete'
              }
    """,
    "params": {
        "tag": "technology"
    }
  }
}
