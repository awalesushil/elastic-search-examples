/* 
    * Assignment 2
    * Date: Feb 06, 2019
    * Author: Sushil Awale
*/

/* 
1. Create an index having fields of the following types. Disable dynamic mapping for this index.
Hint: This means to create an index with mapping having following types in properties.

Text
Keyword
Long
Double
Boolean
geo_point
Date (allowing two different formats yyyy/MM/dd and MM-dd-yyyy, or any other formats that you prefer)
Integer Range
Array with text type values
Inner Object (needs to have at least two properties)
Nested object (need to have at least two properties)

*/

PUT service_center
{
    "mappings": {
        "_doc": {
            "dynamic": false,
            "properties": {
                "name": {
                    "type": "text"
                },
                "contact_number": {
                    "type": "keyword"
                },
                "registration_id": {
                    "type": "long"
                },
                "area_in_sq_ft": {
                    "type": "double"
                },
                "authorized": {
                    "type": "boolean"
                },
                "location": {
                    "type": "geo_point"
                },
                "established_date": {
                    "type": "date",
                    "format": "yyyy-MM-dd||MM-dd-yyyy"
                },
                "daily_repairs": {
                    "type": "integer_range"
                },
                "days_closed": {
                    "type": "text"
                },
                "address": {
                    "properties": {
                        "district": {
                            "type": "text"
                        },
                        "state": {
                            "type": "integer"
                        }
                    }
                },
                "bikes_repaired": {
                    "type": "nested",
                    "properties": {
                        "company": {
                            "type": "text"
                        },
                        "category": {
                            "type": "text"
                        }
                    }
                }
            }
        }
    }
}

/* 2. Insert two valid documents, that is, with fields which match the types mentioned in (1) */

PUT service_center/_doc/1
{
    "name": "Patan Repair Center",
    "contact_number": "01-5531398",
    "registration_id": "83120482490128024",
    "area_in_sq_ft": "232.142",
    "authorized": true,
    "location": {
        "lat": 65.42,
        "lon": 32.23
    },
    "established_date": "2017-04-12",
    "daily_repairs": {
        "gte": 30,
        "lte": 60
    },
    "days_closed": ["Sat", "Sun"],
    "address": {
        "district": "Lalitpur",
        "state": 3
    },
    "bikes_repaired": [{
        "company": "Yamaha",
        "category": "Sports"
    },{
        "company": "Honda",
        "category": "Offroad"
    }
    ]
}

PUT service_center/_doc/2
{
    "name": "Bhaktapur Repair Center",
    "contact_number": "01-66541235",
    "registration_id": "794327040241732",
    "area_in_sq_ft": "500.32",
    "authorized": true,
    "location": {
        "lat": 66.62,
        "lon": 34.53
    },
    "established_date": "2014-10-23",
    "daily_repairs": {
        "gte": 10,
        "lte": 25
    },
    "days_closed": ["Sat", "Wed"],
    "address": {
        "district": "Bhaktapur",
        "state": 3
    },
    "bikes_repaired": [{
        "company": "KTM",
        "category": "Sports"
    },{
        "company": "Bajaj",
        "category": "Economy"
    }
    ]
}

/* 3. Try inserting an invalid document to see the exception thrown. */

PUT service_center/_doc/1
{
    "name": "Kathmandu Repair Center",
    "contact_number": "01-5531398",
    "registration_id": "RH142940J24152",
    "area_in_sq_ft": "738.542",
    "authorized": true,
    "location": {
        "lat": 63.22,
        "lon": 31.73
    },
    "established_date": "Jan 17, 2012",
    "daily_repairs": {
        "gte": 70,
        "lte": 90
    },
    "days_closed": ["Sat", "Sun"],
    "address": {
        "district": "Kathmandu",
        "state": 3
    },
    "bikes_repaired": [{
        "company": "Aprilla",
        "category": "Sports"
    },{
        "company": "Suzuki",
        "category": "Dirt"
    }
    ]
}

/* Exception Thrown */

{
    "error": {
        "root_cause": [
            {
                "type": "mapper_parsing_exception",
                "reason": "failed to parse field [registration_id] of type [long]"
            }
        ],
        "type": "mapper_parsing_exception",
        "reason": "failed to parse field [registration_id] of type [long]",
        "caused_by": {
            "type": "illegal_argument_exception",
            "reason": "For input string: \"RH142940J24152\""
        }
    },
    "status": 400
}

/* 4. Use curl command along with _bulk API to insert the documents available in the file 
provided in mail (name: accounts.json) into accounts index. */

curl -H "Content-Type: application/json" 
    -XPOST "http://localhost:9200/accounts/_doc/_bulk?pretty" 
    --data-binary @accounts.json

/* 
5. Perform queries using Request URI to find the following:


- all documents
*/

http://localhost:9200/accounts/_doc/_search

/*
- age greater than equal to 30 and less than equal to 70
*/

http://localhost:9200/accounts/_doc/_search?q=age: [30 TO 70]

/*
- females with age less than equals 25
*/

http://localhost:9200/accounts/_doc/_search?q=gender:F AND age: [* TO 25]

/*
- males belonging to ME state
*/

http://localhost:9200/accounts/_doc/_search?q=gender:M AND state:ME


