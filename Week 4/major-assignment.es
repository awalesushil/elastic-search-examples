/* 
    * Major Assignment - Assignment 4
    * Date: Mar 3, 2019
    * Author: Sushil Awale
*/

/*
Related to recipe.json

1. Look at the sample json data in the picture below.

Create an index with any name that you prefer (example: recipes) along with mapping. 
When creating mapping:
- decide on what are the fields required and their respective types that should be available in the
mapping of the index by looking at the sample json data in the picture above 
(Picture I: Sample JSON Data).
*/

PUT recipes
{
    "mappings": {
        "_doc": {
            "dynamic": false,
            "properties": {
                "title": {
                    "type": "text"
                },
                "description": {
                    "type": "text"
                },
                "preparation_time_minutes": {
                    "type": "integer"
                },
                "servings": {
                    "properties": {
                        "min": {
                            "type": "integer"
                        },
                        "max": {
                            "type": "integer"
                        }
                    }
                },
                "steps": {
                    "type": "text"
                },
                "ingredients": {
                    "type": "nested",
                    "properties": {
                        "name": {
                            "type": "text"
                        },
                        "quantity": {
                            "type": "keyword"
                        }
                    }
                },
                "created": {
                    "type": "date",
                    "format": "yyyy/MM/dd"
                },
                "ratings": {
                    "type": "double"
                }
            }
        }
    }
}

/*
- create custom analyzer (you can provide it any name, example: new_analyzer) that can handle english 
stop-words and synonyms available in a file created inside the config directory of elasticsearch 
(example, synonyms_recipes.txt). In order to add synonyms, you can download the file in this link, 
open it in notepad or any other text editor to see what kind of synonyms can be created and add the 
synonyms that you have thought of in synonyms_recipes.txt file following proper format. The custom 
analyzer should be provided to description and steps fields.
*/

PUT analyzed_index
{
    "settings": {
        "index": {
            "analysis": {
                "analyzer": {
                    "custom_analyzer": {
                        "type": "custom",
                        "tokenizer": "standard",
                        "filter": [
                            "lowercase",
                            "custom_stopwords",
                            "synonyms_recipes"
                        ]
                    }
                },
                "filter": {
                    "custom_stopwords": {
                        "type": "stop",
                        "stopwords": "_english_"
                    },
                    "synonyms_recipes": {
                        "type": "synonym",
                        "synonyms_path": "synonyms_recipes.txt"
                    }
                }
            }
        }
    },
    "mappings": {
        "_doc": {
            "properties": {
                "description": {
                    "type": "text",
                    "analyzer": "custom_analyzer"
                },
                "steps": {
                    "type": "text",
                    "analyzer": "custom_analyzer"
                }
            }
        }
    }
}

/*
2. Bulk insert the data downloaded from this link into the newly created index. The data has different 
recipes as documents.
*/

curl -H "Content-Type: application/json" 
    -XPOST "http://localhost:9200/recipes/_doc/_bulk?pretty" 
    --data-binary @recipe.json

/*
3. For documents having preparation_time_minutes of less than of equal to 15, the difference between min 
and max servings should be at least 1 and at most 3 (i.e. the difference between min and max servings should 
be between 1-3, inclusive). Write update by query using script to make sure that this case prevails.
*/

POST recipes/_update_by_query?conflicts=proceed
{
    "query": {
        "range": {
            "preparation_time_minutes": {
                "lte": 15
            }
        }
    },
    "script": {
        "lang": "painless",
        "source": """
            if ((ctx._source.servings.max - ctx._source.servings.min).contains([1,2,3])) {
                
            }
        """
    }
}

/*
4. Search for all the documents in the index. View the nested field ingredients of the documents. You can 
see that in some documents, some ingredients are missing quantity field. First, find the count of such 
documents. Then, update such documents in which at least one of the ingredients is missing quantity field by 
adding the quantity field with value ‘Per Choice’. 
Hint: ingredients is a nested field (array of JSON objects), so you need to perform nested query along with 
update by query and script to do this question. 
Side Note: First perform nested query to see how many such documents exist. After executing nested query, 
you can see that each document/hit that is returned has at least one JSON object that match the nested query 
condition in the array of JSON objects of the nested field. Only then, try performing update by query. 
Following this approach helps you to verify your work properly.
*/

GET recipes/_search

GET product/_search
{
  "query": {
    "bool": {
      "must_not": {
        "exists": {
          "field": "tags"
        }
      }
    }
  }
}

