/* 
    * Assignment 1
    * Date: Jan 30, 2019
    * Author: Sushil Awale
*/

/* 1. Create an index hiking (Use default setting of 5 shards and 1 replica) */

PUT hiking

/* 
2. Add one or more documents in the index created consisting the following fields:
    * hiked_on (with date value of format yyyy/MM/dd, example “2019/01/26”)
    * coordinator (with string value, example “Jane Smith”)
    * total_students (with integer value, example 12)
    * cost (with floating point value, example 3456.67)
    * bus_booked (with boolean, example true/false)
    * checklist (with array of string, example [“a”,”b”])
    * test_field (any kind of value you want)
*/

POST hiking/_doc/1
{
    "hiked_on": "2019/01/28",
    "coordinator": "John Smith",
    "total_students": 14,
    "cost": 14578.52,
    "bus_booked": true,
    "checklist": ["Water Bottle","Sun Glass","Energy Bar"],
    "departed_at": "07:00 AM",
    "arrived_at": "06:00 PM",
    "duration": 11
}

POST hiking/_doc/2
{
    "hiked_on": "2019/01/29",
    "coordinator": "Adam White",
    "total_students": 15,
    "cost": 16008.42,
    "bus_booked": false,
    "checklist": ["Sun Screen","Cap","Juice"],
    "departed_at": "09:00 AM",
    "arrived_at": "04:00 PM",
    "duration": 7
}

POST hiking/_doc/3
{
    "hiked_on": "2019/01/30",
    "coordinator": "Rose Bloom",
    "total_students": 20,
    "cost": 18973.60,
    "bus_booked": true,
    "checklist": ["Rain Coat","Boots","Umbrella"],
    "departed_at": "08:00 AM",
    "arrived_at": "07:00 PM",
    "duration": 11
}

/* 3. Practice retrieving documents by various methods shown in examples. */

GET hiking/_doc/1

GET hiking/_doc/_search

/* Get source directly */
GET hiking/_doc/1/_source

/* Exclude source */
GET hiking/_doc/1?_source=false

/* Get selective fiels */
GET hiking/_doc/1?_source_include=coordinator,total_students

/* Exclude some fields */
GET hiking/_doc/1?_source_exclude=duration

/* 4. Update any inserted document by adding a new field without using script. (Related to normal update) */

POST hiking/_doc/1/_update
{
    "doc": {
        "difficulty": "moderate"
    }
}

/*
5. Update any inserted document to add a new field and remove field added in (4) at the same time using script.
(Related to scripted update)
*/

POST hiking/_doc/1/_update
{
    "script": {
        "lang": "painless",
        "source": """
            ctx._source.level = 3; 
            ctx._source.remove('difficulty')
        """
    }
}

/*
6. Update any field of any inserted document (say total_students) to change its value. Make use of params. 
(Related to scripted update)
*/

POST hiking/_doc/3/_update
{
    "script": {
        "lang": "painless",
        "source": "ctx._source.total_students = params.total_students",
        "params": {
            "total_students": 21
        }
    }
}

/* 7. Use loop and condition to carry out any operation in any inserted document (Related to scripted update)*/

POST hiking/_doc/1/_update
{
    "script": {
        "lang": "painless",
        "source": """
            for (int i = 0; i < 3; i++) {
                String item = params.checklist[i];
                if (!ctx._source.checklist.contains(item)) {
                    ctx._source.checklist.add(item)
                }
            }
        """,
        "params": {
            "checklist": ["Camera", "Water Bottle", "Whistle"]
        }
    }
}