/*

6. Perform following _update_by_query operations on accounts:

a. Add a new field expense_list whose value is empty array [ ] for all documents.
*/

POST accounts/_update_by_query?conflicts=proceed
{
    "query": {
        "match_all": {}
    },
    "script": {
        "lang": "painless",
        "source": "ctx._source.expense_list = []"
    }
}

/*
b. Add a value ‘student_loan’ into the expense_list array for members 
having age greater than equals 10 and less than equals 25
*/

POST accounts/_update_by_query?conflicts=proceed
{
    "query": {
        "range": {
            "age": {
                "gte": 10,
                "lte": 25
            }
        }
    },
    "script": {
        "lang": "painless",
        "source": "ctx._source.expense_list.add('student_loan')"
    }
}

/*
c. Add two values ‘car_loan’ and ‘house_loan’ into expense_list array for members 
having age greater than 25 and less than equals 50
*/

POST accounts/_update_by_query?conflicts=proceed
{
    "query": {
        "range": {
            "age": {
                "gt": 25,
                "lte": 50
            }
        }
    },
    "script": {
        "lang": "painless",
        "source": """
            for (int i = 0; i < 2; i++) {
                String item = params.list[i];
                if (!ctx._source.expense_list.contains(item)) {
                    ctx._source.expense_list.add(item)
                }
            }
        """,
        "params": {
            "list": ["car_loan", "house_loan"]
        }
    }
}

/*
d. Add a value ‘recreation’ for members having balance greater than equals 40000.
*/

POST accounts/_update_by_query?conflicts=proceed
{
    "query": {
        "range": {
            "balance": {
                "gte": 40000
            } 
        }
    },
    "script": {
        "lang": "painless",
        "source": "ctx._source.expense_list.add('student_loan')"
    }
}

/*
e. Decrease the balance by 2000 of members of state PA.
*/

POST accounts/_update_by_query?conflicts=proceed
{
    "query": {
        "match": {
            "state": "PA"
        }
    },
    "script": {
        "lang": "painless",
        "source": "ctx._source.balance -= 2000"
    }
}

/*
7. Perform _delete_by_query to delete all records belonging to state: KY.
*/

POST accounts/_delete_by_query
{
    "query": {
        "match": {
            "state": "KY"
        }
    }
}

/*
8. Perform following queries using Request Body with any values you want to:
- Term query
- Range query
- Prefix query
- Wildcard Query
*/

GET accounts/_search
{
    "query": {
        "match": {
            "gender": "M"
        }
    }
}

GET accounts/_search
{
    "query": {
        "range": {
            "balance": {
                "gt": 10000,
                "lt": 40000
            }
        }
    }
}

GET accounts/_search
{
    "query": {
        "prefix": {
            "city": "m"
        }
    }
}

GET accounts/_search
{
    "query": {
        "wildcard": {
            "city": "w*y"
        }
    }
}

/*
9. Do the following question:
A. Create an index college having following fields:
batch (integer type): example values, 2017, 2018
students (nested type, i.e. array of inner objects): each inner object can have two properties id and name.
*/

PUT college
{
    "mappings": {
        "_doc": {
            "dynamic": false,
            "properties": {
                "batch": {
                    "type": "integer"
                },
                "student": {
                    "type": "nested",
                    "properties": {
                        "id": {
                            "type": "integer"
                        },
                        "name": {
                            "type": "text"
                        }
                    }
                }
            }
        }
    }
}

/*
B. Insert a document with certain id (example, 1), your batch (example, 2017), 
and an array of 3 students in index college.
*/

PUT college/_doc/1
{
    "batch": 2019,
    "student": [
        {
            "id": 501,
            "name": "Andrew Martin"
        },
        {
            "id": 502,
            "name": "Bob Johns"
        },
        {
            "id": 503,
            "name": "Cateyln Stark"
        }
    ]
}

/*
C. Create an index workshop having following fields
- students_id
- workshop_about
- enrolled_year
*/

PUT workshop
{
    "mappings": {
        "_doc": {
            "dynamic": false,
            "properties": {
                "student_id": {
                    "type": "integer"
                },
                "workshop_about": {
                    "type": "text"
                },
                "enrolled_year": {
                    "type": "date",
                    "format": "yyyy"
                }
            }
        }
    }
}

/*
D. Bulk insert 5 documents in index workshop.
*/

PUT workshop/_doc/_bulk
{"index":{"_id":1}}
{"id":307,"workshop_about":"Elastic Search","enrolled_year":"2016"}
{"index":{"_id":2}}
{"id":443,"workshop_about":"Machine Learning","enrolled_year":"2017"}
{"index":{"_id":3}}
{"id":503,"workshop_about":"Android Programming","enrolled_year":"2017"}
{"index":{"_id":4}}
{"id":501,"workshop_about":"Python Programming","enrolled_year":"2018"}
{"index":{"_id":5}}
{"id":615,"workshop_about":"Elastic Search","enrolled_year":"2019"}

/*
E. Using terms query, find the students of your batch enrolled in any workshop.
*/

GET workshop/_search
{
  "query": {
    "terms": {
      "student": {
        "index": "college",
        "type": "_doc",
        "id": 1,
        "path": "id"
      }
    }
  }
}