POST recipes/_update_by_query?conflicts=proceed
{
    "query": {
        "nested": {
            "path": "ingredients"
        }
    }
}

/*
5. Delete unrated documents, that is, documents that have empty array in ratings field.
*/
POST recipes/_delete_by_query
{
    "query": {
        "term": {
            "ratings": "NULL"
        }
    }
}

/* 
6. Find all the recipes that use Egg as one of the ingredients. 
Display only title, ratings, steps, number of steps. 
Note that number of steps is a derived field. The documents should be ordered by average rating.
*/

PUT recipes/_mapping/_doc
{
  "properties": {
    "steps": { 
      "type":     "text",
      "fielddata": true
    }
  }
}

GET recipes/_search
{
    "_source": ["title", "ratings", "steps"],
    "query": {
        "nested": {
            "path": "ingredients",
            "query": {
                "match": {
                    "ingredients.name": "egg"
                }
            }
        }
    },
    "script_fields": {
        "number_of_steps": {
            "script": {
                "lang": "painless",
                "source": "params['_source']['steps'].size()"
            }
        }
    },
    "sort": [
        {
            "ratings": {
                "mode": "avg"
            }
        }
    ] 
}

/*
7. Execute at least 10 different aggregations for performing analysis on the data.
a. You need to prepare at least 3 different metric aggregations
b. You need to prepare at least 5 different bucket aggregations
c. You need to prepare at least 2 different sub aggregations
    i. At least 1 sub aggregation having metric aggregation within bucket aggregation
    ii. At least 1 sub aggregation having bucket aggregation within another bucket aggregation
*/

/* Metric Aggregations 
a. You need to prepare at least 3 different metric aggregations.
*/

GET recipes/_search

GET recipes/_doc/_search
{
    "size":0,
    "aggs":{
        "avg_amount":{
            "avg": {
            "field": "preparation_time_minutes"
            }
        }
    }
}

PUT recipes/_mapping/_doc
{
    "properties": {
        "num_of_ingredients": {
            "type": "integer"
        }
    }
}
POST recipes/_doc/_update_by_query
{
    "query": {
        "match_all": {}
    },
    "script": {
        "source": "ctx._source.num_of_ingredients = ctx._source.ingredients.size()"
    }
}

POST orders/_doc/_update_by_query
{
    "script": {
        "source": "ctx._source.enhance=10"
    },
    "query": {
        "match_all": {}
    }
}

GET recipes/_doc/_search
{
    "size": 0,
    "aggs": {
        "weighted_avg_amount": {
            "weighted_avg": {
                "value": {
                    "field": "preparation_time_minutes"
                },
                "weight": {
                    "field": "enhance"
                }
            }
        }
    }
}

GET recipes/_doc/_search
{
    "size": 0,
    "aggs": {
            "total_ingredients": {
                "max": {
                    "field": "preparation_time_minutes"
                }
        }
    }
}

GET recipes/_doc/_search
{
    "size": 0,
    "aggs": {
            "total_ingredients": {
                "sum": {
                    "field": "preparation_time_minutes"
                }
        }
    }
}

GET recipes/_doc/_search
{
    "size": 0,
    "aggs": {
            "total_ingredients": {
                "min": {
                    "field": "preparation_time_minutes"
                }
        }
    }
}


/* Bucket Aggregations */

GET recipes/_doc/_search
{
    "size": 0,
    "aggs": {
        "num_of_ingredients": {
            "terms": {
                "field": "created",
                "missing": "1970/01/01",
                "min_doc_count": 0
            }
        }
    }
}

GET recipes/_doc/_search
{
    "size": 0,
    "aggs": {
        "created": {
            "terms": {
                "field": "created",
                "size": 5,
                "show_term_doc_count_error": true,
                "order": {
                    "_key": "asc"
                }
            }
        }
    }
}

GET recipes/_doc/_search
{
    "size": 0,
    "aggs": {
        "preparation_time_range": {
            "range": {
                "field": "preparation_time_minutes",
                "ranges": [
                    {
                        "from": 10,
                        "to": 25
                    }
                ]
            }
        }
    }
}

GET recipes/_doc/_search
{
    "size": 0,
    "aggs": {
        "preparation_time_range": {
            "range": {
                "field": "preparation_time_minutes",
                "ranges": [
                    {
                        "key": "quick recipes",
                        "to": 10
                    },
                    {
                        "key": "failry quick recipes",
                        "from": 10,
                        "to": 25
                    },
                    {
                        "key": "very long recipes",
                        "from": 25
                    }
                ]
            }
        }
    }
}

GET recipes/_doc/_search
{
    "size": 0,
    "aggs": {
        "created_range": {
            "date_range": {
                "field": "created",
                "format": "yyyy/mm/dd",
                "ranges": [
                    {
                        "to": "2010/01/01"
                    },
                    {
                        "from": "2010/01/01"
                    }
                ]
            }
        }
    }
}


/* Sub Aggregations */

/* metric aggregation within bucket aggregation */

GET recipes/_doc/_search
{
    "size": 0,
    "aggs": {
        "preparation_time_range": {
            "range": {
                "script": {
                    "source": "doc.preparation_time_minutes.value"
                },
                "keyed": true,
                "ranges": [
                    {
                        "key": "quick recipes",
                        "to": 10
                    },
                    {
                        "key": "fairyl quick recipes",
                        "from": 10,
                        "to": 25
                    },
                    {
                        "key": "very long recipes",
                        "from": 25
                    }
                ]
            },
            "aggs":{
                "statistics": {
                    "stats": {
                        "script": {
                            "source": "doc.preparation_time_minutes.value"
                        }
                    }
                }
            }
        }
    }
}

/* bucket aggregation within another bucket aggregation */

GET recipes/_doc/_search
{
    "size": 0,
    "aggs": {
        "preparation_time_minutes": {
            "terms": {
                "field": "preparation_time_minutes"
            },
            "aggs": {
                "created": {
                    "terms": {
                        "field": "created"
                    }
                }
            }
        }
    }
}

/*
8. Design your own search using compound bool query. The bool query should have at least 2 musts, at least 
2 filters and at least 1 should. Showcase the use of synonyms, proximity (slop) and fuzziness parameters 
where possible in your search query.
*/

GET recipes/_doc/_search
{
    "query": {
        "bool": {
            "must": [
                {
                    "match_phrase": {
                        "title": {
                            "query": "tomato",
                            "slop": 3
                        }
                    }
                },
                {
                    "fuzzy": {
                        "description": {
                            "value": "sause",
                            "fuzziness": 2
                        }
                    }
                }
            ],
            "filter": [
                {
                    "range": {
                        "created": {
                            "gt": "2010/01/01"
                        }
                    }
                },
                {
                    "query_string": {
                        "default_field": "description",
                        "query": "(paste) or (pasta)"
                    }
                }
            ],
            "should": [
                {
                    "range": {
                        "preparation_time_minutes": {
                            "gt": 15
                        }
                    }
                }
            ]
        }
    }
}

/*
9. Practice using cut-off frequency to handle domain specific stop-words in match query and common-terms 
query. You can make use of steps field for this purpose.
*/

GET recipes/_search
{
    "query": {
        "match": {
            "steps": {
                "query": "shaken but not stirred",
                "cutoff_frequency": 11
            }
        }
    }
}

GET recipes/_search
{
    "query": {
        "match": {
            "steps": {
                "query": "shaken but not stirred",
                "cutoff_frequency": 0.001
            }
        }
    }
}

GET recipes/_search
{
    "query": {
        "common": {
            "steps": {
                "query": "boiling hot water",
                "cutoff_frequency": 0.001,
                "low_freq_operator": "and"
            }
        }
    }
}

GET recipes/_search
{
    "query": {
        "common": {
            "steps": {
                "query": "more cheese",
                "cutoff_frequency": 0.005,
                "high_freq_operator": "or"
            }
        }
    }
}

/*
10. 
A. Create an index items with mapping having following fields:
    item_id: integer field
    name: text field
    stock: integer field
    vendor: object with properties name (text field), contact (keyword), address(geo_point)
*/

PUT store
{
    "mappings": {
        "_doc": {
            "dynamic": false,
            "properties": {
                "item_id": {
                    "type": "integer"
                },
                "name": {
                    "type": "text"
                },
                "stock": {
                    "type": "integer"
                },
                "vendor": {
                    "properties": {
                        "name": {
                            "type": "text"
                        },
                        "contact": {
                            "type": "keyword"
                        },
                        "address": {
                            "type": "geo_point"
                        }
                    } 
                }
            }
        }
    }
}

/*
B. Bulk insert at least 5 documents into items index.
*/

PUT store/_doc/_bulk
{"index":{"_id":1}}
{"item_id":1,"name":"Sugar","stock": 300, "vendor": {"name": "Big Mart", "contact": "01556738", "address": {"lat": 65.43, "lon": 43.54}}}
{"index":{"_id":2}}
{"item_id":2,"name":"Shampoo","stock": 150, "vendor": {"name": "Clinc Plus", "contact": "01665362", "address": {"lat": 67.73, "lon": 34.74}}}
{"index":{"_id":3}}
{"item_id":3,"name":"Detergent","stock": 200, "vendor": {"name": "Surf Excel", "contact": "01419203", "address": {"lat": 66.56, "lon": 39.78}}}
{"index":{"_id":4}}
{"item_id":4,"name":"Lipstick","stock": 100, "vendor": {"name": "Loreal", "contact": "01558732", "address": {"lat": 64.21, "lon": 42.74}}}
{"index":{"_id":5}}
{"item_id":5,"name":"Handcream","stock": 500, "vendor": {"name": "Himani", "contact": "01437283", "address": {"lat": 66.32, "lon": 47.34}}}

/*
C. Try performing geo bounding box and geo distance queries in the vendor’s address.
*/

GET store/_search
{
    "query": {
        "bool": {
            "filter": {
                "geo_bounding_box": {
                    "vendor.address": {
                        "top_left": {
                            "lat": 66.00,
                            "lon": 42.00
                        },
                        "bottom_right": {
                            "lat": 62.00,
                            "lon": 50.00
                        }
                    }
                }
            }
        }
    }
}

/*
D. Create an index category_items with mapping having following fields:
category: text field
Items: array of item_ids, that means, array of integer
*/

PUT category_items
{
    "mappings": {
        "_doc": {
            "dynamic": false,
            "properties": {
                "category": {
                    "type": "text"
                },
                "items": {
                    "type": "nested",
                    "properties": {
                        "item_ids": {
                            "type": "integer"
                        }
                    }
                }
            }
        }
    }
}

/*
E. Insert two documents in category_items: one related to cosmetic category and next related to household 
category. When inserting documents in category_items, please note that each category should have at least 
one item_id inserted in items index. 
*/

PUT category_items/_doc/1
{
    "category": "cosmetic",
    "items": [
        {
            "item_ids": 4
        },
        {
            "item_ids": 5
        }
    ]
}

PUT category_items/_doc/2
{
    "category": "household",
    "items": [
        {
            "item_ids": 1
        },
        {
            "item_ids": 3
        }
    ]
}

/*
F. Using terms query with terms lookup mechanism, find the items from items index 
that belong to cosmetic category.
*/

GET store/_search
{
  "query": {
    "terms": {
      "item_id": {
        "index": "category_items",
        "type": "_doc",
        "id": 1,
        "path": "items.item_ids"
      }
    }
  }
}


/*
Related to orders-bulk.json

11. Create filtered alias of documents of orders index fulfilling the following conditions:
status: processed or completed
sales_channel: phone and app
Having total_amount >=100
*/

POST /_aliases
{
    "actions": [
        {
            "add": {
                "index": "orders",
                "alias": "order_sample",
                "filter": {
                    "bool": {
                        "must": [
                            {
                                "query_string": {
                                    "default_field": "status",
                                    "query": "(processed) or (completed)" 
                                }
                            },
                            {
                                "query_string": {
                                    "default_field": "sales_channel",
                                    "query": "(phone) and (app)" 
                                }
                            },
                            {
                                "range": {
                                    "total_amount": {
                                        "gte": 100
                                    }
                                }
                            }
                        ]
                    }
                }
            }
        }
    ]
}

/*
12. Perform the following queries in the filtered alias. Design your search conditions yourself.
Term query
Range query
Prefix query
Wildcard Query
Match
Fuzzy Match
*/

/* Term Query */
GET order_sample/_search
{
    "query": {
        "term": {
            "status": {
                "value": "completed"
            }
        }
    }
}

/* Range Query */
GET order_sample/_search
{
    "query": {
        "range": {
            "total_amount": {
                "gte": 150,
                "lte": 200
            }
        }
    }
}

/*  Prefix Query */
GET order_sample/_search
{
    "query": {
        "prefix": {
            "salesman.name": "lena"
        }
    }
}

/* Wildcard Queries */
GET order_sample/_search
{
    "query": {
        "wildcard": {
            "salesman.name": "l??a"
        }
    }
}

GET order_sample/_search
{
    "query": {
        "wildcard": {
            "salesman.name": "l*a"
        }
    }
}

/* Match Query */
GET order_sample/_search
{
    "query": {
        "match": {
            "salesman.name": "rene"
        }
    }
}

/* Fuzzy Match */
GET order_sample/_search
{
    "query": {
        "match": {
            "salesman.name": {
                "query": "lena",
                "fuzziness": 2
            }
        }
    }
}